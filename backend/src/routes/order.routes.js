const express = require('express');
const prisma = require('../config/prisma');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { calculatePlatformFee } = require('../utils/calculateFee');

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
      const { generateReferralCode } = require('../utils/referral');
      customer = await prisma.customer.create({
        data: { name: customerName, phone: customerPhone, referralCode: generateReferralCode() }
      });
    } else if (customer.name !== customerName) {
      // Update name if customer is placing order with a different name
      customer = await prisma.customer.update({
        where: { phone: customerPhone },
        data: { name: customerName }
      });
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const fee = calculatePlatformFee(parseFloat(totalAmount));

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerId: customer.id,
        vendorId,
        items,
        totalAmount: parseFloat(totalAmount),
        platformFee: fee,
        finalAmount: parseFloat(totalAmount) + fee,
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
      where: { id: req.params.id },
      include: {
        vendor: {
          select: {
            mobile: true,
            outletName: true,
            name: true
          }
        }
      }
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

    if (status === 'completed') {
      const vendorId = order.vendorId;
      const completedOrders = await prisma.order.count({
        where: {
          vendorId,
          status: 'completed'
        }
      });

      if (completedOrders === 10) {
        const referral = await prisma.referral.findFirst({
          where: {
            referredUser: vendorId,
            rewardGiven: false
          }
        });

        if (referral) {
          const referrerUser = await prisma.user.findFirst({
            where: { referralCode: referral.referrerCode }
          });

          if (referrerUser) {
            await prisma.wallet.update({
              where: { userId: referrerUser.id },
              data: { balance: { increment: 100 } }
            });
          } else {
            const referrerCust = await prisma.customer.findFirst({
              where: { referralCode: referral.referrerCode }
            });

            if (referrerCust) {
              await prisma.wallet.update({
                where: { customerId: referrerCust.id },
                data: { balance: { increment: 100 } }
              });
            }
          }

          await prisma.referral.update({
            where: { id: referral.id },
            data: { rewardGiven: true }
          });
        }
      }
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Update Customer Action (Public — for 'ready' orders)
router.post('/customer-action', async (req, res, next) => {
  try {
    const { orderId, action } = req.body;
    const validActions = ['coming', 'delayed', 'contact'];

    if (!validActions.includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Action allowed only when order is ready'
      });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { customerAction: action }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
