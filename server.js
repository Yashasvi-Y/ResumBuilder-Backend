import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose'; // <-- add this import

import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to handle CORS
app.use(cors());

// Middleware
app.use(express.json());

// Connect MongoDB using .env variables
const { MONGO_USER, MONGO_PASS, MONGO_CLUSTER, MONGO_DB } = process.env;
const MONGO_URI = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_CLUSTER}/${MONGO_DB}?retryWrites=true&w=majority`;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// Static uploads folder
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, _path) => {
      res.set('Access-Control-Allow-Origin', 'https://resumexpert-frontend.onrender.com');
    },
  })
);

// Test Route
app.get('/', (req, res) => {
  res.send('✅ API WORKING');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
