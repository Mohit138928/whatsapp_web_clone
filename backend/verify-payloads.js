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
    log("Connected to MongoDB", "green");
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

// Function to display all processed messages
async function displayProcessedMessages() {
  try {
    log("\nMessages from WhatsApp Business API Payloads", "bold");
    log("================================================", "yellow");

    // Get messages that came from the payload processor (have webhook_data.filename)
    const payloadMessages = await Message.find({
      "webhook_data.filename": { $exists: true },
    }).sort({ timestamp: 1 });

    if (payloadMessages.length === 0) {
      log("No messages found from payload processing", "red");
      return;
    }

    log(
      `Found ${payloadMessages.length} messages from payload processing:\n`,
      "blue"
    );

    // Group messages by conversation
    const conversations = {};
    payloadMessages.forEach((msg) => {
      if (!conversations[msg.wa_id]) {
        conversations[msg.wa_id] = [];
      }
      conversations[msg.wa_id].push(msg);
    });

    // Display each conversation
    Object.keys(conversations).forEach((wa_id, index) => {
      const messages = conversations[wa_id];
      const contactName = messages[0].name.includes("You")
        ? messages.find((m) => !m.name.includes("You"))?.name || "Unknown"
        : messages[0].name;

      log(`\nConversation ${index + 1}: ${contactName} (${wa_id})`, "cyan");
      log("".padEnd(50, "-"), "cyan");

      messages.forEach((msg) => {
        const timestamp = msg.timestamp.toLocaleString();
        const statusIcon = getStatusIcon(msg.status);
        const typeColor = msg.type === "incoming" ? "green" : "blue";

        log(`[${timestamp}] ${msg.name} (${msg.type}):`, typeColor);
        log(`  "${msg.text}" ${statusIcon}`, "reset");

        if (msg.webhook_data?.filename) {
          log(`  Source: ${msg.webhook_data.filename}`, "yellow");
        }

        if (msg.webhook_data?.status_updates) {
          const statusUpdate = msg.webhook_data.status_updates;
          log(
            `  Status updated to '${statusUpdate.status}' from ${statusUpdate.filename}`,
            "magenta"
          );
        }

        log(""); // Empty line for readability
      });
    });
  } catch (error) {
    log(`Error displaying messages: ${error.message}`, "red");
  }
}

// Function to get status icon
function getStatusIcon(status) {
  switch (status) {
    case "sent":
      return "✓";
    case "delivered":
      return "✓✓";
    case "read":
      return "✓✓ (read)";
    case "failed":
      return "❌";
    default:
      return "○";
  }
}

// Function to display contacts
async function displayContacts() {
  try {
    log("\nContacts Extracted from Payloads", "bold");
    log("===================================", "yellow");

    const contacts = await Contact.find().sort({ name: 1 });

    if (contacts.length === 0) {
      log("No contacts found", "red");
      return;
    }

    contacts.forEach((contact, index) => {
      log(`${index + 1}. ${contact.name}`, "green");
      log(`   WhatsApp ID: ${contact.wa_id}`, "blue");
      log(`   Phone: ${contact.phone || "N/A"}`, "blue");
      log(`   Last Seen: ${contact.last_seen.toLocaleString()}`, "blue");
      log(`   Online: ${contact.is_online ? "🟢" : "🔴"}`, "blue");
      log("");
    });
  } catch (error) {
    log(`Error displaying contacts: ${error.message}`, "red");
  }
}

// Function to display statistics
async function displayStatistics() {
  try {
    log("\nProcessing Statistics", "bold");
    log("=======================", "yellow");

    // Total counts
    const totalMessages = await Message.countDocuments();
    const payloadMessages = await Message.countDocuments({
      "webhook_data.filename": { $exists: true },
    });
    const totalContacts = await Contact.countDocuments();

    log(`Total Messages in DB: ${totalMessages}`, "blue");
    log(`Messages from Payloads: ${payloadMessages}`, "blue");
    log(`Total Contacts: ${totalContacts}`, "blue");

    // Message type breakdown for payload messages
    const typeBreakdown = await Message.aggregate([
      { $match: { "webhook_data.filename": { $exists: true } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    log("\nPayload Messages by Type:", "cyan");
    typeBreakdown.forEach((item) => {
      log(`   ${item._id}: ${item.count}`, "cyan");
    });

    // Status breakdown for payload messages
    const statusBreakdown = await Message.aggregate([
      { $match: { "webhook_data.filename": { $exists: true } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    log("\nPayload Messages by Status:", "magenta");
    statusBreakdown.forEach((item) => {
      log(`   ${item._id}: ${item.count}`, "magenta");
    });

    // Messages with status updates
    const messagesWithUpdates = await Message.countDocuments({
      "webhook_data.status_updates": { $exists: true },
    });

    log(`\nMessages with Status Updates: ${messagesWithUpdates}`, "yellow");

    // File source breakdown
    const fileBreakdown = await Message.aggregate([
      { $match: { "webhook_data.filename": { $exists: true } } },
      { $group: { _id: "$webhook_data.filename", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    log("\nMessages by Source File:", "green");
    fileBreakdown.forEach((item) => {
      log(`   ${item._id}: ${item.count} items`, "green");
    });
  } catch (error) {
    log(`Error displaying statistics: ${error.message}`, "red");
  }
}

// Function to verify data integrity
async function verifyDataIntegrity() {
  try {
    log("\nData Integrity Check", "bold");
    log("======================", "yellow");

    // Check for messages without proper IDs
    const messagesWithoutId = await Message.countDocuments({
      $and: [{ id: { $exists: false } }, { meta_msg_id: { $exists: false } }],
    });

    if (messagesWithoutId > 0) {
      log(
        `Found ${messagesWithoutId} messages without proper IDs`,
        "yellow"
      );
    } else {
      log("All messages have proper IDs", "green");
    }

    // Check for duplicate message IDs
    const duplicateIds = await Message.aggregate([
      { $group: { _id: "$id", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    if (duplicateIds.length > 0) {
      log(`Found ${duplicateIds.length} duplicate message IDs`, "yellow");
    } else {
      log("No duplicate message IDs found", "green");
    }

    // Check for orphaned status updates
    const statusUpdates = await Message.find(
      {
        "webhook_data.status_updates": { $exists: true },
      },
      "id meta_msg_id webhook_data.status_updates"
    );

    log(`\nStatus Update Verification:`, "blue");
    statusUpdates.forEach((msg) => {
      const update = msg.webhook_data.status_updates;
      log(
        `   Message ${msg.id}: Status updated to '${update.status}' from ${update.filename}`,
        "blue"
      );
    });
  } catch (error) {
    log(`Error verifying data integrity: ${error.message}`, "red");
  }
}

// Main verification function
async function verifyProcessedData() {
  log("🔍 WhatsApp Business API Payload Verification", "bold");
  log("=============================================", "yellow");

  // Connect to database
  await connectDB();

  try {
    await displayStatistics();
    await displayContacts();
    await displayProcessedMessages();
    await verifyDataIntegrity();

    log("\nVerification completed successfully!", "bold");
  } catch (error) {
    log(`Verification failed: ${error.message}`, "red");
  }

  // Close database connection
  await mongoose.connection.close();
  log("\nDatabase connection closed", "blue");
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifyProcessedData().catch((error) => {
    log(`Verification failed: ${error.message}`, "red");
    process.exit(1);
  });
}

module.exports = {
  verifyProcessedData,
  displayProcessedMessages,
  displayContacts,
  displayStatistics,
};
