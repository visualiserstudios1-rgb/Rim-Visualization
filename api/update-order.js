// /api/update-order.js — Updates order status and emails customer when delivered

const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, orderId, status } = req.body;

  // Password check
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorised' });
  }

  const validStatuses = ['received', 'in_progress', 'delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    // Get existing order
    const raw = await redis.get(`order:${orderId}`);
    const order = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Update status
    order.status = status;
    order.updatedAt = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
    await redis.set(`order:${orderId}`, JSON.stringify(order));

    // If marked as delivered — email the customer
    if (status === 'delivered') {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'RimViz <onboarding@resend.dev>',
          to: order.customerEmail,
          subject: `Your RimViz Visualisation is Ready — ${orderId}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #000; padding: 40px 32px; text-align: center;">
                <h1 style="color: white; font-size: 28px; font-weight: 300; margin: 0;">Rim<span style="font-weight:700;">Viz</span></h1>
              </div>
              <div style="padding: 40px 32px;">
                <h2 style="font-size: 22px; font-weight: 600; color: #1d1d1f; margin: 0 0 12px;">Your Visualisation is Ready! 🎉</h2>
                <p style="color: #6b7280; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">
                  Hi ${order.customerName}, your rim visualisation for your <strong>${order.rimSize}" rims</strong> is complete and has been sent to you separately. Please check your inbox including your spam folder.
                </p>
                <div style="background: #f9fafb; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px; border: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">Order reference</p>
                  <p style="color: #1d1d1f; font-size: 18px; font-weight: 700; margin: 0;">${orderId}</p>
                </div>
                <p style="color: #6b7280; font-size: 15px; line-height: 1.7;">
                  Not received it? Reply to this email or contact us at 
                  <a href="mailto:visualiserstudios1@gmail.com" style="color: #1d1d1f; font-weight: 600;">visualiserstudios1@gmail.com</a>
                </p>
              </div>
            </div>
          `,
        }),
      });
    }

    return res.status(200).json({ success: true, order });

  } catch (err) {
    console.error('Update order error:', err);
    return res.status(500).json({ error: 'Failed to update order' });
  }
};
