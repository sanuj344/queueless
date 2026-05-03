const express = require('express');
const prisma = require('../config/prisma');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Create Referral (Public - Guest / Customer)
router.post('/', async (req, res, next) => {
  try {
    const { name, phone, location, referredByPhone } = req.body;
    if (!name || !phone || !location) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const referral = await prisma.vendorReferral.create({
      data: {
        name,
        phone,
        location,
        referredByPhone: referredByPhone || 'guest',
        status: 'pending'
      }
    });

    res.status(201).json({ success: true, data: referral });
  } catch (error) {
    next(error);
  }
});

// Admin endpoint to get referrals
router.get('/', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const referrals = await prisma.vendorReferral.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: referrals });
  } catch (error) {
    next(error);
  }
});

// Admin update status endpoint
router.patch('/:id', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const referral = await prisma.vendorReferral.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.status(200).json({ success: true, data: referral });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
