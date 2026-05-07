const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const prisma = require('../config/prisma');

const router = express.Router();

router.get('/generate-qr', protect, restrictTo('vendor'), async (req, res) => {
  const vendorId = req.user.id;
  const menuUrl = `http://localhost:5173/menu?vendorId=${vendorId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`;
  
  res.status(200).json({
    success: true,
    data: {
      qrUrl: qrImageUrl,
      menuUrl: menuUrl
    }
  });
});

// GET /vendor/profile — returns full vendor profile including vendorType
router.get('/profile', protect, restrictTo('vendor'), async (req, res, next) => {
  try {
    const vendor = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        outletName: true,
        address: true,
        averagePrepTime: true,
        role: true,
        vendorType: true,
        referralCode: true,
        isApproved: true,
        createdAt: true
      }
    });
    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
});

// GET /vendor/stylists — returns all stylists for the vendor
router.get('/stylists', protect, restrictTo('vendor'), async (req, res, next) => {
  try {
    const stylists = await prisma.stylist.findMany({
      where: { vendorId: req.user.id }
    });
    res.json({ success: true, data: stylists });
  } catch (error) {
    next(error);
  }
});

// POST /vendor/stylists — add a new stylist
router.post('/stylists', protect, restrictTo('vendor'), async (req, res, next) => {
  try {
    const { name } = req.body;
    const stylist = await prisma.stylist.create({
      data: {
        name,
        vendorId: req.user.id
      }
    });
    res.json({ success: true, data: stylist });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
