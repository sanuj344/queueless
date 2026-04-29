const express = require('express');
const prisma = require('../config/prisma');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Create Order (Public)
router.post('/', async (req, res, next) => {
  try {
    const { customerName, customerPhone, vendorId, items, totalAmount } = req.body;
    
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        vendorId,
        items,
        totalAmount: parseFloat(totalAmount),
        status: 'pending'
      }
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Get Vendor Orders (Protected)
router.get('/vendor', protect, restrictTo('vendor'), async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { vendorId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

// Get Order by ID (Public for tracking)
router.get('/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id }
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Update Order Status (Protected)
router.patch('/:id', protect, restrictTo('vendor'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
