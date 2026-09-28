require('dotenv').config();

const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes');
const { initDatabase, closeDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// ── Middleware ────────────────────────────────
app.use(cors({ origin: CORS_ORIGIN, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '1mb' }));

// ── Routes ───────────────────────────────────
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Task Dashboard API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start (async to wait for DB init) ────────
async function start() {
  try {
    await initDatabase();

    const server = app.listen(PORT, () => {
      console.log(`\n  🚀 Task Dashboard API running at http://localhost:${PORT}`);
      console.log(`  📦 CORS origin: ${CORS_ORIGIN}`);
      console.log(`  🗄️  Database: SQLite via sql.js\n`);
    });

    process.on('SIGINT', () => {
      console.log('\n[Server] Shutting down...');
      closeDb();
      server.close(() => process.exit(0));
    });

    process.on('SIGTERM', () => {
      closeDb();
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
}

start();
