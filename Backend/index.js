import express from 'express';
import dotenv from 'dotenv';
import { dbConnect } from './config/db.js';
import router from './route/userRoute.js';
import adminRoute from './route/adminRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  abortOnLimit: false,
}));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Serve uploaded images
app.use('/img', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 9000;
dbConnect();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running smoothly.' });
});

app.use('/api', router);
app.use('/api', adminRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled express error:", err);
  res.status(500).json({
    code: 500,
    message: err.message || "Server error occurred. Please try again later.",
    data: ''
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});