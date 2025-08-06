const axios = require("axios");

const API_BASE = "http://localhost:5000";

// ANSI color codes for terminal output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(
  name,
  method,
  endpoint,
  data = null,
  expectedStatus = 200
) {
  try {
    log(`\n🧪 Testing ${name}...`, "blue");

    let response;
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      timeout: 5000,
    };

    if (data) {
      config.data = data;
      config.headers = { "Content-Type": "application/json" };
    }

    response = await axios(config);

    if (response.status === expectedStatus) {
      log(`✅ ${name} - PASSED (${response.status})`, "green");
      if (response.data) {
        console.log(
          `   Response:`,
          JSON.stringify(response.data, null, 2).substring(0, 200) + "..."
        );
      }
      return true;
    } else {
      log(
        `❌ ${name} - FAILED (Expected ${expectedStatus}, got ${response.status})`,
        "red"
      );
      return false;
    }
  } catch (error) {
    log(`❌ ${name} - ERROR: ${error.message}`, "red");
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
    return false;
  }
}

async function runTests() {
  log("🚀 WhatsApp Web Clone - API Testing Suite", "bold");
  log("==========================================", "yellow");

  const tests = [];

  // Health Check
  tests.push(await testEndpoint("Health Check", "GET", "/health"));

  // Get Chats
  tests.push(await testEndpoint("Get All Chats", "GET", "/api/chats"));

  // Get Contacts
  tests.push(await testEndpoint("Get All Contacts", "GET", "/api/contacts"));

  // Send Message
  tests.push(
    await testEndpoint(
      "Send Message",
      "POST",
      "/api/send",
      {
        wa_id: "1234567890",
        text: "Test message from API test suite",
        type: "outgoing",
      },
      201
    )
  );

  // Create/Update Contact
  tests.push(
    await testEndpoint("Create/Update Contact", "POST", "/api/contacts", {
      wa_id: "9876543210",
      name: "Test Contact",
      phone: "+9876543210",
    })
  );

  // Test Webhook - New Message
  tests.push(
    await testEndpoint("Webhook - New Message", "POST", "/webhook", {
      wa_id: "1234567890",
      name: "Test User",
      text: "Hello from webhook test!",
      type: "incoming",
      timestamp: new Date().toISOString(),
    })
  );

  // Test Webhook - Status Update
  tests.push(
    await testEndpoint("Webhook - Status Update", "POST", "/webhook", {
      id: "msg_123456789",
      status: "read",
      timestamp: new Date().toISOString(),
    })
  );

  // Test Webhook - WhatsApp Business API Format
  tests.push(
    await testEndpoint(
      "Webhook - WhatsApp Business Format",
      "POST",
      "/webhook",
      {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      id: "wamid.test123",
                      from: "1234567890",
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      text: {
                        body: "Test message from WhatsApp Business API format",
                      },
                      type: "text",
                    },
                  ],
                  contacts: [
                    {
                      wa_id: "1234567890",
                      profile: { name: "WhatsApp Test User" },
                    },
                  ],
                  metadata: {
                    phone_number_id: "123456789",
                  },
                },
              },
            ],
          },
        ],
      }
    )
  );

  // Get specific chat messages
  tests.push(
    await testEndpoint(
      "Get Specific Chat Messages",
      "GET",
      "/api/chats/1234567890"
    )
  );

  // Mark messages as read
  tests.push(
    await testEndpoint(
      "Mark Messages as Read",
      "POST",
      "/api/chats/1234567890/read"
    )
  );

  // Summary
  log("\n📊 Test Results Summary", "bold");
  log("======================", "yellow");

  const passed = tests.filter(Boolean).length;
  const total = tests.length;
  const failed = total - passed;

  log(`✅ Passed: ${passed}/${total}`, passed === total ? "green" : "yellow");
  if (failed > 0) {
    log(`❌ Failed: ${failed}/${total}`, "red");
  }

  if (passed === total) {
    log("\n🎉 All tests passed! Your API is working correctly.", "green");
  } else {
    log(
      "\n⚠️  Some tests failed. Please check the backend server and database connection.",
      "yellow"
    );
  }

  log("\n💡 Tips:", "blue");
  log("- Make sure the backend server is running on port 5000");
  log("- Ensure MongoDB is connected and accessible");
  log("- Check that sample data has been seeded");
  log("- Verify CORS settings if testing from different origins");
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch((error) => {
    log(`\n💥 Test suite crashed: ${error.message}`, "red");
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint };
