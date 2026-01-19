# 💰 Bill Buddies

A complete MERN stack application for splitting bills, tracking expenses, and managing group finances with friends and roommates.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account (free tier)
- npm or yarn

### Installation & Running

1. **Start both servers** (from project root):
```bash
npm run dev
```

2. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Environment Setup

**Backend** (`.env`):
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/billbuddies?retryWrites=true&w=majority
JWT_SECRET=your_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Frontend** (`.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
bill-buddies/
├── backend/           # Node.js + Express server
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth, upload, error handling
│   ├── utils/         # OCR, parsers, helpers
│   └── server.js      # Main server file
│
├── frontend/          # React application
│   ├── public/        # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API calls
│   │   ├── context/      # State management
│   │   └── App.js        # Main app
│   └── package.json
│
├── node_modules/      # Dependencies
├── package.json       # Root scripts
└── README.md
```

## ✨ Features

### Authentication & Users
- User registration & login
- JWT-based authentication
- Profile management
- Payment method preferences

### Friends
- Send/receive friend requests
- Manage friend list
- View friend balances

### Groups
- Create and manage expense groups
- Add/remove group members
- Group settings and permissions

### Expenses
- Manual expense entry
- **Bill scanner** (OCR receipt scanning)
- Multiple split methods (equal, percentage, by-item)
- Expense categories and tracking
- Edit/delete expenses

### Settlements & Payments
- View group balances
- Record payments
- Payment history
- Simplified debt calculation

### Real-Time Features
- WebSocket notifications
- Live updates when expenses are added
- Real-time group activity

### Chat
- Group messaging
- Message history
- Emoji and mentions support

## 🔧 Available Commands

```bash
# Start both servers (from root)
npm run dev

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm start

# Build for production
cd frontend && npm run build
```

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.io (Real-time)
- Tesseract.js (OCR)
- Multer (File uploads)

**Frontend:**
- React 18
- Axios (API calls)
- React Router v6
- Tailwind CSS
- Socket.io Client
- React Hot Toast (Notifications)

## 📸 Bill Scanner

The app includes automated receipt scanning:
1. Upload receipt image
2. OCR extracts text & amounts
3. Preview and assign items to people
4. Auto-creates expense with proper splits

## 🔐 Security

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Protected API routes
- CORS configured
- Input validation on all endpoints

## 📝 License

MIT License - feel free to use and modify

## 👥 Support

For issues or questions, please check the documentation or create an issue.
