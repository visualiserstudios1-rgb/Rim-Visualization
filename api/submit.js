// /api/submit.js — Vercel Serverless Function
// Images are uploaded directly to Cloudinary from browser
// This endpoint only handles email sending

const rateLimit = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count += 1;
  rateLimit.set(ip, entry);
  return false;
}

function sanitize(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, '').trim();
}

function validateInputs({ name, email, phone, rimSize, rimImageUrl, vehicleImageUrl }) {
  const errors = [];
  if (!name || name.length < 2 || name.length > 100)
    errors.push('Name must be between 2 and 100 characters.');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email))
    errors.push('A valid email address is required.');
  if (phone && phone.length > 20)
    errors.push('Phone number is too long.');
  const validSizes = ['17', '18', '19', '20', '21', '22', '23'];
  if (!rimSize || !validSizes.includes(rimSize))
    errors.push('Please select a valid rim size.');
  const urlRegex = /^https:\/\/res\.cloudinary\.com\/.+/;
  if (!rimImageUrl || !urlRegex.test(rimImageUrl))
    errors.push('Invalid rim image URL.');
  if (!vehicleImageUrl || !urlRegex.test(vehicleImageUrl))
    errors.push('Invalid vehicle image URL.');
  return errors;
}

module.exports = async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS
  const allowedOrigins = [
    'https://rim-visualization.vercel.app',
    'http://localhost:3000',
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  // Sanitize inputs
  const name            = sanitize(req.body?.name);
  const email           = sanitize(req.body?.email);
  const phone           = sanitize(req.body?.phone);
  const rimSize         = sanitize(req.body?.rimSize);
  const rimImageUrl     = sanitize(req.body?.rimImageUrl);
  const vehicleImageUrl = sanitize(req.body?.vehicleImageUrl);

  // Validate
  const errors = validateInputs({ name, email, phone, rimSize, rimImageUrl, vehicleImageUrl });
  if (errors.length > 0) return res.status(400).json({ error: errors.join(' ') });

 // Send email via EmailJS
  try {
    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id:     process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          customer_name:     name,
          customer_email:    email,
          customer_phone:    phone || 'Not provided',
          rim_size:          rimSize,
          reply_to:          email,
          rim_image_url:     rimImageUrl,
          vehicle_image_url: vehicleImageUrl,
        },
      }),
    });

    const emailBody = await emailRes.text();
    console.log('EmailJS status:', emailRes.status);
    console.log('EmailJS response:', emailBody);

    if (!emailRes.ok) {
      throw new Error(emailBody);
    }
  } catch (err) {
    console.error('EmailJS error:', err.message);
    return res.status(500).json({ error: 'Failed to send notification. Please try again.' });
  }

  return res.status(200).json({ success: true });;
