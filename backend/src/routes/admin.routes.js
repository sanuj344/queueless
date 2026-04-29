const express = require('express');
const prisma = require('../config/prisma');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes here are protected and restricted to admin
router.use(protect, restrictTo('admin'));

/**
 * @route   GET /api/admin/vendors
 * @desc    Get all vendors
 */
router.get('/vendors', async (req, res, next) => {
  try {
    const vendors = await prisma.user.findMany({
      where: { role: 'vendor' },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        outletName: true,
        address: true,
        isApproved: true,
        hasGst: true,
        gstNumber: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[Admin API] Found ${vendors.length} vendors`);
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/admin/vendor/:id
 * @desc    Approve or update vendor status
 */
router.patch('/vendor/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const vendor = await prisma.user.update({
      where: { id },
      data: { isApproved },
      select: { id: true, name: true, isApproved: true }
    });

    res.status(200).json({ 
      success: true, 
      message: `Vendor ${vendor.name} is now ${isApproved ? 'approved' : 'pending'}`,
      data: vendor 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders across the platform
 */
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // In a real app, we'd use relations to get vendor names. 
    // Since we're using Prisma with JSON for items, let's also fetch vendor names manually if needed or just return raw.
    // For now, let's return raw orders.

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
