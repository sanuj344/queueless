const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Routes Setup
const authRoutes = require('./routes/auth.routes');
const menuVendorRoutes = require('./routes/menu.routes');
const menuPublicRoutes = require('./routes/menu.public.routes');
const orderRoutes = require('./routes/order.routes');
const vendorRoutes = require('./routes/vendor.routes');
const vendorPublicRoutes = require('./routes/vendor.public.routes');
const adminRoutes = require('./routes/admin.routes');
const customerRoutes = require('./routes/customer.routes');
const complaintRoutes = require('./routes/complaint.routes');
const reviewRoutes = require('./routes/review.routes');
const referralRoutes = require('./routes/referral.routes');

app.use('/api/auth', authRoutes);
app.use('/api/vendor/menu', menuVendorRoutes);
app.use('/api/menus', menuPublicRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendors', vendorPublicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/referrals', referralRoutes);

// Catch undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
