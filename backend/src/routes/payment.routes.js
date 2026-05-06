const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { generateVendorToken } = require('../services/token.service');

const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SkrpjWAPFjMaX5',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'I0WqwO5V20ZJnBvm9VfyKMcG'
});

// 🔹 Create Razorpay Order (Only for platformFee)
router.post('/create-order', async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert to paisa
      currency: 'INR'
    });

    res.json(order);
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    res.status(500).json({ message: 'Payment order creation failed', error: err.message });
  }
});

// 🔹 Verify Payment and Create DB Order
router.post('/verify', async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'I0WqwO5V20ZJnBvm9VfyKMcG';

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Check if Vendor ID is missing
    if (!orderData.vendorId) {
      return res.status(400).json({ message: 'Vendor ID missing' });
    }

    const { customerName, customerPhone, vendorId, totalAmount, platformFee, finalAmount } = orderData;

    // Check if phone belongs to a vendor
    const existingVendor = await prisma.user.findFirst({
      where: { mobile: customerPhone, role: 'vendor' }
    });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'This number is already registered as a vendor. Please login as vendor.'
      });
    }

    // Find or create customer by phone
    let customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });
    if (!customer) {
      const { generateReferralCode } = require('../utils/referral');
      customer = await prisma.customer.create({
        data: { name: customerName, phone: customerPhone, referralCode: generateReferralCode() }
      });
    } else if (customer.name !== customerName) {
      customer = await prisma.customer.update({
        where: { phone: customerPhone },
        data: { name: customerName }
      });
    }

    const token = await generateVendorToken(vendorId);

    // 🔀 Branch: Salon Booking vs Food Order
    if (orderData.type === 'salon') {
      const { services, slotTime } = orderData;

      // Slot conflict check (capacity = 1 for Phase 1)
      const slotDateTime = new Date(slotTime);
      const existingSlot = await prisma.booking.count({
        where: { vendorId, slotTime: slotDateTime, status: { not: 'cancelled' } }
      });
      if (existingSlot >= 1) {
        return res.status(409).json({ success: false, message: 'This slot is already booked. Please choose another time.' });
      }

      const booking = await prisma.booking.create({
        data: {
          customerName,
          customerPhone,
          customerId: customer.id,
          vendorId,
          services,
          totalAmount: parseFloat(totalAmount),
          platformFee: parseFloat(platformFee || 0),
          finalAmount: parseFloat(finalAmount || totalAmount),
          slotTime: slotDateTime,
          status: 'placed',
          paymentMethod: 'razorpay',
          paymentStatus: 'paid',
          tokenNumber: token.tokenNumber,
          tokenIndex: token.tokenIndex,
          type: 'salon'
        }
      });

      return res.json({ success: true, booking, type: 'salon' });
    }

    // 🍔 Food Order (existing logic)
    const { items, deliveryTime } = orderData;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const createdOrder = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerId: customer.id,
        vendorId,
        items,
        totalAmount: parseFloat(totalAmount),
        platformFee: parseFloat(platformFee || 0),
        finalAmount: parseFloat(finalAmount || totalAmount),
        status: 'placed',
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        deliveryTime: deliveryTime || 'ASAP',
        expiresAt,
        tokenNumber: token.tokenNumber,
        tokenIndex: token.tokenIndex
      }
    });

    res.json({
      success: true,
      order: createdOrder
    });
  } catch (error) {
    console.error('Payment verification or order creation failed:', error);
    next(error);
  }
});

