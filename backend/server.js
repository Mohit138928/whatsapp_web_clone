const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

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

// Contact Schema for storing user information
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

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Helper function to group messages by wa_id
async function groupMessagesByWaId() {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).lean();

    const chatsMap = new Map();

    for (const message of messages) {
      const waId = message.wa_id;

      if (!chatsMap.has(waId)) {
        // Try to get contact info, or create default
        let contact = await Contact.findOne({ wa_id: waId });
        if (!contact) {
          contact = {
            wa_id: waId,
            name: message.name || `Contact ${waId}`,
            phone: message.phone || waId,
            avatar: null,
          };
        }

        chatsMap.set(waId, {
          wa_id: waId,
          name: contact.name,
          phone: contact.phone,
          avatar: contact.avatar,
          messages: [],
          unreadCount: 0,
          lastMessage: null,
        });
      }

      const chat = chatsMap.get(waId);
      chat.messages.push(message);
      chat.lastMessage = message;

      // Count unread messages (incoming messages with status not 'read')
      if (message.type === "incoming" && message.status !== "read") {
        chat.unreadCount++;
      }
    }

    // Convert to array and sort by last message timestamp
    const chats = Array.from(chatsMap.values()).sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || 0;
      const bTime = b.lastMessage?.timestamp || 0;
      return new Date(bTime) - new Date(aTime);
    });

    return chats;
  } catch (error) {
    console.error("Error grouping messages:", error);
    return [];
  }
}

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Get all chats grouped by wa_id
app.get("/api/chats", async (req, res) => {
  try {
    const chats = await groupMessagesByWaId();
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// Send a new message
app.post("/api/send", async (req, res) => {
  try {
    const { wa_id, text, type = "outgoing" } = req.body;

    if (!wa_id || !text) {
      return res.status(400).json({ error: "wa_id and text are required" });
    }

    // Create new message
    const messageData = {
      wa_id,
      text,
      type,
      timestamp: new Date(),
      status: "sent",
      name: type === "outgoing" ? "You" : `Contact ${wa_id}`,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const message = new Message(messageData);
    await message.save();

    // Emit to all connected clients
    io.emit("newMessage", messageData);

    res.status(201).json({ success: true, message: messageData });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Webhook endpoint for receiving messages
app.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook received:", JSON.stringify(req.body, null, 2));

    const payload = req.body;

    // Handle different webhook structures
    if (payload.entry && Array.isArray(payload.entry)) {
      // WhatsApp Business API format
      for (const entry of payload.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.value && change.value.messages) {
              await processWhatsAppMessages(change.value);
            }
            if (change.value && change.value.statuses) {
              await processWhatsAppStatuses(change.value);
            }
          }
        }
      }
    } else if (payload.messages || payload.statuses) {
      // Direct message/status format
      if (payload.messages) {
        await processWhatsAppMessages(payload);
      }
      if (payload.statuses) {
        await processWhatsAppStatuses(payload);
      }
    } else {
      // Generic message format
      await processGenericMessage(payload);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Process WhatsApp Business API messages
async function processWhatsAppMessages(value) {
  if (!value.messages) return;

  for (const message of value.messages) {
    try {
      const messageData = {
        id: message.id,
        wa_id: message.from,
        phone: message.from,
        name:
          value.contacts?.find((c) => c.wa_id === message.from)?.profile
            ?.name || `Contact ${message.from}`,
        text:
          message.text?.body ||
          message.interactive?.body?.text ||
          "Media message",
        type: "incoming",
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        status: "delivered",
        from: message.from,
        to: value.metadata?.phone_number_id,
        message_type: message.type,
        webhook_data: message,
      };

      // Check if message already exists
      const existingMessage = await Message.findOne({ id: message.id });
      if (existingMessage) {
        console.log("Message already exists:", message.id);
        continue;
      }

      // Save new message
      const newMessage = new Message(messageData);
      await newMessage.save();

      // Update or create contact
      await Contact.findOneAndUpdate(
        { wa_id: message.from },
        {
          wa_id: message.from,
          name: messageData.name,
          phone: message.from,
          last_seen: new Date(),
          is_online: true,
        },
        { upsert: true }
      );

      // Emit to all connected clients
      io.emit("newMessage", messageData);

      console.log("New message processed:", message.id);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }
}

// Process WhatsApp Business API status updates
async function processWhatsAppStatuses(value) {
  if (!value.statuses) return;

  for (const status of value.statuses) {
    try {
      const updateData = {
        status: status.status,
        timestamp: new Date(parseInt(status.timestamp) * 1000),
      };

      // Update message status by ID
      const result = await Message.findOneAndUpdate(
        { id: status.id },
        updateData,
        { new: true }
      );

      if (result) {
        // Emit status update to all connected clients
        io.emit("messageStatusUpdate", {
          id: status.id,
          wa_id: result.wa_id,
          status: status.status,
        });

        console.log("Status updated:", status.id, "->", status.status);
      } else {
        console.log("Message not found for status update:", status.id);
      }
    } catch (error) {
      console.error("Error processing status:", error);
    }
  }
}

// Process generic message format
async function processGenericMessage(payload) {
  try {
    const messageData = {
      wa_id: payload.wa_id || payload.from,
      phone: payload.phone || payload.from,
      name: payload.name || `Contact ${payload.wa_id || payload.from}`,
      text: payload.text || payload.message,
      type: payload.type || "incoming",
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      status: payload.status || "delivered",
      meta_msg_id: payload.meta_msg_id || payload.message_id,
      webhook_data: payload,
    };

    // Generate ID if not provided
    if (!messageData.id && !messageData.meta_msg_id) {
      messageData.id = `msg_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    // Check for existing message by ID or meta_msg_id
    const existingMessage = await Message.findOne({
      $or: [
        { id: messageData.id },
        { meta_msg_id: messageData.meta_msg_id },
      ].filter(Boolean),
    });

    if (existingMessage) {
      // Update existing message
      const updatedMessage = await Message.findByIdAndUpdate(
        existingMessage._id,
        messageData,
        { new: true }
      );

      io.emit("messageStatusUpdate", {
        id: updatedMessage.id,
        meta_msg_id: updatedMessage.meta_msg_id,
        wa_id: updatedMessage.wa_id,
        status: updatedMessage.status,
      });

      console.log(
        "Message updated:",
        updatedMessage.id || updatedMessage.meta_msg_id
      );
    } else {
      // Create new message
      const newMessage = new Message(messageData);
      await newMessage.save();

      // Update or create contact
      await Contact.findOneAndUpdate(
        { wa_id: messageData.wa_id },
        {
          wa_id: messageData.wa_id,
          name: messageData.name,
          phone: messageData.phone,
          last_seen: new Date(),
          is_online: true,
        },
        { upsert: true }
      );

      io.emit("newMessage", messageData);

      console.log(
        "New message created:",
        newMessage.id || newMessage.meta_msg_id
      );
    }
  } catch (error) {
    console.error("Error processing generic message:", error);
  }
}

// Get messages for a specific wa_id
app.get("/api/chats/:wa_id", async (req, res) => {
  try {
    const { wa_id } = req.params;
    const messages = await Message.find({ wa_id })
      .sort({ timestamp: 1 })
      .lean();

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages for wa_id:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Mark messages as read
app.post("/api/chats/:wa_id/read", async (req, res) => {
  try {
    const { wa_id } = req.params;

    // Update all incoming messages for this wa_id to 'read'
    await Message.updateMany(
      { wa_id, type: "incoming", status: { $ne: "read" } },
      { status: "read" }
    );

    // Emit status update
    io.emit("messageStatusUpdate", {
      wa_id,
      status: "read",
      type: "bulk_read",
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

// Get contacts
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ last_seen: -1 });
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// Create or update contact
app.post("/api/contacts", async (req, res) => {
  try {
    const { wa_id, name, phone, avatar } = req.body;

    if (!wa_id || !name) {
      return res.status(400).json({ error: "wa_id and name are required" });
    }

    const contact = await Contact.findOneAndUpdate(
      { wa_id },
      { wa_id, name, phone, avatar, last_seen: new Date() },
      { upsert: true, new: true }
    );

    res.json(contact);
  } catch (error) {
    console.error("Error creating/updating contact:", error);
    res.status(500).json({ error: "Failed to create/update contact" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `MongoDB: ${
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
    }`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});
