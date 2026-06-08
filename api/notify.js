// /api/notify.js — Receives PayFast confirmation, saves order, sends emails

const crypto = require('crypto');
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// ── Schedule Cloudinary image deletion after 25 days ─────────────────────────
async function scheduleCloudinaryDelete(imageUrl) {
  try {
    if (!imageUrl) return;

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/CLOUD/image/upload/v123456/public_id.ext
    const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (!matches) return;

    const publicId = matches[1];
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dfyjxhjce';
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) return;

    // Delete after 15 days (in seconds)
    const deleteAt = Math.floor(Date.now() / 1000) + (15 * 24 * 60 * 60);

    // Use Cloudinary's explicit API to tag for future deletion
    const timestamp = Math.floor(Date.now() / 1000);
    const str = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = require('crypto').createHash('sha256').update(str).digest('hex');

    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/explicit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_id: publicId,
        type: 'upload',
        invalidate: true,
        tags: [`delete_after_15_days`, `order_image`],
        api_key: apiKey,
        timestamp,
        signature,
      }),
    });

    // Store delete job in Redis — a cleanup function can process these
    await redis.zadd('pending_deletes', {
      score: deleteAt,
      member: JSON.stringify({ publicId, cloudName }),
    });

  } catch (err) {
    // Never block order processing if this fails
    console.error('Schedule delete error:', err);
  }
}


module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const data = req.body;

    // ── 1. Verify signature from PayFast ─────────────────────────────────────
    const pfPassphrase = process.env.PAYFAST_PASSPHRASE;
    const pfData = { ...data };
    delete pfData.signature;

    const pfParamString = Object.entries(pfData)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
      .join('&') + `&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, '+')}`;

    const generatedSignature = crypto.createHash('md5').update(pfParamString).digest('hex');

    if (generatedSignature !== data.signature) {
      console.error('PayFast signature mismatch');
      return res.status(400).end();
    }

    // ── 2. Only process completed payments ────────────────────────────────────
    if (data.payment_status !== 'COMPLETE') return res.status(200).end();

    // ── 3. Extract order details ──────────────────────────────────────────────
    const customerEmail   = data.custom_str1 || data.email_address;
    const customerPhone   = data.custom_str2 || 'Not provided';
    const rimSize         = data.custom_str3 || 'Not specified';
    const rimImageUrl     = data.custom_str4 || '';
    const vehicleImageUrl = data.custom_str5 || '';
    const customerName    = `${data.name_first} ${data.name_last}`.trim();
    const orderId         = data.m_payment_id;
    const amount          = data.amount_gross;
    const orderDate       = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
    const timestamp       = Date.now();

    // ── 4. Save order to Redis ────────────────────────────────────────────────
    const order = {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      rimSize,
      amount,
      orderDate,
      timestamp,
      rimImageUrl,
      vehicleImageUrl,
      status: 'received', // received | in_progress | delivered
    };

    // Save individual order
    await redis.set(`order:${orderId}`, JSON.stringify(order));

    // Add to orders list (sorted by timestamp)
    await redis.zadd('orders', { score: timestamp, member: orderId });

    // Schedule image deletion after 25 days
    await scheduleCloudinaryDelete(rimImageUrl);
    await scheduleCloudinaryDelete(vehicleImageUrl);

    // ── 5. Send confirmation email to CUSTOMER ────────────────────────────────
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RimViz <orders@rim-visualizer.com>',
        to: customerEmail,
        subject: `Your RimViz Order is Confirmed — ${orderId}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: #000000; padding: 40px 32px; text-align: center;">
              <h1 style="color: white; font-size: 28px; font-weight: 300; margin: 0; letter-spacing: -1px;">Rim<span style="font-weight: 700;">Viz</span></h1>
            </div>
            <div style="padding: 40px 32px;">
              <h2 style="font-size: 22px; font-weight: 600; color: #1d1d1f; margin: 0 0 8px;">Payment Confirmed ✓</h2>
              <p style="color: #6b7280; font-size: 16px; margin: 0 0 32px; line-height: 1.6;">Hi ${customerName}, thank you for your order! We have received your payment and your visualisation is now in the queue.</p>
              <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e5e7eb;">
                <h3 style="font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Order ID</td><td style="padding: 8px 0; color: #1d1d1f; font-size: 15px; font-weight: 600; text-align: right;">${orderId}</td></tr>
                  <tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Rim Size</td><td style="padding: 8px 0; color: #1d1d1f; font-size: 15px; font-weight: 600; text-align: right;">${rimSize} inches</td></tr>
                  <tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Amount Paid</td><td style="padding: 8px 0; color: #1d1d1f; font-size: 15px; font-weight: 600; text-align: right;">R${amount}</td></tr>
                  <tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Date</td><td style="padding: 8px 0; color: #1d1d1f; font-size: 15px; font-weight: 600; text-align: right;">${orderDate}</td></tr>
                </table>
              </div>
              <div style="background: #000; border-radius: 12px; padding: 20px 24px; text-align: center; margin-bottom: 32px;">
                <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 0 0 4px;">Your order reference</p>
                <p style="color: white; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 1px;">${orderId}</p>
                <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 8px 0 0;">Keep this for your records</p>
              </div>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7;">Your visualisation will be delivered to <strong>${customerEmail}</strong> within 24 to 48 hours. Questions? Email us at <a href="mailto:orders@rim-visualizer.com" style="color: #1d1d1f;">orders@rim-visualizer.com</a></p>
            </div>
          </div>
        `,
      }),
    });

    // ── 6. Send order notification to YOU ─────────────────────────────────────
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RimViz Orders <orders@rim-visualizer.com>',
        to: 'visualiserstudios1@gmail.com',
        subject: `🔔 New Order — ${orderId} — ${customerName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #000; padding: 32px; text-align: center;">
              <h1 style="color: white; font-size: 22px; font-weight: 700; margin: 0;">New Order Received</h1>
              <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">${orderDate}</p>
            </div>
            <div style="padding: 32px; background: #f9fafb;">
              <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
                <h3 style="font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Customer</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 40%;">Name</td><td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${customerName}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${customerEmail}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Phone</td><td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${customerPhone}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Rim Size</td><td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${rimSize} inches</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Amount</td><td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">R${amount}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Order ID</td><td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${orderId}</td></tr>
                </table>
              </div>
              <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
                <h3 style="font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Customer Images</h3>
                <p style="margin: 0 0 8px;"><a href="${rimImageUrl}" style="color: #0071e3; font-size: 14px; font-weight: 600;">→ View Rim Image</a></p>
                <p style="margin: 0;"><a href="${vehicleImageUrl}" style="color: #0071e3; font-size: 14px; font-weight: 600;">→ View Vehicle Image</a></p>
              </div>
              <div style="background: black; border-radius: 12px; padding: 16px; text-align: center;">
                <p style="color: white; font-size: 15px; font-weight: 600; margin: 0 0 8px;">Complete this order within 24 hours</p>
                <a href="https://www.rim-visualizer.com/admin" style="color: rgba(255,255,255,0.7); font-size: 13px;">View in Admin Dashboard →</a>
              </div>
            </div>
          </div>
        `,
      }),
    });

    return res.status(200).end();

  } catch (err) {
    console.error('Notify error:', err);
    return res.status(200).end();
  }
};
