// /api/orders.js — Returns all orders for the admin dashboard

const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  // Password check
  const { password } = req.query;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorised' });
  }

  try {
    // Get all order IDs sorted by newest first
    const orderIds = await redis.zrange('orders', 0, -1, { rev: true });

    if (!orderIds || orderIds.length === 0) {
      return res.status(200).json({ orders: [] });
    }

    // Fetch all orders in parallel
    const orders = await Promise.all(
      orderIds.map(async (id) => {
        const order = await redis.get(`order:${id}`);
        return typeof order === 'string' ? JSON.parse(order) : order;
      })
    );

    return res.status(200).json({ orders: orders.filter(Boolean) });

  } catch (err) {
    console.error('Orders fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
