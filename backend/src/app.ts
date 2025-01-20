import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.config';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

const app: Application = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const apiPrefix = env.API_PREFIX || '/api';
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/auth`, authRoutes);

// Health Check Route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', environment: env.NODE_ENV });
});

// Welcome Route
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to OnePay API',
    version: '1.0.0',
    environment: env.NODE_ENV
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

export default app;
