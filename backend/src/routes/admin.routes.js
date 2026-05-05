const express = require('express');
const prisma = require('../config/prisma');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes here are protected and restricted to admin
router.use(protect, restrictTo('admin'));

router.get('/dashboard', async (req, res, next) => {
  try {
    const totalVendors = await prisma.user.count({
      where: { role: 'vendor' }
    });

    const verifiedVendors = await prisma.user.count({
      where: { role: 'vendor', isApproved: true }
    });

    const unverifiedVendors = await prisma.user.count({
      where: { role: 'vendor', isApproved: false }
    });

    // orders
    const orders = await prisma.order.findMany({
      include: {
        vendor: true
      }
    });

    // commission (10%)
    let commission = 0;
    const vendorMap = {};

    orders.forEach(order => {
      if (!order.vendor) return;
      const vendorId = order.vendorId;

      if (!vendorMap[vendorId]) {
        vendorMap[vendorId] = {
          name: order.vendor.outletName || order.vendor.name,
          totalOrders: 0,
          cancelled: 0,
          revenue: 0,
          joinedAt: order.vendor.createdAt,
          status: order.vendor.isApproved ? 'verified' : 'unverified'
        };
      }

      vendorMap[vendorId].totalOrders += 1;
      vendorMap[vendorId].revenue += order.totalAmount;

      if (order.status === 'cancelled') {
        vendorMap[vendorId].cancelled += 1;
      }

      commission += order.platformFee || (order.totalAmount * 0.1);
    });

    const allVendors = await prisma.user.findMany({
      where: { role: 'vendor' }
    });

    allVendors.forEach(v => {
      if (!vendorMap[v.id]) {
        vendorMap[v.id] = {
          name: v.outletName || v.name,
          totalOrders: 0,
          cancelled: 0,
          revenue: 0,
          joinedAt: v.createdAt,
          status: v.isApproved ? 'verified' : 'unverified'
        };
      }
    });

    const vendors = Object.values(vendorMap);

    res.json({
      success: true,
      data: {
        commission,
        totalVendors,
        verifiedVendors,
        unverifiedVendors,
        vendors
      }
    });
  } catch (err) {
    next(err);
  }
});

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

/**
 * @route   GET /api/admin/customers
 * @desc    Get all customers with their order stats
 */
router.get('/customers', async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = customers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      totalOrders: c.orders.length,
      createdAt: c.createdAt
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/payments
 * @desc    Get all transactions (derived from orders)
 */
router.get('/payments', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        vendor: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = orders.map(o => ({
      id: "PAY_" + o.id.slice(0, 6).toUpperCase(),
      orderId: o.id,
      vendorName: o.vendor?.name || o.vendor?.outletName || "Unknown",
      amount: o.totalAmount,
      status: o.status === "completed" ? "success" : (o.status === "cancelled" ? "failed" : "pending"),
      createdAt: o.createdAt
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/complaints
 * @desc    Get all complaints for the admin
 */
router.get('/complaints', async (req, res, next) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        customer: true,
        vendor: true,
        order: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
});

router.get('/referrals', async (req, res, next) => {
  try {
    const referrals = await prisma.vendorReferral.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: referrals });
  } catch (error) {
    next(error);
  }
});

router.get('/commission', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: "completed"
      },
      include: {
        vendor: true
      }
    });

    let totalCommission = 0;
    let todayCommission = 0;
    let monthlyCommission = 0;

    const vendorMap = {};

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    orders.forEach(order => {
      // commission (platformFee)
      const commission = order.platformFee || 0;

      totalCommission += commission;

      const orderDate = new Date(order.createdAt);

      if (orderDate.toDateString() === today.toDateString()) {
        todayCommission += commission;
      }

      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        monthlyCommission += commission;
      }

      // vendor-wise aggregation
      if (!vendorMap[order.vendorId]) {
        vendorMap[order.vendorId] = {
          vendorName: order.vendor?.outletName || order.vendor?.name || "Vendor",
          totalSales: 0,
          commission: 0,
          orders: 0
        };
      }

      vendorMap[order.vendorId].totalSales += order.totalAmount;
      vendorMap[order.vendorId].commission += commission;
      vendorMap[order.vendorId].orders += 1;
    });

    const vendorList = Object.values(vendorMap);

    res.json({
      success: true,
      data: {
        totalCommission,
        todayCommission,
        monthlyCommission,
        pending: 0, 
        vendors: vendorList
      }
    });
  } catch (err) {
    console.error("Commission Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch commission data" });
  }
});

router.get('/analytics', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany();

    let totalRevenue = 0;
    let completed = 0;
    let pending = 0;
    let cancelled = 0;

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const revenueByDayMap = {};
    days.forEach(d => revenueByDayMap[d] = 0);

    orders.forEach(order => {
      const amount = order.totalAmount || 0;
      totalRevenue += amount;

      const date = new Date(order.createdAt);
      const dayName = days[date.getDay()];
      revenueByDayMap[dayName] += amount;

      if (order.status === "completed") completed++;
      else if (order.status === "cancelled") cancelled++;
      else pending++; // everything else is pending/placed
    });

    const revenueChart = days.map(d => ({ name: d, value: revenueByDayMap[d] }));

    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const totalCustomers = await prisma.customer.count();

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        avgOrderValue,
        revenueChart,
        orderStatus: [
          { name: "Completed", value: completed, fill: '#d4ff00' },
          { name: "Pending", value: pending, fill: '#a1a1aa' },
          { name: "Cancelled", value: cancelled, fill: '#ef4444' }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
