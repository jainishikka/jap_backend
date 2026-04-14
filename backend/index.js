import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import envt_imports from './envt_imports/envt_imports.js';

import usersRouter       from './routes/users.js';
import appointmentsRouter from './routes/appointments.js';
import finalizedRouter   from './routes/finalized.js';

dotenv.config();

const app  = express();
const PORT = 5001;

// MongoDB connection
mongoose
  .connect(envt_imports.mongodbUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Redis Client (optional — app works without it)
let redisClient = null;
let redisReady  = false;

const redisRaw = createClient({
  url: `redis://${envt_imports.redisHost || '127.0.0.1'}:${envt_imports.redisPort || 6379}`,
});

redisRaw.on('error', () => {
  // Suppress repeated error logs — Redis is optional
  redisReady = false;
});

redisRaw
  .connect()
  .then(() => {
    redisClient = redisRaw;
    redisReady  = true;
    console.log('Redis connected (caching enabled)');
  })
  .catch(() => {
    console.warn('Redis unavailable — running without cache');
  });

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Cache Middleware (skipped gracefully when Redis is not available)
const cache = async (req, res, next) => {
  if (!redisReady) return next();

  const key = req.originalUrl;
  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      redisClient.setEx(key, 60, JSON.stringify(data)).catch(() => {});
      return originalJson(data);
    };

    next();
  } catch {
    next();
  }
};

// Routes
app.get('/test', (req, res) => res.send('Backend is working!'));

app.use('/users',        cache, usersRouter);
app.use('/appointments', cache, appointmentsRouter);
app.use('/finalized',    cache, finalizedRouter);

// Invalidate cache on writes
app.use((req, res, next) => {
  if (redisReady && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
    redisClient.flushDb().catch(() => {});
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
