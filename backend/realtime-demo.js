const axios = require("axios");
const io = require("socket.io-client");

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

class RealTimeMessagingDemo {
  constructor(serverUrl = "http://localhost:5000") {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.isConnected = false;
  }

  // Initialize Socket.IO connection
  initializeSocket() {
    return new Promise((resolve, reject) => {
      log("\n🔌 Connecting to Socket.IO server...", "blue");

      this.socket = io(this.serverUrl, {
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        log("✅ Socket.IO connected successfully!", "green");
        log(`   Socket ID: ${this.socket.id}`, "cyan");
        this.isConnected = true;
        resolve();
      });

      this.socket.on("disconnect", (reason) => {
        log(`❌ Socket.IO disconnected: ${reason}`, "red");
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        log(`❌ Connection error: ${error.message}`, "red");
        reject(error);
      });

      this.socket.on("reconnect", (attemptNumber) => {
        log(`🔄 Reconnected after ${attemptNumber} attempts`, "yellow");
        this.isConnected = true;
      });

      // Listen for real-time events
      this.socket.on("newMessage", (messageData) => {
        log(`\n📨 REAL-TIME: New message received!`, "green");
        log(`   From: ${messageData.name} (${messageData.wa_id})`, "cyan");
        log(`   Text: "${messageData.text}"`, "cyan");
        log(`   Type: ${messageData.type}`, "cyan");
        log(`   Status: ${messageData.status}`, "cyan");
        log(
          `   Time: ${new Date(messageData.timestamp).toLocaleTimeString()}`,
          "cyan"
        );
      });

      this.socket.on("messageStatusUpdate", (updateData) => {
        log(`\n📋 REAL-TIME: Message status updated!`, "magenta");
        log(`   Message ID: ${updateData.id}`, "cyan");
        log(`   New Status: ${updateData.status}`, "cyan");
        log(`   Contact: ${updateData.wa_id}`, "cyan");
      });

      this.socket.on("userTyping", (data) => {
        log(`\n⌨️  REAL-TIME: ${data.name} is typing...`, "yellow");
      });

      this.socket.on("userOnlineStatus", (data) => {
        log(
          `\n🟢 REAL-TIME: ${data.wa_id} is now ${
            data.is_online ? "online" : "offline"
          }`,
          "blue"
        );
      });

      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error("Connection timeout"));
        }
      }, 10000);
    });
  }

  // Send a message via API
  async sendMessage(wa_id, text, type = "outgoing") {
    try {
      log(`\n📤 Sending message via API...`, "blue");
      log(`   To: ${wa_id}`, "cyan");
      log(`   Text: "${text}"`, "cyan");
      log(`   Type: ${type}`, "cyan");

      const response = await axios.post(
        `${this.serverUrl}/api/send`,
        {
          wa_id,
          text,
          type,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      if (response.status === 201) {
        log(`✅ Message sent successfully!`, "green");
        log(`   Message ID: ${response.data.message.id}`, "cyan");
        log(`   Status: ${response.data.message.status}`, "cyan");
        return response.data.message;
      }
    } catch (error) {
      log(`❌ Failed to send message: ${error.message}`, "red");
      throw error;
    }
  }

  // Simulate incoming message via webhook
  async simulateIncomingMessage(wa_id, name, text) {
    try {
      log(`\n📥 Simulating incoming message via webhook...`, "blue");
      log(`   From: ${name} (${wa_id})`, "cyan");
      log(`   Text: "${text}"`, "cyan");

      const response = await axios.post(
        `${this.serverUrl}/webhook`,
        {
          wa_id,
          name,
          text,
          type: "incoming",
          timestamp: new Date().toISOString(),
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      if (response.status === 200) {
        log(`✅ Webhook processed successfully!`, "green");
        return true;
      }
    } catch (error) {
      log(`❌ Failed to process webhook: ${error.message}`, "red");
      throw error;
    }
  }

  // Simulate message status update
  async simulateStatusUpdate(messageId, status) {
    try {
      log(`\n📋 Simulating status update via webhook...`, "blue");
      log(`   Message ID: ${messageId}`, "cyan");
      log(`   New Status: ${status}`, "cyan");

      const response = await axios.post(
        `${this.serverUrl}/webhook`,
        {
          id: messageId,
          status: status,
          timestamp: new Date().toISOString(),
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      if (response.status === 200) {
        log(`✅ Status update processed successfully!`, "green");
        return true;
      }
    } catch (error) {
      log(`❌ Failed to process status update: ${error.message}`, "red");
      throw error;
    }
  }

  // Get current chats
  async getChats() {
    try {
      log(`\n📂 Fetching current chats...`, "blue");

      const response = await axios.get(`${this.serverUrl}/api/chats`, {
        timeout: 10000,
      });

      if (response.status === 200) {
        log(`✅ Found ${response.data.length} chats`, "green");
        response.data.forEach((chat, index) => {
          log(
            `   ${index + 1}. ${chat.name} (${chat.wa_id}) - ${
              chat.messages.length
            } messages`,
            "cyan"
          );
        });
        return response.data;
      }
    } catch (error) {
      log(`❌ Failed to fetch chats: ${error.message}`, "red");
      throw error;
    }
  }

  // Wait for a specified time
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Run comprehensive demo
  async runDemo() {
    try {
      log("🚀 Real-Time Messaging Demo Started", "bold");
      log("=====================================", "yellow");

      // 1. Initialize Socket.IO connection
      await this.initializeSocket();
      await this.wait(1000);

      // 2. Get current chats
      const chats = await this.getChats();
      await this.wait(2000);

      // 3. Send an outgoing message
      const testContact = "1234567890";
      const sentMessage = await this.sendMessage(
        testContact,
        `Hello! This is a real-time test message sent at ${new Date().toLocaleTimeString()}`,
        "outgoing"
      );
      await this.wait(3000);

      // 4. Simulate incoming message
      await this.simulateIncomingMessage(
        testContact,
        "Alice Johnson",
        `Hi! I received your message. This is an incoming message at ${new Date().toLocaleTimeString()}`
      );
      await this.wait(3000);

      // 5. Simulate status updates
      if (sentMessage && sentMessage.id) {
        await this.simulateStatusUpdate(sentMessage.id, "delivered");
        await this.wait(2000);

        await this.simulateStatusUpdate(sentMessage.id, "read");
        await this.wait(2000);
      }

      // 6. Send another message
      await this.sendMessage(
        testContact,
        "This is another test message to demonstrate real-time updates!",
        "outgoing"
      );
      await this.wait(2000);

      // 7. Simulate message from another contact
      await this.simulateIncomingMessage(
        "0987654321",
        "Bob Smith",
        "Hello from Bob! Testing multi-contact real-time messaging."
      );
      await this.wait(2000);

      log("\n🎉 Demo completed successfully!", "bold");
      log("\n📱 Instructions for testing:", "yellow");
      log("1. Open your WhatsApp Web Clone in a browser", "cyan");
      log("2. You should see all the messages appear in real-time", "cyan");
      log(
        "3. Try sending messages from the UI - they should appear instantly",
        "cyan"
      );
      log(
        "4. Open multiple browser tabs to see real-time sync across tabs",
        "cyan"
      );
      log("5. Check the console for Socket.IO connection logs", "cyan");
    } catch (error) {
      log(`\n💥 Demo failed: ${error.message}`, "red");
    } finally {
      // Keep connection alive for continued testing
      log(
        "\n⏳ Keeping Socket.IO connection alive for continued testing...",
        "blue"
      );
      log("   Press Ctrl+C to exit", "yellow");
    }
  }

  // Continuous message simulation
  async startContinuousDemo(intervalMs = 10000) {
    log("\n🔄 Starting continuous message simulation...", "blue");
    log(`   Sending a message every ${intervalMs / 1000} seconds`, "cyan");

    const contacts = [
      { wa_id: "1234567890", name: "Alice Johnson" },
      { wa_id: "0987654321", name: "Bob Smith" },
      { wa_id: "5555666777", name: "Carol Davis" },
    ];

    const messages = [
      "How are you doing today?",
      "Did you see the latest news?",
      "Let's meet up soon!",
      "Thanks for the help yesterday",
      "Have a great day!",
      "Check out this interesting article",
      "What are your plans for the weekend?",
      "The weather is nice today",
      "Hope you're having a good week",
      "Let me know when you're free",
    ];

    let messageCount = 0;
    const interval = setInterval(async () => {
      try {
        const contact = contacts[Math.floor(Math.random() * contacts.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];

        messageCount++;
        await this.simulateIncomingMessage(
          contact.wa_id,
          contact.name,
          `${message} (Auto-message #${messageCount})`
        );
      } catch (error) {
        log(`❌ Error in continuous demo: ${error.message}`, "red");
      }
    }, intervalMs);

    // Stop after 10 minutes
    setTimeout(() => {
      clearInterval(interval);
      log("\n⏹️  Continuous demo stopped", "yellow");
    }, 10 * 60 * 1000);
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      log("\n🔌 Socket.IO disconnected", "blue");
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const serverUrl = args.includes("--server")
    ? args[args.indexOf("--server") + 1]
    : "http://localhost:5000";

  const demo = new RealTimeMessagingDemo(serverUrl);

  if (args.includes("--help") || args.includes("-h")) {
    log("🔧 Real-Time Messaging Demo", "bold");
    log("Usage: node realtime-demo.js [options]", "cyan");
    log("\nOptions:", "yellow");
    log(
      "  --server <url>        Server URL (default: http://localhost:5000)",
      "white"
    );
    log("  --continuous          Start continuous message simulation", "white");
    log(
      "  --interval <ms>       Interval for continuous demo (default: 10000)",
      "white"
    );
    log("  --help, -h            Show this help message", "white");
    log("\nExamples:", "yellow");
    log("  node realtime-demo.js", "white");
    log("  node realtime-demo.js --server http://localhost:5000", "white");
    log("  node realtime-demo.js --continuous --interval 5000", "white");
    return;
  }

  try {
    if (args.includes("--continuous")) {
      const interval = args.includes("--interval")
        ? parseInt(args[args.indexOf("--interval") + 1])
        : 10000;

      await demo.initializeSocket();
      await demo.runDemo();
      await demo.startContinuousDemo(interval);
    } else {
      await demo.runDemo();
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
    process.exit(1);
  }

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    log("\n\n👋 Shutting down demo...", "yellow");
    demo.disconnect();
    process.exit(0);
  });
}

// Export for use as module
module.exports = RealTimeMessagingDemo;

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log(`❌ Error: ${error.message}`, "red");
    process.exit(1);
  });
}
