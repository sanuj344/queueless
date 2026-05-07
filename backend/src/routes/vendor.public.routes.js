const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

router.get('/:id', async (req, res, next) => {
  try {
    const vendor = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        outletName: true,
        address: true,
        averagePrepTime: true,
        mobile: true,
        vendorType: true,
        role: true,
        stylists: true
      }
    });

    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/available-stylists', async (req, res, next) => {
  try {
    const { id: vendorId } = req.params;
    const { slotTime } = req.query;

    if (!slotTime) return res.status(400).json({ success: false, message: 'slotTime required' });

    const stylists = await prisma.stylist.findMany({
      where: { vendorId }
    });

    const booked = await prisma.booking.findMany({
      where: {
        vendorId,
        slotTime: new Date(slotTime),
        status: { not: 'cancelled' }
      },
      select: { stylistId: true }
    });

    const bookedIds = booked.map(b => b.stylistId).filter(Boolean);
    const available = stylists.map(s => ({
      ...s,
      isBooked: bookedIds.includes(s.id)
    }));

    res.json({ success: true, data: available });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
