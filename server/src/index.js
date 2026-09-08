const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const itemsRoutes = require('./routes/items');
const requestsRoutes = require('./routes/requests');
const transactionsRoutes = require('./routes/transactions');
const notificationsRoutes = require('./routes/notifications');
const profileRoutes = require('./routes/profile');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CampusLink Backend API Server is running.',
    frontendUrl: 'http://localhost:3000',
    endpoints: ['/api/health', '/api/auth/signup', '/api/auth/login', '/api/dashboard/summary']
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusLink API Server active' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 CampusLink Server running on http://localhost:${PORT}`);
});
