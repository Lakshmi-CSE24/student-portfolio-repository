import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Database
import { pool, testConnection } from './config/database.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root info
app.get('/', (req, res) => {
  res.json({
    name: 'Student Portfolio Repository API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api',
  });
});

// Database-verified health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();

    return res.status(200).json({
      success: true,
      message: 'API and database are working',
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// API Overview
app.get('/api', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Student Portfolio Repository Express API is running.',
    endpoints: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/profile',
      '/api/projects',
      '/api/achievements',
      '/api/skills',
      '/api/certificates',
    ],
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/public', publicRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server and verify MySQL database connection
app.listen(PORT, async () => {
  console.log(`[API Server] Running on http://localhost:${PORT}`);
  console.log(`[API Server] Healthcheck: http://localhost:${PORT}/api/health`);
  await testConnection();
});

export default app;
