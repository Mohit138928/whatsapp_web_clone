const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// ANSI color codes for terminal output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/whatsapp",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    log("✅ Connected to MongoDB", "green");
  } catch (error) {
    log(`MongoDB connection error: ${error.message}`, "red");
    process.exit(1);
  }
}

// Message Schema
const messageSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    meta_msg_id: { type: String },
    wa_id: { type: String, required: true, index: true },
    phone: { type: String },
    name: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ["incoming", "outgoing"], required: true },
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    from: { type: String },
    to: { type: String },
    message_type: { type: String, default: "text" },
    webhook_data: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema, "processed_messages");

// Contact Schema
const contactSchema = new mongoose.Schema(
  {
    wa_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    last_seen: { type: Date, default: Date.now },
    is_online: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model("Contact", contactSchema);

// Function to read all JSON files from the payloads directory
function readPayloadFiles(directory) {
  try {
    const files = fs.readdirSync(directory);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    log(`Found ${jsonFiles.length} JSON files in ${directory}`, "blue");

    const payloads = [];
    for (const file of jsonFiles) {
      const filePath = path.join(directory, file);
      const content = fs.readFileSync(filePath, "utf8");
      const payload = JSON.parse(content);
      payloads.push({ filename: file, data: payload });
    }

    return payloads;
  } catch (error) {
    log(`Error reading payload files: ${error.message}`, "red");
    return [];
  }
}

// Function to extract contact information from payload
function extractContactInfo(payload) {
  const contacts = [];

  if (payload.metaData && payload.metaData.entry) {
    for (const entry of payload.metaData.entry) {
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.value && change.value.contacts) {
            for (const contact of change.value.contacts) {
              contacts.push({
                wa_id: contact.wa_id,
                name: contact.profile?.name || `Contact ${contact.wa_id}`,
                phone: contact.wa_id,
              });
            }
          }
        }
      }
    }
  }

  return contacts;
}

// Function to process message payloads
async function processMessages(payload, filename) {
  let processedCount = 0;

  if (!payload.metaData || !payload.metaData.entry) {
    log(`No metaData.entry found in ${filename}`, "yellow");
    return processedCount;
  }

  // Extract and save contact information
  const contacts = extractContactInfo(payload);
  for (const contactInfo of contacts) {
    try {
      await Contact.findOneAndUpdate(
        { wa_id: contactInfo.wa_id },
        {
          wa_id: contactInfo.wa_id,
          name: contactInfo.name,
          phone: contactInfo.phone,
          last_seen: new Date(),
        },
        { upsert: true }
      );
    } catch (error) {
      // Ignore duplicate key errors for contacts
    }
  }

  for (const entry of payload.metaData.entry) {
    if (!entry.changes) continue;

    for (const change of entry.changes) {
      if (!change.value) continue;

      // Process messages
      if (change.value.messages) {
        for (const message of change.value.messages) {
          try {
            // Determine message type (incoming/outgoing)
            const businessPhone = change.value.metadata?.display_phone_number;
            const messageType =
              message.from === businessPhone ? "outgoing" : "incoming";

            // Find contact info
            const contact =
              change.value.contacts?.find((c) => c.wa_id === message.from) ||
              contacts.find((c) => c.wa_id === message.from);

            const messageData = {
              id: message.id,
              meta_msg_id: message.id,
              wa_id:
                messageType === "incoming"
                  ? message.from
                  : change.value.contacts?.[0]?.wa_id || message.from,
              phone: message.from,
              name:
                messageType === "incoming"
                  ? contact?.profile?.name ||
                    contact?.name ||
                    `Contact ${message.from}`
                  : "You",
              text:
                message.text?.body ||
                message.interactive?.body?.text ||
                "Media message",
              type: messageType,
              timestamp: new Date(parseInt(message.timestamp) * 1000),
              status: messageType === "outgoing" ? "sent" : "delivered",
              from: message.from,
              to: businessPhone,
              message_type: message.type || "text",
              webhook_data: {
                original_payload: payload,
                message_data: message,
                processed_at: new Date(),
                filename: filename,
              },
            };

            // Check if message already exists
            const existingMessage = await Message.findOne({
              $or: [{ id: message.id }, { meta_msg_id: message.id }],
            });

            if (existingMessage) {
              log(
                `Message already exists: ${message.id} - Skipping`,
                "yellow"
              );
              continue;
            }

            // Save new message
            const newMessage = new Message(messageData);
            await newMessage.save();

            processedCount++;
            log(
              `Processed message: ${message.id} | Type: ${messageType} | From: ${messageData.name}`,
              "green"
            );
          } catch (error) {
            log(
              `Error processing message ${message.id}: ${error.message}`,
              "red"
            );
            if (error.code === 11000) {
              log(`   Duplicate message ID - skipping`, "yellow");
            }
          }
        }
      }

      // Process status updates
      if (change.value.statuses) {
        for (const status of change.value.statuses) {
          try {
            const updateResult = await Message.findOneAndUpdate(
              {
                $or: [
                  { id: status.id },
                  { meta_msg_id: status.meta_msg_id || status.id },
                ],
              },
              {
                status: status.status,
                $set: {
                  "webhook_data.status_updates": {
                    status: status.status,
                    timestamp: new Date(parseInt(status.timestamp) * 1000),
                    processed_at: new Date(),
                    filename: filename,
                  },
                },
              },
              { new: true }
            );

            if (updateResult) {
              processedCount++;
              log(
                `Updated message status: ${status.id} → ${status.status}`,
                "cyan"
              );
            } else {
              log(
                `Message not found for status update: ${status.id}`,
                "yellow"
              );

              // Log available message IDs for debugging
              const availableMessages = await Message.find(
                {},
                "id meta_msg_id"
              ).limit(5);
              log(
                `   Available message IDs: ${availableMessages
                  .map((m) => m.id || m.meta_msg_id)
                  .join(", ")}`,
                "yellow"
              );
            }
          } catch (error) {
            log(
              `Error updating status for ${status.id}: ${error.message}`,
              "red"
            );
          }
        }
      }
    }
  }

  return processedCount;
}

