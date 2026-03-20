require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const postRoutes = require('./routes/postRoutes');
const storyRoutes = require('./routes/storyRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('socketio', io);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
}));

// Connect to Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/notes', noteRoutes);

// Socket.io Setup
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on('setup', (userData) => {
    const userId = userData._id || userData.id;
    if (!userId) return;
    socket.join(userId.toString());
    console.log(`User joined private room: ${userId}`);
    socket.emit('connected');
  });

  socket.on('join_chat', (room) => {
    socket.join(room);
    console.log(`User joined chat room: ${room}`);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing', room));
  socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing', room));

  socket.on('new_message', (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat || !chat.participants) return;

    chat.participants.forEach((participant) => {
      const participantId = participant._id || participant;
      if (participantId.toString() === newMessageReceived.sender._id.toString()) return;
      
      socket.in(participantId.toString()).emit('message_received', newMessageReceived);
    });
  });

  socket.off('setup', () => {
    console.log('User Disconnected');
    socket.leave(userData.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 ChatVerse Server RUNNING on Port ${PORT}`);
});
