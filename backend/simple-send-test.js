const axios = require("axios");

async function testSendMessage() {
  console.log("Testing POST /api/send endpoint...\n");

  const testMessage = {
    wa_id: "1234567890",
    text: "Hello! This is a test message from the send endpoint 📱",
    type: "outgoing",
  };

  try {
    console.log("Sending message:", JSON.stringify(testMessage, null, 2));

    const response = await axios.post(
      "http://localhost:5000/api/send",
      testMessage,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("\nSUCCESS!");
    console.log("Status Code:", response.status);
    console.log("Response:", JSON.stringify(response.data, null, 2));

    if (response.status === 201) {
      console.log(
        "\nPerfect! The endpoint is working correctly with status 201 Created"
      );
    }
  } catch (error) {
    console.error("ERROR:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

testSendMessage();
