const express = require('express');
const prisma = require('../config/prisma');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// GET /bookings/vendor/:vendorId/booked-slots — fetch taken slots for a date
router.get('/vendor/:vendorId/booked-slots', async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date required' });

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        vendorId: req.params.vendorId,
        slotTime: {
          gte: startDate,
          lt: endDate
        },
        status: { not: 'cancelled' }
      },
      select: { slotTime: true }
    });

    const bookedSlots = bookings.map(b => {
      const d = new Date(b.slotTime);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    });

    res.json({ success: true, data: bookedSlots });
  } catch (error) {
    next(error);
  }
});

// GET /bookings/vendor — vendor's bookings (protected)
router.get('/vendor', protect, restrictTo('vendor'), async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { vendorId: req.user.id },
      include: { stylist: true },
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
        },
        stylist: true
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
    if (booking.status !== 'placed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel after booking is accepted or processed' });
    }
    if (new Date() >= new Date(booking.slotTime)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel after service time' });
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

// PATCH /bookings/:id/arrived — customer marking arrival
router.patch('/:id/arrived', async (req, res, next) => {
  try {
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { hasArrived: true }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// PATCH /bookings/:id/pay — vendor marking payment at salon
router.patch('/:id/pay', protect, restrictTo('vendor'), async (req, res, next) => {
  try {
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { paymentStatus: 'paid' }
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
    const updateData = {};
    
    if (req.body.stylistId) {

      const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      
      if (booking.stylistPreference === 'specific' && booking.stylistId && booking.stylistId !== req.body.stylistId) {
        return res.status(400).json({ success: false, message: 'Stylist cannot be changed for specific requests' });
      }

      // Conflict check for the manually assigned stylist
      const conflict = await prisma.booking.findFirst({
        where: {
          vendorId: req.user.id,
          stylistId: req.body.stylistId,
          slotTime: booking.slotTime,
          status: { not: 'cancelled' },
          id: { not: booking.id }
        }
      });

      if (conflict) {
        return res.status(400).json({ success: false, message: 'This stylist is already booked for this slot' });
      }

      updateData.stylistId = req.body.stylistId;
    }


    const validStatuses = ['accepted', 'in_service', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (status) updateData.status = status;

    
    if (status === 'accepted') {
      const { tokenNumber } = req.body;
      if (!tokenNumber || !/^\d{3}$/.test(tokenNumber)) {
        return res.status(400).json({ success: false, message: '3-digit numeric token is required' });
      }

      // Duplicate check (Active Orders)
      const duplicateOrder = await prisma.order.findFirst({
        where: {
          vendorId: req.user.id,
          tokenNumber,
          status: { notIn: ['completed', 'cancelled'] }
        }
      });

      // Duplicate check (Active Bookings)
      const duplicateBooking = await prisma.booking.findFirst({
        where: {
          vendorId: req.user.id,
          tokenNumber,
          status: { notIn: ['completed', 'cancelled'] }
        }
      });

      if (duplicateOrder || duplicateBooking) {
        return res.status(400).json({ success: false, message: 'Token already in use' });
      }

      updateData.tokenNumber = tokenNumber;
    } else if (status === 'in_service') {
      updateData.serviceStartTime = new Date();
    } else if (status === 'completed') {
      updateData.serviceEndTime = new Date();
    }


    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
