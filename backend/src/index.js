require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const client = require('prom-client');
const logger = require('./utils/logger');
const { startSync } = require('./syncService');

const app = express();
const httpServer = createServer(app);

// Start Real-time Data Sync
startSync();

// ── WebSocket ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  logger.info(`WS connected: ${socket.id}`);
  socket.emit('system:status', { status: 'ok', message: 'ResQAI real-time channel active' });

  // Broadcast live incident updates every 10s (mock)
  const ticker = setInterval(() => {
    socket.emit('incident:update', {
      type: 'metric_update',
      activeIncidents: Math.floor(Math.random() * 3) + 4,
      timestamp: new Date().toISOString(),
    });
  }, 10000);

  socket.on('disconnect', () => {
    clearInterval(ticker);
    logger.info(`WS disconnected: ${socket.id}`);
  });
});

// ── Prometheus metrics ────────────────────────────────────────────────────────
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ 
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost',
    'http://localhost:80'
  ], 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));

// Request duration middleware
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => end({ method: req.method, route: req.path, status: res.statusCode }));
  next();
});

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests' } });
app.use('/api/', limiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/users', require('./routes/users'));

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ResQAI Backend', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`🚑 ResQAI Backend running on port ${PORT}`);
  logger.info(`🔌 WebSocket server active`);
  logger.info(`📊 Prometheus metrics at /metrics`);
});

module.exports = { app, io };
