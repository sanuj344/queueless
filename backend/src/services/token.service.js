const prisma = require('../config/prisma');

/**
 * Generates a sequential token for a specific vendor, reset daily.
 * @param {string} vendorId 
 * @returns {Promise<{tokenNumber: string, tokenIndex: number}>}
 */
const generateVendorToken = async (vendorId) => {
  try {
    // Get the start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the last order for this vendor created today
    const lastOrder = await prisma.order.findFirst({
      where: {
        vendorId,
        createdAt: {
          gte: today
        }
      },
      orderBy: {
        tokenIndex: 'desc'
      }
    });

    // Start from 101 if no orders today, else increment
    const nextIndex = lastOrder && lastOrder.tokenIndex ? lastOrder.tokenIndex + 1 : 101;
    
    // Format: A101, A102... (Prefix 'A' can be changed or made dynamic later)
    const tokenNumber = `A${nextIndex}`;

    return {
      tokenNumber,
      tokenIndex: nextIndex
    };
  } catch (error) {
    console.error('Error generating vendor token:', error);
    // Fallback values if something goes wrong
    return {
      tokenNumber: 'A101',
      tokenIndex: 101
    };
  }
};

module.exports = {
  generateVendorToken
};
