const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

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

module.exports = router;
