const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/whatsapp",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

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

// Sample data
const sampleContacts = [
  {
    wa_id: "1234567890",
    name: "Alice Johnson",
    phone: "+1234567890",
    avatar: null,
    is_online: true,
  },
  {
    wa_id: "0987654321",
    name: "Bob Smith",
    phone: "+0987654321",
    avatar: null,
    is_online: false,
  },
  {
    wa_id: "5555666777",
    name: "Carol Davis",
    phone: "+5555666777",
    avatar: null,
    is_online: true,
  },
  {
    wa_id: "1111222333",
    name: "David Wilson",
    phone: "+1111222333",
    avatar: null,
    is_online: false,
  },
];

const sampleMessages = [
  // Alice's conversation
  {
    id: "msg_1",
    wa_id: "1234567890",
    name: "Alice Johnson",
    text: "Hey! How are you doing?",
    type: "incoming",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    status: "delivered",
  },
  {
    id: "msg_2",
    wa_id: "1234567890",
    name: "You",
    text: "Hi Alice! I'm doing great, thanks for asking. How about you?",
    type: "outgoing",
    timestamp: new Date(Date.now() - 3500000), // 58 minutes ago
    status: "read",
  },
  {
    id: "msg_3",
    wa_id: "1234567890",
    name: "Alice Johnson",
    text: "I'm good too! Just working on some new projects. Are you free for a call later?",
    type: "incoming",
    timestamp: new Date(Date.now() - 3400000), // 56 minutes ago
    status: "delivered",
  },
  {
    id: "msg_4",
    wa_id: "1234567890",
    name: "You",
    text: "Sure! I'll be free after 5 PM. What time works for you?",
    type: "outgoing",
    timestamp: new Date(Date.now() - 3300000), // 55 minutes ago
    status: "read",
  },

  // Bob's conversation
  {
    id: "msg_5",
    wa_id: "0987654321",
    name: "Bob Smith",
    text: "Did you see the game last night?",
    type: "incoming",
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    status: "delivered",
  },
  {
    id: "msg_6",
    wa_id: "0987654321",
    name: "You",
    text: "Yes! What a comeback in the final quarter!",
    type: "outgoing",
    timestamp: new Date(Date.now() - 7100000), // ~2 hours ago
    status: "read",
  },
  {
    id: "msg_7",
    wa_id: "0987654321",
    name: "Bob Smith",
    text: "I know right! I couldn't believe it when they scored that touchdown",
    type: "incoming",
    timestamp: new Date(Date.now() - 7000000), // ~2 hours ago
    status: "delivered",
  },

  // Carol's conversation
  {
    id: "msg_8",
    wa_id: "5555666777",
    name: "Carol Davis",
    text: "Thanks for helping me with the presentation yesterday!",
    type: "incoming",
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    status: "delivered",
  },
  {
    id: "msg_9",
    wa_id: "5555666777",
    name: "You",
    text: "You're welcome! It turned out great. How did it go with the client?",
    type: "outgoing",
    timestamp: new Date(Date.now() - 86300000), // ~1 day ago
    status: "read",
  },
  {
    id: "msg_10",
    wa_id: "5555666777",
    name: "Carol Davis",
    text: "They loved it! We got the contract 🎉",
    type: "incoming",
    timestamp: new Date(Date.now() - 86200000), // ~1 day ago
    status: "delivered",
  },
  {
    id: "msg_11",
    wa_id: "5555666777",
    name: "You",
    text: "That's amazing! Congratulations! 🎊",
    type: "outgoing",
    timestamp: new Date(Date.now() - 86100000), // ~1 day ago
    status: "read",
  },

  // David's conversation
  {
    id: "msg_12",
    wa_id: "1111222333",
    name: "David Wilson",
    text: "Are we still on for the meeting tomorrow?",
    type: "incoming",
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    status: "delivered",
  },
  {
    id: "msg_13",
    wa_id: "1111222333",
    name: "You",
    text: "Yes, 2 PM at the conference room. I'll send the agenda shortly.",
    type: "outgoing",
    timestamp: new Date(Date.now() - 1700000), // ~28 minutes ago
    status: "sent",
  },

  // Recent message from Alice
  {
    id: "msg_14",
    wa_id: "1234567890",
    name: "Alice Johnson",
    text: "Perfect! 5:30 PM works for me. Talk to you then!",
    type: "incoming",
    timestamp: new Date(Date.now() - 600000), // 10 minutes ago
    status: "delivered",
  },
];

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Clear existing data
    await Message.deleteMany({});
    await Contact.deleteMany({});
    console.log("Cleared existing data");

    // Insert contacts
    await Contact.insertMany(sampleContacts);
    console.log("Inserted sample contacts");

    // Insert messages
    await Message.insertMany(sampleMessages);
    console.log("Inserted sample messages");

    console.log("Database seeding completed successfully!");
    console.log(
      `Inserted ${sampleContacts.length} contacts and ${sampleMessages.length} messages`
    );

    // Show summary
    const chatsCount = await Message.distinct("wa_id").then(
      (ids) => ids.length
    );
    console.log(`Created ${chatsCount} chat conversations`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
