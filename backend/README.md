# WhatsApp Web Clone - Backend

A Node.js + Express.js + MongoDB backend server for the WhatsApp Web clone application.

## Features

- 🔄 **Real-time messaging** with Socket.IO
- 📱 **WhatsApp Business API webhook processing**
- 💾 **MongoDB integration** with Mongoose
- 📨 **Message status tracking** (sent, delivered, read)
- 👥 **Contact management**
- 🔧 **RESTful API endpoints**
- 🌐 **CORS enabled** for frontend integration

## API Endpoints

### Messages & Chats
- `GET /api/chats` - Get all chats grouped by wa_id
- `GET /api/chats/:wa_id` - Get messages for specific contact
- `POST /api/send` - Send a new message
- `POST /api/chats/:wa_id/read` - Mark messages as read

### Webhooks
- `POST /webhook` - Receive webhook payloads from WhatsApp Business API

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create or update contact

### Health Check
- `GET /health` - Server health status

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB connection string and other configurations.

3. **Start the server:**
   
   **Development:**
   ```bash
   npm run dev
   ```
   
   **Production:**
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/whatsapp` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |

## MongoDB Collections

### processed_messages
Stores all chat messages with the following schema:
```javascript
{
  id: String,              // Unique message ID
  meta_msg_id: String,     // Alternative message ID
  wa_id: String,           // WhatsApp ID (contact identifier)
  phone: String,           // Phone number
  name: String,            // Contact name
  text: String,            // Message content
  type: String,            // 'incoming' | 'outgoing'
  timestamp: Date,         // Message timestamp
  status: String,          // 'sent' | 'delivered' | 'read' | 'failed'
  from: String,            // Sender
  to: String,              // Recipient
  message_type: String,    // Message type (text, image, etc.)
  webhook_data: Mixed      // Original webhook payload
}
```

### contacts
Stores contact information:
```javascript
{
  wa_id: String,           // WhatsApp ID (unique)
  name: String,            // Contact name
  phone: String,           // Phone number
  avatar: String,          // Avatar URL
  last_seen: Date,         // Last activity timestamp
  is_online: Boolean       // Online status
}
```

## Webhook Processing

The server can handle multiple webhook formats:

1. **WhatsApp Business API format** - Standard webhook structure
2. **Direct message format** - Simplified message structure
3. **Generic format** - Custom message structure

### Example Webhook Payloads

**New Message:**
```json
{
  "wa_id": "1234567890",
  "name": "John Doe",
  "text": "Hello, World!",
  "type": "incoming",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Status Update:**
```json
{
  "id": "msg_123",
  "status": "read",
  "timestamp": "2024-01-01T12:01:00Z"
}
```

## Socket.IO Events

### Client → Server
- `connection` - Client connects
- `disconnect` - Client disconnects

### Server → Client
- `newMessage` - New message received
- `messageStatusUpdate` - Message status changed

## Deployment

### Render
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy with Node.js runtime

### Heroku
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set MONGODB_URI=your-connection-string`
4. Deploy: `git push heroku main`

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string and add to `.env`
4. Whitelist your deployment platform's IP addresses

## Development

### Project Structure
```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── .env              # Environment variables
├── .env.example      # Environment template
└── README.md         # This file
```

### Adding Features
1. **New API endpoints** - Add routes in `server.js`
2. **Database models** - Add schemas using Mongoose
3. **Real-time features** - Use Socket.IO events
4. **Webhook processors** - Extend webhook handling functions

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB URI in `.env`
   - Ensure MongoDB Atlas allows connections from your IP
   - Verify database user permissions

2. **CORS Errors**
   - Add your frontend URL to `CORS_ORIGINS` in `.env`
   - Ensure proper protocol (http/https)

3. **Webhook Not Receiving**
   - Check webhook URL configuration
   - Verify server is accessible from internet
   - Use ngrok for local development

4. **Socket.IO Connection Issues**
   - Check CORS configuration
   - Verify WebSocket support
   - Test with Socket.IO client tools

### Logs
The server provides detailed logging for:
- MongoDB connection status
- Webhook processing
- Socket.IO connections
- API requests and errors

## Security Considerations

- Use HTTPS in production
- Implement proper authentication for sensitive endpoints
- Validate and sanitize webhook payloads
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
