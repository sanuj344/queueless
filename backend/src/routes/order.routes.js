const express = require('express');
const prisma = require('../config/prisma');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Create Order (Public — Guest Checkout)
router.post('/', async (req, res, next) => {
  try {
    const { customerName, customerPhone, vendorId, items, totalAmount, deliveryTime } = req.body;

    const existingVendor = await prisma.user.findFirst({
      where: { mobile: customerPhone, role: 'vendor' }
    });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "This number is already registered as a vendor. Please login as vendor."
      });
    }

    // Find or create customer by phone (persistent guest tracking)
    let customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: customerName, phone: customerPhone }
      });
    } else if (customer.name !== customerName) {
      // Update name if customer is placing order with a different name
      customer = await prisma.customer.update({
        where: { phone: customerPhone },
        data: { name: customerName }
      });
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerId: customer.id,
        vendorId,
        items,
        totalAmount: parseFloat(totalAmount),
        status: 'pending',
        deliveryTime: deliveryTime || 'ASAP',
        expiresAt
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

    const now = new Date();
    // Auto-timeout check
    for (const order of orders) {
      if (order.status === 'pending' && order.expiresAt && now > new Date(order.expiresAt)) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'cancelled' }
        });
        order.status = 'cancelled';
      }
    }

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

// Get Order by ID (Public for tracking)
router.get('/:id', async (req, res, next) => {
  try {
    let order = await prisma.order.findUnique({
      where: { id: req.params.id }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const now = new Date();
    // Auto-timeout check
    if (order.status === 'pending' && order.expiresAt && now > new Date(order.expiresAt)) {
      order = await prisma.order.update({
        where: { id: order.id },
        data: { status: 'cancelled' }
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Customer Cancel Order
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Allow if status is placed or pending
    if (order.status !== 'placed' && order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled after preparation starts'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
});

// Update Order Status (Protected)
router.patch('/:id', protect, restrictTo('vendor'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const dataToUpdate = { status };

    if (status === 'accepted') {
      dataToUpdate.acceptedAt = new Date();
    } else if (status === 'preparing') {
      dataToUpdate.preparingAt = new Date();
    } else if (status === 'ready') {
      dataToUpdate.readyAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: dataToUpdate
    });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
