const express = require('express');
const prisma = require('../config/prisma');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// GET /bookings/vendor — vendor's bookings (protected)
router.get('/vendor', protect, restrictTo('vendor'), async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { vendorId: req.user.id },
      orderBy: { slotTime: 'asc' }
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
});

// GET /bookings/:id — public tracking
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        vendor: {
          select: { mobile: true, outletName: true, name: true }
        }
      }
    });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

// POST /bookings/customer-action — customer notifies vendor (public)
router.post('/customer-action', async (req, res, next) => {
  try {
    const { bookingId, action } = req.body;
    const validActions = ['coming', 'delayed', 'contact'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { customerAction: action }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// PATCH /bookings/:id/cancel — customer cancel (before slot time)
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (new Date() >= new Date(booking.slotTime)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel after service has started' });
    }
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking already finalised' });
    }
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// PATCH /bookings/:id — vendor updates booking status (protected)
router.patch('/:id', protect, restrictTo('vendor'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'in_service', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
