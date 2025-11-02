const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const devRoutes = require('./routes/devRoutes');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { setIO } = require('./realtime/io');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5050;

// ------------------- MIDDLEWARE -------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration - supports both development and production
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Debug'],
    exposedHeaders: ['X-Debug'],
  })
);

// ------------------- SOCKET.IO -------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }
});
setIO(io);
io.on('connection', (socket) => {
  console.log('📡 Client connected:', socket.id);
  socket.on('disconnect', () => console.log('📴 Client disconnected:', socket.id));
});

// ------------------- MONGODB CONNECTION -------------------
async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivan';
    
    // Check if MONGODB_URI is set (important for production)
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not set in environment, using local MongoDB');
    }

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000, // 30 seconds - enough for Atlas cold starts
        socketTimeoutMS: 45000,
      });
      console.log('✅ Connected to MongoDB at:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password in logs

      mongoose.connection.on('connected', () => console.log('Mongoose connected to MongoDB'));
      mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));
      mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected from MongoDB'));

      return;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      console.error('Connection URI pattern:', uri.split('@')[1] || 'localhost'); // Show only host part
      
      // Only fall back to in-memory if explicitly in development mode
      if (process.env.NODE_ENV === 'production') {
        console.error('🚫 In production mode - not falling back to in-memory DB. Exiting...');
        throw error; // Fail fast in production
      }
      
      console.log('⚠️  Development mode: falling back to in-memory database...');
    }

    const mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log('📝 Connected to in-memory MongoDB (data will NOT persist)');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// ------------------- ROUTES -------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/dev', require('./routes/devRoutes'));
app.use('/api/ideas', require('./routes/ideaRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/vision', require('./routes/visionRoutes')); // STIVAN Analyst Zero - Vision analysis

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = {
    connected: mongoose.connection.readyState === 1,
    state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host || 'not connected',
    name: mongoose.connection.name || 'not connected',
    isAtlas: mongoose.connection.host?.includes('mongodb.net') || false,
    isInMemory: mongoose.connection.host?.includes('127.0.0.1') || mongoose.connection.host?.includes('localhost') || false,
  };

  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    warning: dbStatus.isInMemory ? '⚠️ Using in-memory DB - data will not persist!' : null,
  });
});

// ------------------- ERROR HANDLING -------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' ? { details: err.message } : {}),
  });
});

// 404 handler (MUST BE LAST)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// ------------------- GRACEFUL SHUTDOWN -------------------
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  (async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection on SIGTERM:', err);
      process.exit(1);
    }
  })();
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  (async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection on SIGINT:', err);
      process.exit(1);
    }
  })();
});

// ------------------- START SERVER -------------------
async function startServer() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log('📋 Available routes:');

      // Auth routes
      console.log('   - POST /api/auth/signup');
      console.log('   - POST /api/auth/login');

      // User routes
      console.log('   - GET /api/users/me');
      console.log('   - PUT /api/users/me');
      console.log('   - PUT /api/users/me/password');
      console.log('   - GET /api/users/data');
      console.log('   - POST /api/users/content');
      console.log('   - DELETE /api/users/content/:id');
      console.log('   - GET /api/users/:userId/private-data');
      console.log('   - PUT /api/users/:userId/settings');

      // Admin routes
      console.log('   - GET /api/admin/users');
      console.log('   - GET /api/admin/users/:userId');
      console.log('   - PATCH /api/admin/users/:userId/role');
      console.log('   - PATCH /api/admin/users/:userId/status');
      console.log('   - DELETE /api/admin/users/:userId');

      // Dev routes
      console.log('   - GET /api/dev/some-dev-route');

      // Ideas routes (NEW)
      console.log('   - POST /api/ideas/evaluate');
      console.log('   - GET /api/ideas');
      console.log('   - GET /api/ideas/:id');
      console.log('   - PUT /api/ideas/:id/re-evaluate');
      console.log('   - DELETE /api/ideas/:id');

  // Chat route
  console.log('   - POST /api/chat');

      // Community routes
      console.log('   - GET /api/community/feed?tab=all|my|top');
      console.log('   - POST /api/community/posts');
      console.log('   - POST /api/community/posts/:id/like');
      console.log('   - GET /api/community/posts/:id/comments');
      console.log('   - POST /api/community/posts/:id/comments');

      // Health
      console.log('   - GET /api/health');
      console.log(`🌍 Server running at: http://localhost:${PORT}`);
    }).on('error', (err) => {
      console.error('❌ Server failed to start:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start the application:', error);
    process.exit(1);
  }
}

// Start the server
startServer();