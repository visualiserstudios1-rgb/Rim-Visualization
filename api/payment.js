// /api/payment.js — Creates a PayFast payment request with rate limiting

const crypto = require('crypto');
const { Redis } = require('@upstash/redis');

// Connect to Upstash Redis using Vercel environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  // ── Rate limiting — max 3 submissions per IP per hour ─────────────────────
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown';

  const rateLimitKey = `ratelimit:${ip}`;

  try {
    const requests = await redis.incr(rateLimitKey);

    // First request — set expiry of 1 hour
    if (requests === 1) {
      await redis.expire(rateLimitKey, 3600);
    }

    if (requests > 3) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a while before trying again.',
      });
    }
  } catch (redisError) {
    // If Redis fails, log it but don't block the user
    console.error('Rate limit check failed:', redisError);
  }

  // ── Validate fields ───────────────────────────────────────────────────────
  const { name, email, phone, rimSize, rimImageUrl, vehicleImageUrl } = req.body;

  if (!name || !email || !rimSize) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Basic server-side email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Sanitise inputs
  const safeName    = String(name).trim().slice(0, 100);
  const safeEmail   = String(email).trim().slice(0, 200);
  const safePhone   = String(phone || '').trim().slice(0, 20);
  const safeRimSize = String(rimSize).trim().slice(0, 10);

  const validRimSizes = ['17', '18', '19', '20', '21', '22', '23'];
  if (!validRimSizes.includes(safeRimSize)) {
    return res.status(400).json({ error: 'Invalid rim size.' });
  }

  // ── Build PayFast payment ─────────────────────────────────────────────────
  const merchantId  = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase  = process.env.PAYFAST_PASSPHRASE;

  const data = {
    merchant_id:      merchantId,
    merchant_key:     merchantKey,
    return_url:       'https://www.rim-visualizer.com/success',
    cancel_url:       'https://www.rim-visualizer.com',
    notify_url:       'https://www.rim-visualizer.com/api/notify',
    name_first:       safeName.split(' ')[0],
    name_last:        safeName.split(' ').slice(1).join(' ') || '-',
    email_address:    safeEmail,
    m_payment_id:     `RIMVIZ-${Date.now()}`,
    amount:           '49.99',
    item_name:        'RimViz Visualisation Service',
    item_description: `Rim visualisation for ${safeName} - ${safeRimSize} inch rims`,
    custom_str1:      safeEmail,
    custom_str2:      safePhone,
    custom_str3:      safeRimSize,
    custom_str4:      rimImageUrl  || '',
    custom_str5:      vehicleImageUrl || '',
  };

  // Generate signature
  const pfParamString = Object.entries(data)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
    .join('&') + `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;

  const signature = crypto.createHash('md5').update(pfParamString).digest('hex');
  data.signature = signature;

  const payfastUrl = process.env.PAYFAST_SANDBOX === 'true'
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';

  return res.status(200).json({ payfastData: data, payfastUrl });
};
