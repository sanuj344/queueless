const calculatePlatformFee = (amount) => {
  if (amount < 200) return 5;
  if (amount <= 500) return 10;
  if (amount <= 1000) return 15;
  return 20;
};

module.exports = { calculatePlatformFee };