// 🔹 Get Wallet Balance
router.get('/wallet-balance', async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    // Also check the user table to see if a vendor has that phone/mobile number
    let vendor = await prisma.user.findFirst({
      where: { mobile: phone },
      include: { wallet: true }
    });

    if (vendor) {
      if (!vendor.wallet) {
        const wallet = await prisma.wallet.create({
          data: {
            userId: vendor.id,
            balance: 500.0
          }
        });
        return res.json({ balance: wallet.balance, customerId: vendor.id, referralCode: vendor.referralCode });
      }
      return res.json({ balance: vendor.wallet.balance, customerId: vendor.id, referralCode: vendor.referralCode });
    }

    let customer = await prisma.customer.findUnique({
      where: { phone },
      include: { wallet: true }
    });
    
    // If customer doesn't exist, create it on demand so they have a wallet!
    if (!customer) {
      const { generateReferralCode } = require('../utils/referral');
      customer = await prisma.customer.create({
        data: { name: 'Guest', phone, referralCode: generateReferralCode() },
        include: { wallet: true }
      });
    }

    // If customer exists but no referral code, create one on the fly!
    if (customer && !customer.referralCode) {
      const { generateReferralCode } = require('../utils/referral');
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { referralCode: generateReferralCode() },
        include: { wallet: true }
      });
    }

    // If customer exists but no wallet, create on the fly with 500 default balance!
    if (!customer.wallet) {
      const wallet = await prisma.wallet.create({
        data: {
          customerId: customer.id,
          balance: 500.0
        }
      });
      return res.json({ balance: wallet.balance, customerId: customer.id, referralCode: customer.referralCode });
    }

    res.json({ balance: customer.wallet.balance, customerId: customer.id, referralCode: customer.referralCode });
  } catch (err) {
    next(err);
  }
});

// 🔹 Pay With Wallet
const clientOrderIdCache = new Map();

router.post('/wallet-pay', async (req, res, next) => {
  try {
    const { userId, amount, commissionAmount, orderData } = req.body;
    const finalCommission = parseFloat(commissionAmount || amount);

    if (!finalCommission) {
      return res.status(400).json({ message: 'Commission amount required' });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { customerId: userId }
    });

    if (!wallet) {
      return res.status(400).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < finalCommission) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // 🔒 Prevent duplicate requests
    if (orderData?.clientOrderId) {
      if (clientOrderIdCache.has(orderData.clientOrderId)) {
        return res.json({ success: true, order: clientOrderIdCache.get(orderData.clientOrderId) });
      }
    }
    const recentOrder = await prisma.order.findFirst({
      where: {
        customerId: userId,
        vendorId: orderData.vendorId,
        createdAt: {
          gte: new Date(Date.now() - 3000)
        }
      }
    });
    if (recentOrder) {
      return res.json({ success: true, order: recentOrder });
    }

    // Deduct wallet balance
    await prisma.wallet.update({
      where: { customerId: userId },
      data: { balance: { decrement: finalCommission } }
    });

    const { customerName, customerPhone, vendorId, totalAmount, platformFee, finalAmount } = orderData;
    const token = await generateVendorToken(vendorId);

    // 🔀 Branch: Salon Booking vs Food Order
    if (orderData.type === 'salon') {
      const { services, slotTime } = orderData;
      const slotDateTime = new Date(slotTime);

      const existingSlot = await prisma.booking.count({
        where: { vendorId, slotTime: slotDateTime, status: { not: 'cancelled' } }
      });
      if (existingSlot >= 1) {
        // Refund wallet since slot is taken
        await prisma.wallet.update({
          where: { customerId: userId },
          data: { balance: { increment: finalCommission } }
        });
        return res.status(409).json({ success: false, message: 'This slot is already booked. Please choose another time.' });
      }

      const booking = await prisma.booking.create({
        data: {
          customerName, customerPhone, customerId: userId, vendorId,
          services, totalAmount: parseFloat(totalAmount),
          platformFee: parseFloat(platformFee || 0),
          finalAmount: parseFloat(finalAmount || totalAmount),
          slotTime: slotDateTime, status: 'placed',
          paymentMethod: 'wallet', paymentStatus: 'paid',
          tokenNumber: token.tokenNumber, tokenIndex: token.tokenIndex,
          type: 'salon'
        }
      });
      return res.json({ success: true, booking, type: 'salon' });
    }

    // 🍔 Food Order
    const { items, deliveryTime } = orderData;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const createdOrder = await prisma.order.create({
      data: {
        customerName, customerPhone, customerId: userId, vendorId,
        items, totalAmount: parseFloat(totalAmount),
        platformFee: parseFloat(platformFee || 0),
        finalAmount: parseFloat(finalAmount || totalAmount),
        status: 'placed', paymentMethod: 'wallet', paymentStatus: 'paid',
        deliveryTime: deliveryTime || 'ASAP', expiresAt,
        tokenNumber: token.tokenNumber, tokenIndex: token.tokenIndex
      }
    });

    if (orderData?.clientOrderId) {
      clientOrderIdCache.set(orderData.clientOrderId, createdOrder);
      if (clientOrderIdCache.size > 1000) {
        const keys = Array.from(clientOrderIdCache.keys());
        clientOrderIdCache.delete(keys[0]);
      }
    }

    res.json({ success: true, order: createdOrder });
  } catch (error) {
    console.error('Wallet payment failed:', error);
    res.status(500).json({ message: 'Wallet payment failed' });
  }
});


