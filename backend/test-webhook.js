const axios = require("axios");

async function sendTestMessage() {
  const testMessage = {
    wa_id: "1234567890",
    name: "Alice Johnson",
    text: "Hello! This is a test message sent via webhook 👋",
    type: "incoming",
    timestamp: new Date().toISOString(),
  };

  try {
    console.log("📤 Sending test webhook message...");
    const response = await axios.post(
      "http://localhost:5000/webhook",
      testMessage
    );
    console.log("✅ Webhook message sent successfully!");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("❌ Failed to send webhook message:", error.message);
  }
}

sendTestMessage();
