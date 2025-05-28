const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const passport = require("passport");

// Load environment variables first
dotenv.config();

require("./config/passport"); // Import passport configuration

const connectDB = require("./config/db");
const Course = require("./models/Course");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/student");
const reviewRouter = require("./routes/review");
const freeVideoRoutes = require("./routes/freeVideoRoutes");
const manageUserRoute = require("./routes/manageUser");
// Routes for different features
const notificationRoutes = require('./routes/notificationRoutes');
const livestreamRoutes = require('./routes/liveStreamRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const channelRoutes = require('./routes/channelRoutes');
const earningsRoutes = require('./routes/earningsRoutes');
const studioRoutes = require('./routes/studioRoutes');
const userLibraryRoutes = require('./routes/userLibraryRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const creatorCourseRoutes = require('./routes/creatorCourseRoutes');
const codingVideoRoutes = require('./routes/codingVideoRoutes');
const coderVerificationRoutes = require('./routes/coderVerificationRoutes');
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://rerosesssss-b61w.vercel.app",
      "https://rerosesssss-77mr.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://rerosesssss-b61w.vercel.app",
      "https://rerosesssss-77mr.vercel.app"
    ],
    credentials: true,
  })
);
app.use(passport.initialize());

// Routes
app.get("/", (req, res) => {
  res.send("API is running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/reviews", reviewRouter);
app.use("/api/free-videos", freeVideoRoutes);
app.use("/api/users", manageUserRoute);
app.use("/api/livestream", livestreamRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/studio', studioRoutes);
app.use('/api/library', userLibraryRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/creator/courses', creatorCourseRoutes);
app.use('/api/coding-videos', codingVideoRoutes);
app.use('/api/coder', coderVerificationRoutes);
// Protected route for testing auth middleware
app.get(
  "/api/protected",
  require("./middleware/authMiddleware").protect,
  (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
  }
);

// ✅ This route already exists in `admin.js`, so you could optionally remove this one if redundant
app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Error fetching course details" });
  }
});

// ✅ Public route to get all courses for students
app.get("/api/student/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Error fetching courses" });
  }
});

// Socket.io setup
const { protect } = require('./middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

// Socket.io middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token ||
      socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

  // Join user to their own room for private messages
  socket.join(socket.user._id.toString());

  // Join all conversations the user is part of
  socket.on('join-conversations', async () => {
    try {
      const conversations = await Conversation.find({
        participants: socket.user._id
      });

      conversations.forEach(conversation => {
        socket.join(conversation._id.toString());
        console.log(`${socket.user.name} joined conversation: ${conversation._id}`);
      });
    } catch (error) {
      console.error('Error joining conversations:', error);
    }
  });

  // Listen for new messages
  socket.on('send-message', async (messageData) => {
    try {
      const { conversationId, content, type = 'text', mediaUrl, replyTo } = messageData;

      // Check if conversation exists and user is a participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.user._id
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // Create the message
      const message = new Message({
        conversation: conversationId,
        sender: socket.user._id,
        content,
        type,
        mediaUrl: type !== 'text' ? mediaUrl : undefined,
        readBy: [socket.user._id], // Sender has read the message
        replyTo: replyTo || undefined
      });

      await message.save();

      // Update the conversation's last message and increment unread counts
      await Conversation.updateOne(
        { _id: conversationId },
        {
          $set: {
            lastMessage: message._id,
            updatedAt: new Date()
          },
          $inc: {
            'unreadCounts.$[elem].count': 1
          }
        },
        {
          arrayFilters: [{ 'elem.user': { $ne: socket.user._id } }]
        }
      );

      // Populate sender info
      await message.populate({
        path: 'sender',
        select: 'name profileImageUrl'
      });

      // If replying to a message, populate that info
      if (replyTo) {
        await message.populate({
          path: 'replyTo',
          select: 'content sender',
          populate: {
            path: 'sender',
            select: 'name'
          }
        });
      }

      // Emit the message to all participants in the conversation
      io.to(conversationId).emit('new-message', message);

      // Also emit an update to the conversation list for all participants
      conversation.participants.forEach(participantId => {
        if (participantId.toString() !== socket.user._id.toString()) {
          io.to(participantId.toString()).emit('conversation-updated', {
            conversationId,
            lastMessage: message
          });
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Listen for typing events
  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit('user-typing', {
      userId: socket.user._id,
      userName: socket.user.name,
      isTyping
    });
  });

  // Listen for read receipts
  socket.on('mark-read', async ({ conversationId }) => {
    try {
      // Update unread count for this user
      await Conversation.updateOne(
        {
          _id: conversationId,
          'unreadCounts.user': socket.user._id
        },
        {
          $set: { 'unreadCounts.$.count': 0 }
        }
      );

      // Mark messages as read
      await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: socket.user._id },
          readBy: { $ne: socket.user._id }
        },
        {
          $addToSet: { readBy: socket.user._id }
        }
      );

      // Emit read receipt to other participants
      socket.to(conversationId).emit('messages-read', {
        conversationId,
        userId: socket.user._id
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);
  });
});

// Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
