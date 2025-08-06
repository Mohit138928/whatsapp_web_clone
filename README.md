# WhatsApp Web Clone

A full-stack WhatsApp Web clone built with Next.js, Node.js, Express, MongoDB, and Socket.IO.

## 🚀 Features

### Frontend
- 📱 **Responsive UI** similar to WhatsApp Web
- 💬 **Real-time messaging** with Socket.IO
- 👥 **Chat list** with contact management
- 💭 **Message bubbles** with timestamps and status indicators
- ✅ **Message status** (sent, delivered, read)
- 🎨 **Clean design** with Tailwind CSS and shadcn/ui components
- 📱 **Mobile-friendly** responsive design

### Backend
- 🔄 **Real-time updates** with Socket.IO
- 📡 **Webhook processing** for WhatsApp Business API
- 💾 **MongoDB integration** with message persistence
- 📨 **RESTful API** endpoints
- 👥 **Contact management**
- 🔧 **Message status tracking**

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** with **Mongoose** - Database
- **Socket.IO** - Real-time communication
- **CORS** - Cross-origin requests

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (Local or Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd whatsapp_web_clone
```

### 2. Setup Backend
```bash
cd backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start backend server
npm run dev
```

### 3. Setup Frontend
```bash
# In a new terminal, from project root
npm install

# Copy environment file and configure
cp .env.example .env.local
# Edit .env.local with your backend URL

# Start frontend
npm run dev
```

### 4. Access the application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔧 Configuration

### Backend Environment (.env)
```env
MONGODB_URI=mongodb://localhost:27017/whatsapp
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
```

### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📡 API Endpoints

### Messages & Chats
- `GET /api/chats` - Get all chats grouped by wa_id
- `GET /api/chats/:wa_id` - Get messages for specific contact
- `POST /api/send` - Send a new message
- `POST /api/chats/:wa_id/read` - Mark messages as read

### Webhooks
- `POST /webhook` - Receive webhook payloads

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create or update contact

### Health Check
- `GET /health` - Server health status

## 🔄 Real-time Features

The application uses Socket.IO for real-time features:

### Events
- `newMessage` - New message received
- `messageStatusUpdate` - Message status changed

## 📊 Database Schema

### Messages Collection (processed_messages)
```javascript
{
  id: String,              // Unique message ID
  meta_msg_id: String,     // Alternative message ID  
  wa_id: String,           // WhatsApp ID
  phone: String,           // Phone number
  name: String,            // Contact name
  text: String,            // Message content
  type: String,            // 'incoming' | 'outgoing'
  timestamp: Date,         // Message timestamp
  status: String,          // 'sent' | 'delivered' | 'read' | 'failed'
  from: String,            // Sender
  to: String,              // Recipient
  message_type: String,    // Message type
  webhook_data: Mixed      // Original webhook payload
}
```

### Contacts Collection
```javascript
{
  wa_id: String,           // WhatsApp ID (unique)
  name: String,            // Contact name
  phone: String,           // Phone number
  avatar: String,          // Avatar URL
  last_seen: Date,         // Last activity
  is_online: Boolean       // Online status
}
```

## 🔗 Webhook Integration

The backend supports multiple webhook formats:

### Example Payloads

**New Message:**
```json
{
  "wa_id": "1234567890",
  "name": "John Doe", 
  "text": "Hello, World!",
  "type": "incoming"
}
```

**Status Update:**
```json
{
  "id": "msg_123",
  "status": "read"
}
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.herokuapp.com`
3. Deploy

### Backend (Render/Heroku)

**Render:**
1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy

**Heroku:**
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set CORS_ORIGINS=https://your-frontend-url.vercel.app
git push heroku main
```

### MongoDB Atlas
1. Create MongoDB Atlas account
2. Create cluster and database
3. Get connection string
4. Add to environment variables

## 🧪 Testing

### Test Backend APIs
```bash
# Health check
curl http://localhost:5000/health

# Get chats
curl http://localhost:5000/api/chats

# Send message
curl -X POST http://localhost:5000/api/send 
  -H "Content-Type: application/json" 
  -d '{"wa_id":"1234567890","text":"Test message","type":"outgoing"}'

# Test webhook
curl -X POST http://localhost:5000/webhook 
  -H "Content-Type: application/json" 
  -d '{"wa_id":"1234567890","name":"Test User","text":"Hello from webhook","type":"incoming"}'
```

## 📱 Features Demo

1. **Send a message** - Use the input box to send messages
2. **Real-time updates** - Open multiple browser tabs to see real-time sync
3. **Status indicators** - See message status (✓ sent, ✓✓ delivered, ✓✓ read)
4. **Webhook integration** - Send POST requests to `/webhook` to simulate incoming messages

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGINS in backend .env
   - Ensure frontend URL is included

2. **Socket.IO Connection Failed**
   - Verify backend is running
   - Check NEXT_PUBLIC_API_URL in frontend

3. **MongoDB Connection Error**
   - Verify MongoDB URI
   - Check database permissions
   - Ensure network access (MongoDB Atlas)

4. **Messages Not Appearing**
   - Check browser console for errors
   - Verify API endpoints are working
   - Check MongoDB data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -m 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- WhatsApp for the UI inspiration
- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- MongoDB for the database solution
- Socket.IO for real-time capabilities
