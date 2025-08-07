# 🔧 WhatsApp Web Clone - Backend

A robust, production-ready Node.js backend server for the WhatsApp Web clone, featuring real-time messaging, webhook processing, and comprehensive API endpoints.

[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-purple?style=flat-square&logo=socket.io)](https://socket.io/)
[![Express](https://img.shields.io/badge/Express-4.18.2-black?style=flat-square&logo=express)](https://expressjs.com/)

## 🚀 Features

### 🔄 Real-time Communication
- **Socket.IO Integration** - Bidirectional real-time messaging
- **Connection Management** - Auto-reconnection and presence tracking
- **Event Broadcasting** - Message delivery and status updates
- **Typing Indicators** - Real-time typing status (ready for implementation)
- **Online Status** - User presence tracking and broadcasting

### 📡 API Endpoints
- **RESTful Design** - Clean, intuitive API structure
- **Message Management** - Send, receive, and track messages
- **Chat Organization** - Group messages by conversations
- **Contact Management** - User profile and status handling
- **Health Monitoring** - System health and status endpoints

### 🌐 Webhook Processing
- **Multiple Formats** - WhatsApp Business API and generic webhooks
- **Automatic Processing** - Smart payload detection and handling
- **Status Updates** - Message delivery and read receipt processing
- **Error Resilience** - Graceful handling of malformed requests

### 🗄️ Database Integration
- **MongoDB with Mongoose** - Robust data modeling and validation
- **Optimized Queries** - Indexed searches and efficient aggregations
- **Data Integrity** - Schema validation and referential integrity
- **Auto-timestamping** - Automatic createdAt/updatedAt tracking

### 🧪 Development Tools
- **Comprehensive Testing** - Automated API endpoint testing
- **Real-time Demo** - Continuous message simulation
- **Database Seeding** - Sample data for development
- **Payload Processing** - Tools for webhook payload analysis

## 🛠️ Technology Stack

```json
{
  "runtime": "Node.js",
  "framework": "Express.js 4.18.2",
  "database": "MongoDB with Mongoose 8.0.3",
  "realtime": "Socket.IO 4.7.4",
  "validation": "Mongoose Schema Validation",
  "middleware": [
    "CORS 2.8.5",
    "body-parser 1.20.2",
    "dotenv 16.3.1"
  ],
  "development": {
    "hot-reload": "nodemon 3.0.2",
    "testing": "Custom test suite with axios 1.6.2",
    "demo": "Socket.IO Client 4.8.1"
  }
}
```

## 📦 Installation & Setup

### Prerequisites
- **Node.js 18+**
- **MongoDB** (Local or Atlas)
- **npm or yarn**

### Quick Start
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Seed database with sample data
npm run seed

# Start development server
npm run dev

# Verify installation
curl http://localhost:5000/health
```

## 🔧 Configuration

### Environment Variables (`.env`)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/whatsapp
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (comma-separated for multiple origins)
CORS_ORIGINS=http://localhost:3000,https://yourapp.vercel.app

# WhatsApp Business API Integration (Optional)
WEBHOOK_VERIFY_TOKEN=your_secure_verify_token_123
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
PHONE_NUMBER_ID=your_phone_number_id
BUSINESS_ACCOUNT_ID=your_business_account_id
```

### Example Environment File (`.env.example`)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/whatsapp

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGINS=http://localhost:3000

# WhatsApp Business API (Optional)
WEBHOOK_VERIFY_TOKEN=your_secure_verify_token_123
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
PHONE_NUMBER_ID=your_phone_number_id
BUSINESS_ACCOUNT_ID=your_business_account_id
```

## 📡 API Documentation

### 🔍 Core Endpoints

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-07T10:30:00.000Z",
  "mongodb": "connected"
}
```

#### Get All Chats
```http
GET /api/chats
```
**Response:**
```json
[
  {
    "wa_id": "1234567890",
    "name": "Alice Johnson",
    "phone": "+1234567890",
    "avatar": null,
    "messages": [...],
    "lastMessage": {
      "text": "Hello! How are you?",
      "timestamp": "2025-08-07T10:30:00Z",
      "type": "incoming",
      "status": "delivered"
    },
    "unreadCount": 2,
    "is_online": true
  }
]
```

#### Get Chat Messages
```http
GET /api/chats/:wa_id
```
**Parameters:**
- `wa_id` (string): WhatsApp ID of the contact

**Response:**
```json
[
  {
    "id": "msg_123456789",
    "wa_id": "1234567890",
    "name": "Alice Johnson",
    "text": "Hello! How are you doing?",
    "type": "incoming",
    "timestamp": "2025-08-07T10:30:00Z",
    "status": "delivered"
  }
]
```

#### Send Message
```http
POST /api/send
```
**Request Body:**
```json
{
  "wa_id": "1234567890",
  "text": "Hello! This is a test message.",
  "type": "outgoing"
}
```
**Response:**
```json
{
  "success": true,
  "message": {
    "id": "msg_1691234567890_abc123",
    "wa_id": "1234567890",
    "text": "Hello! This is a test message.",
    "type": "outgoing",
    "timestamp": "2025-08-07T10:30:00Z",
    "status": "sent",
    "name": "You"
  }
}
```

#### Mark Messages as Read
```http
POST /api/chats/:wa_id/read
```
**Parameters:**
- `wa_id` (string): WhatsApp ID of the contact

**Response:**
```json
{
  "success": true,
  "updated": 3
}
```

### 👥 Contact Management

#### Get All Contacts
```http
GET /api/contacts
```
**Response:**
```json
[
  {
    "wa_id": "1234567890",
    "name": "Alice Johnson",
    "phone": "+1234567890",
    "avatar": null,
    "last_seen": "2025-08-07T10:30:00Z",
    "is_online": true
  }
]
```

#### Create/Update Contact
```http
POST /api/contacts
```
**Request Body:**
```json
{
  "wa_id": "9876543210",
  "name": "Bob Smith",
  "phone": "+9876543210",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 📡 Webhook Endpoints

#### Webhook Verification (WhatsApp Business API)
```http
GET /webhook?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=CHALLENGE
```
**Response:** Returns the challenge value for verification

#### Receive Webhooks
```http
POST /webhook
```
**Supported Formats:**

**WhatsApp Business API Format:**
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "id": "wamid.example123",
          "from": "1234567890",
          "timestamp": "1625760000",
          "text": {"body": "Hello from WhatsApp!"},
          "type": "text"
        }],
        "contacts": [{
          "wa_id": "1234567890",
          "profile": {"name": "John Doe"}
        }]
      }
    }]
  }]
}
```

**Generic Format:**
```json
{
  "wa_id": "1234567890",
  "name": "John Doe",
  "text": "Hello from webhook!",
  "type": "incoming",
  "timestamp": "2025-08-07T10:30:00Z"
}
```

**Status Update Format:**
```json
{
  "id": "msg_123456789",
  "status": "read",
  "timestamp": "2025-08-07T10:35:00Z"
}
```

## 🔄 Real-time Events (Socket.IO)

### Connection Events
```javascript
// Client connects
socket.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

// Client disconnects
socket.on('disconnect', (reason) => {
  console.log('Client disconnected:', reason);
});
```

### Message Events
```javascript
// New message received
io.emit('newMessage', {
  id: 'msg_123',
  wa_id: '1234567890',
  text: 'Hello!',
  type: 'incoming',
  timestamp: new Date(),
  status: 'delivered'
});

// Message status update
io.emit('messageStatusUpdate', {
  wa_id: '1234567890',
  id: 'msg_123',
  status: 'read'
});

// User online status
io.emit('userOnlineStatus', {
  wa_id: '1234567890',
  is_online: true,
  last_seen: new Date()
});
```

### Custom Events (Ready for Implementation)
```javascript
// Typing indicators
socket.emit('userTyping', {
  wa_id: '1234567890',
  isTyping: true
});

// User joined
socket.emit('join-user', {
  userId: '1234567890'
});
```

## 🗄️ Database Schema

### Messages Collection (`processed_messages`)
```javascript
const messageSchema = new mongoose.Schema({
  id: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  meta_msg_id: { 
    type: String 
  },
  wa_id: { 
    type: String, 
    required: true, 
    index: true 
  },
  phone: { 
    type: String 
  },
  name: { 
    type: String, 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['incoming', 'outgoing'], 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  from: { 
    type: String 
  },
  to: { 
    type: String 
  },
  message_type: { 
    type: String, 
    default: 'text' 
  },
  webhook_data: { 
    type: mongoose.Schema.Types.Mixed 
  }
}, {
  timestamps: true
});
```

### Contacts Collection
```javascript
const contactSchema = new mongoose.Schema({
  wa_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String 
  },
  avatar: { 
    type: String 
  },
  last_seen: { 
    type: Date, 
    default: Date.now 
  },
  is_online: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});
```

### Database Indexes
```javascript
// Optimize queries by wa_id
db.processed_messages.createIndex({ "wa_id": 1 });
db.processed_messages.createIndex({ "timestamp": -1 });
db.processed_messages.createIndex({ "wa_id": 1, "timestamp": -1 });

// Unique constraints
db.contacts.createIndex({ "wa_id": 1 }, { unique: true });
```

## 🧪 Testing & Development

### Available Scripts
```bash
# Development
npm run dev                    # Start with nodemon (auto-reload)
npm run start                  # Start production server

# Database
npm run seed                   # Seed database with sample data

# Testing
npm run test                   # Run comprehensive API test suite
npm run process-payloads       # Process sample webhook payloads
npm run verify-payloads        # Verify processed data integrity

# Real-time Demo
npm run realtime-demo          # Interactive real-time demo
npm run realtime-continuous    # Continuous message simulation
npm run realtime-help          # Show demo options
```

### Test Suite
```bash
# Run all tests (Expected: 10/10 passing)
npm run test

# Output:
# ✅ Health Check - PASSED (200)
# ✅ Get All Chats - PASSED (200)  
# ✅ Send Message - PASSED (201)
# ✅ Create/Update Contact - PASSED (200)
# ✅ Webhook - New Message - PASSED (200)
# ✅ Webhook - Status Update - PASSED (200)
# ✅ Webhook - WhatsApp Business Format - PASSED (200)
# ✅ Get Specific Chat Messages - PASSED (200)
# ✅ Mark Messages as Read - PASSED (200)
# 🎉 All tests passed! Your API is working correctly.
```

### Manual Testing Examples
```bash
# Health check
curl http://localhost:5000/health

# Send message
curl -X POST http://localhost:5000/api/send \
  -H "Content-Type: application/json" \
  -d '{"wa_id":"1234567890","text":"Test message","type":"outgoing"}'

# Webhook simulation
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{"wa_id":"1234567890","name":"Test User","text":"Hello!","type":"incoming"}'

# Get chats
curl http://localhost:5000/api/chats

# Get specific chat
curl http://localhost:5000/api/chats/1234567890
```

### Real-time Demo
```bash
# Start interactive demo
npm run realtime-demo

# Options:
# - Send test messages
# - Simulate status updates
# - Test Socket.IO connections
# - Monitor real-time events

# Continuous simulation
npm run realtime-continuous
```

## 📁 Project Structure

```
backend/
├── 📄 server.js              # Main server file with all endpoints
├── 📄 seed.js                # Database seeding with sample data
├── 📄 test-api.js            # Comprehensive API testing suite
├── 📄 test-webhook.js        # Simple webhook testing
├── 📄 process-payloads.js    # Webhook payload processor
├── 📄 verify-payloads.js     # Data verification utility
├── 📄 realtime-demo.js       # Real-time messaging demo
├── 📄 simple-send-test.js    # Quick send endpoint test
├── 📄 package.json           # Dependencies and scripts
├── 📄 .env                   # Environment configuration
├── 📄 .env.example           # Environment template
└── 📄 README.md              # This documentation
```

### File Descriptions

- **`server.js`** - Main Express server with all API routes, Socket.IO setup, and database connection
- **`seed.js`** - Populates database with sample contacts and messages for development
- **`test-api.js`** - Automated testing suite covering all API endpoints
- **`realtime-demo.js`** - Interactive tool for testing real-time messaging functionality
- **`process-payloads.js`** - Processes WhatsApp Business API payload samples
- **`verify-payloads.js`** - Verifies data integrity and displays processing statistics

## 🚀 Deployment

### Environment-specific Configuration

#### Development
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/whatsapp
CORS_ORIGINS=http://localhost:3000
```

#### Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/whatsapp
CORS_ORIGINS=https://yourapp.vercel.app,https://yourdomain.com
```

### Platform Deployment

#### Render
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Auto-deploy on git push

#### Heroku
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your-uri
heroku config:set CORS_ORIGINS=your-frontend-url
git push heroku main
```

#### Railway
1. Connect GitHub repository
2. Set environment variables
3. Automatic deployment

### Health Monitoring
```bash
# Check deployment health
curl https://your-backend.onrender.com/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2025-08-07T10:30:00.000Z",
  "mongodb": "connected"
}
```

## 🔒 Security Features

### Input Validation
- **Mongoose Schema Validation** - Type checking and constraints
- **Required Field Validation** - Ensures data integrity
- **Enum Validation** - Restricts values to allowed options

### CORS Protection
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
```

### Error Handling
- **Structured Error Responses** - Consistent error format
- **No Sensitive Data Exposure** - Secure error messages
- **Request Timeout Protection** - Prevents hanging requests

### Environment Security
- **Environment Variables** - No hardcoded credentials
- **MongoDB Connection Security** - Secure connection strings
- **Production Configurations** - Environment-specific settings

## 📊 Performance Optimization

### Database Optimization
- **Indexed Queries** - Fast lookups by wa_id and timestamp
- **Aggregation Pipelines** - Efficient data grouping
- **Connection Pooling** - Mongoose default connection management

### API Performance
- **Async/Await** - Non-blocking operations
- **Error Boundaries** - Graceful error handling
- **Response Compression** - Reduced payload sizes (ready)

### Real-time Optimization
- **Event-driven Architecture** - Efficient Socket.IO events
- **Selective Broadcasting** - Targeted message delivery
- **Connection Management** - Auto-reconnection and cleanup

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
```bash
# Check connection string
echo $MONGODB_URI

# Test connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected'))
  .catch(err => console.log('❌ Error:', err.message));
"
```

#### CORS Issues
```javascript
// Check CORS configuration in server.js
console.log('CORS Origins:', process.env.CORS_ORIGINS?.split(','));

// Test from browser console
fetch('http://localhost:5000/health')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Socket.IO Connection Issues
```bash
# Check if Socket.IO is running
curl http://localhost:5000/socket.io/

# Expected: Socket.IO endpoint info
```

#### Port Issues
```bash
# Check if port is in use
netstat -an | grep :5000

# Kill process using port (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process using port (Linux/Mac)
lsof -ti:5000 | xargs kill -9
```

### Debug Commands
```bash
# View all environment variables
node -e "console.log(process.env)"

# Test database operations
npm run seed

# Check server logs
npm run dev

# Verify API endpoints
npm run test
```

### Logging and Monitoring
```javascript
// Enable debug mode
DEBUG=* npm run dev

// Custom logging in server.js
console.log('🔌 Client connected:', socket.id);
console.log('📨 New message:', messageData);
console.log('❌ Error:', error.message);
```

## 🔄 Development Workflow

### Adding New Features

#### 1. New API Endpoint
```javascript
// Add to server.js
app.post('/api/new-feature', async (req, res) => {
  try {
    // Implementation
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Database Schema Changes
```javascript
// Update schema in server.js
const newFieldSchema = new mongoose.Schema({
  // New fields
}, { timestamps: true });
```

#### 3. Real-time Events
```javascript
// Add Socket.IO events
io.emit('newEvent', {
  // Event data
});
```

#### 4. Testing
```javascript
// Add tests to test-api.js
tests.push(
  await testEndpoint(
    "New Feature Test",
    "POST",
    "/api/new-feature",
    { /* test data */ },
    200
  )
);
```

### Code Style Guidelines
- Use **async/await** for asynchronous operations
- Implement proper **error handling**
- Add **console.log** statements for debugging
- Follow **RESTful** API conventions
- Use **Mongoose** for database operations
- Emit **Socket.IO** events for real-time updates

## 📚 API Client Integration

### Frontend Integration
```javascript
// Example API client usage
const response = await fetch('/api/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wa_id: '1234567890',
    text: 'Hello!',
    type: 'outgoing'
  })
});

const data = await response.json();
console.log('Message sent:', data);
```

### Socket.IO Client
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('newMessage', (message) => {
  console.log('New message:', message);
});

socket.on('messageStatusUpdate', (update) => {
  console.log('Status update:', update);
});
```

## 🎯 Future Enhancements

### Ready for Implementation
- **File Upload Handling** - Multer integration for media messages
- **Authentication Middleware** - JWT token validation
- **Rate Limiting** - Express rate limit middleware
- **Caching Layer** - Redis integration for performance
- **Push Notifications** - FCM integration
- **Message Encryption** - End-to-end encryption layer
- **Advanced Search** - Full-text search with indexes
- **Message Threading** - Reply-to message relationships
- **Group Chat Support** - Multi-user conversation handling
- **Voice Messages** - Audio file handling and streaming

### Infrastructure Improvements
- **Microservices Architecture** - Service separation
- **Load Balancing** - Multiple server instances
- **Database Sharding** - Horizontal scaling
- **CDN Integration** - Static asset delivery
- **Monitoring & Analytics** - Performance tracking
- **Automated Testing** - CI/CD pipeline integration

## 📞 Support & Maintenance

### Monitoring
```bash
# Check server health
curl http://localhost:5000/health

# Monitor logs
tail -f logs/server.log

# Database status
npm run verify-payloads
```

### Maintenance Tasks
- **Database Backups** - Regular MongoDB exports
- **Log Rotation** - Prevent log files from growing too large
- **Dependency Updates** - Keep packages updated
- **Security Audits** - Regular npm audit checks

### Performance Monitoring
- **Response Times** - Track API endpoint performance
- **Database Queries** - Monitor slow queries
- **Memory Usage** - Watch for memory leaks
- **Connection Counts** - Monitor Socket.IO connections

## 📄 License

This backend is part of the WhatsApp Web Clone project, licensed under the **MIT License**.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

### Areas for Contribution
- 📊 **Performance optimization**
- 🔒 **Security enhancements**
- 🧪 **Test coverage expansion**
- 📚 **Documentation improvements**
- 🚀 **New feature development**

---

<div align="center">

**Backend built with ❤️ using Node.js and Express**

[![Node.js](https://img.shields.io/badge/Built%20with-Node.js-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Powered%20by-Express-black?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)](https://mongodb.com/)

[📡 API Documentation](#-api-documentation) | [🧪 Testing Guide](#-testing--development) | [🚀 Deployment](#-deployment)

</div>