// 🔹 Secure Wallet Top-up (Razorpay)
router.post('/topup/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paisa
      currency: 'INR'
    });

    res.json(order);
  } catch (err) {
    console.error('Top-up order creation failed:', err);
    res.status(500).json({ message: 'Top-up order creation failed' });
  }
});

router.post('/topup/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      phone
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount || !phone) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'I0WqwO5V20ZJnBvm9VfyKMcG';

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // ✅ WALLET UPDATE
    // Check if it's a vendor first
    const vendor = await prisma.user.findFirst({
      where: { mobile: phone },
      include: { wallet: true }
    });

    let wallet;
    if (vendor) {
      if (!vendor.wallet) {
        wallet = await prisma.wallet.create({
          data: { userId: vendor.id, balance: 500.0 + parseFloat(amount) }
        });
      } else {
        wallet = await prisma.wallet.update({
          where: { userId: vendor.id },
          data: { balance: { increment: parseFloat(amount) } }
        });
      }
    } else {
      // It's a customer
      let customer = await prisma.customer.findUnique({
        where: { phone },
        include: { wallet: true }
      });

      if (!customer) {
        const { generateReferralCode } = require('../utils/referral');
        customer = await prisma.customer.create({
          data: { name: 'Guest', phone, referralCode: generateReferralCode() },
          include: { wallet: true }
        });
      }

      if (!customer.wallet) {
        wallet = await prisma.wallet.create({
          data: { customerId: customer.id, balance: 500.0 + parseFloat(amount) }
        });
      } else {
        wallet = await prisma.wallet.update({
          where: { customerId: customer.id },
          data: { balance: { increment: parseFloat(amount) } }
        });
      }
    }

    res.json({ success: true, balance: wallet.balance });

  } catch (err) {
    console.error('Top-up verification failed:', err);
    res.status(500).json({ message: 'Top-up failed' });
  }
});

// 🔹 Old Wallet Top-up (keeping for fallback if needed, but not used by new frontend)
router.post('/wallet-topup', async (req, res, next) => {

  try {
    const { phone, amount } = req.body;
    if (!phone || !amount) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    let customer = await prisma.customer.findUnique({
      where: { phone },
      include: { wallet: true }
    });

    if (!customer) {
      const { generateReferralCode } = require('../utils/referral');
      customer = await prisma.customer.create({
        data: { name: 'Guest', phone, referralCode: generateReferralCode() },
        include: { wallet: true }
      });
    }

    let wallet = customer.wallet;
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          customerId: customer.id,
          balance: 500.0 + parseFloat(amount)
        }
      });
    } else {
      wallet = await prisma.wallet.update({
        where: { customerId: customer.id },
        data: {
          balance: {
            increment: parseFloat(amount)
          }
        }
      });
    }

    res.json({ success: true, balance: wallet.balance });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
