const prisma = require('../config/prisma');

const FIVE_MIN = 5 * 60 * 1000;
const TEN_MIN = 10 * 60 * 1000;

const checkOrderTimeouts = async () => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['placed', 'pending', 'accepted', 'preparing', 'ready']
        }
      }
    });

    const now = Date.now();

    for (const order of orders) {
      // 🔹 ACCEPT TIMER
      if (order.status === 'placed' || order.status === 'pending') {
        if (now - new Date(order.createdAt).getTime() > FIVE_MIN) {
          await cancelOrder(order.id);
        }
      }

      // 🔹 PREPARING TIMER
      if (order.status === 'accepted' && order.acceptedAt) {
        if (now - new Date(order.acceptedAt).getTime() > TEN_MIN) {
          await cancelOrder(order.id);
        }
      }

      // 🔹 READY TIMER
      if (order.status === 'preparing' && order.preparingAt) {
        if (now - new Date(order.preparingAt).getTime() > FIVE_MIN) {
          await cancelOrder(order.id);
        }
      }
    }
  } catch (error) {
    console.error('Error checking order timeouts:', error);
  }
};

const cancelOrder = async (orderId) => {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled'
      }
    });
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
  }
};

module.exports = { checkOrderTimeouts };