// Function to display processing summary
async function displaySummary() {
  try {
    const totalMessages = await Message.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const messagesByType = await Message.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);
    const messagesByStatus = await Message.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    log("\nProcessing Summary", "bold");
    log("==================", "yellow");
    log(`Total Messages: ${totalMessages}`, "blue");
    log(`Total Contacts: ${totalContacts}`, "blue");

    log("\nMessages by Type:", "cyan");
    messagesByType.forEach((item) => {
      log(`   ${item._id}: ${item.count}`, "cyan");
    });

    log("\nMessages by Status:", "magenta");
    messagesByStatus.forEach((item) => {
      log(`   ${item._id}: ${item.count}`, "magenta");
    });

    // Show recent messages
    const recentMessages = await Message.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .select("name text type status timestamp");

    log("\nRecent Messages:", "green");
    recentMessages.forEach((msg) => {
      const timeStr = msg.timestamp.toLocaleString();
      log(
        `   ${msg.name}: "${msg.text.substring(0, 50)}..." [${msg.type}/${
          msg.status
        }] (${timeStr})`,
        "green"
      );
    });
  } catch (error) {
    log(`Error generating summary: ${error.message}`, "red");
  }
}

// Main processing function
async function processWhatsAppPayloads() {
  log("WhatsApp Business API Payload Processor", "bold");
  log("==========================================", "yellow");

  // Connect to database
  await connectDB();

  // Define payloads directory
  const payloadsDir = path.join(__dirname, "whatsapp sample payloads");

  if (!fs.existsSync(payloadsDir)) {
    log(`Payloads directory not found: ${payloadsDir}`, "red");
    log(`Please create the directory and add your JSON payload files.`, "red");
    process.exit(1);
  }

  // Read all payload files
  const payloads = readPayloadFiles(payloadsDir);

  if (payloads.length === 0) {
    log("No JSON payload files found", "red");
    process.exit(1);
  }

  let totalProcessed = 0;

  // Sort payloads by filename to ensure proper order
  payloads.sort((a, b) => a.filename.localeCompare(b.filename));

  // Process each payload
  for (const { filename, data } of payloads) {
    log(`\nProcessing: ${filename}`, "blue");

    try {
      const processed = await processMessages(data, filename);
      totalProcessed += processed;

      if (processed > 0) {
        log(`Processed ${processed} items from ${filename}`, "green");
      } else {
        log(`No items processed from ${filename}`, "yellow");
      }
    } catch (error) {
      log(`Error processing ${filename}: ${error.message}`, "red");
    }
  }

  // Display summary
  log(`\nProcessing completed!`, "bold");
  log(`Total items processed: ${totalProcessed}`, "green");

  await displaySummary();

  // Close database connection
  await mongoose.connection.close();
  log("\n🔌 Database connection closed", "blue");
}

// Error handling
process.on("unhandledRejection", (error) => {
  log(`Unhandled rejection: ${error.message}`, "red");
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  log(`Uncaught exception: ${error.message}`, "red");
  process.exit(1);
});

// Run the processor if this file is executed directly
if (require.main === module) {
  processWhatsAppPayloads().catch((error) => {
    log(`Processing failed: ${error.message}`, "red");
    process.exit(1);
  });
}

module.exports = {
  processWhatsAppPayloads,
  readPayloadFiles,
  processMessages,
  extractContactInfo,
};
