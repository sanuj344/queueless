const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/errors');

const registerUser = async (data) => {
  const { name, email, mobile, password, outletName, address, role } = data;

  if (role === 'vendor' && (!name || !outletName || !mobile || !password || !address)) {
    throw new ApiError(400, 'All vendor fields are required');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      mobile,
      password: hashedPassword,
      outletName,
      address,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      outletName: true,
      address: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

const loginUser = async (data) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
};

module.exports = { registerUser, loginUser };
