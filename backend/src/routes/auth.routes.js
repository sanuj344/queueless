const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const z = require('zod');

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    mobile: z.string().regex(/^\d{10}$/, 'Mobile must be exactly 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    outletName: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(['customer', 'vendor'], {
      errorMap: () => ({ message: 'Role must be customer or vendor' })
    }),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

module.exports = router;
