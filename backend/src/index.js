require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedPatterns = [
      'http://localhost:3000',
      /\.vercel\.app$/,
      process.env.FRONTEND_URL
    ];

    if (!origin || allowedPatterns.some(p =>
      typeof p === 'string' ? p === origin : p.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  }
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/invite', require('./routes/guestFlow'));
app.use('/api/push', require('./routes/push'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Express error-handling middleware — must be registered after all routes
app.use((err, req, res, next) => {
  console.error('[Express error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}).catch((err) => {
  console.error('DB connection failed:', err.message);
  process.exit(1);
});

// Catch synchronous exceptions that escaped all other error handling
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1);
});

// Catch rejected promises that were never handled
process.on('unhandledRejection', (reason, promise) => {
  console.error('[unhandledRejection] at:', promise, 'reason:', reason);
});
