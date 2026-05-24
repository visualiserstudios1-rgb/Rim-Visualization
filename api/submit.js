// ============================================================
// /api/submit.js — Vercel Serverless Function
// Handles image upload to Cloudinary + email via EmailJS
// All secrets stay SERVER SIDE only, never exposed to browser
// ============================================================

// Simple in-memory rate limiter (per IP, resets on cold start)
const rateLimit = new Map();
const RATE_LIMIT_MAX = 5;       // max requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour window in ms

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, start: now };

  // Reset window if expired
  if (now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, start: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) return true;

  entry.count += 1;
  rateLimit.set(ip, entry);
  return false;
}

// Input sanitizer — strips HTML tags and trims whitespace
function sanitize(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, '').trim();
}

// Input validator
function validateInputs({ name, email, phone, rimSize }) {
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

  return errors;
}

export default async function handler(req, res) {
  // --- CORS: only allow your own domain ---
  const allowedOrigins = [
    'https://rim-visualization.vercel.app',
    'http://localhost:3000', // for local dev only
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // --- Security headers ---
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; object-src 'none';"
  );

  // Handle preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  // --- Rate limiting ---
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
    });
  }

  // --- Parse and sanitize inputs ---
  const {
    name: rawName,
    email: rawEmail,
    phone: rawPhone,
    rimSize: rawRimSize,
    rimImageBase64,
    vehicleImageBase64,
  } = req.body;

  const name    = sanitize(rawName);
  const email   = sanitize(rawEmail);
  const phone   = sanitize(rawPhone);
  const rimSize = sanitize(rawRimSize);

  // --- Validate ---
  const errors = validateInputs({ name, email, phone, rimSize });
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  if (!rimImageBase64 || !vehicleImageBase64) {
    return res.status(400).json({ error: 'Both images are required.' });
  }

  // --- Upload images to Cloudinary (server side, secret key stays here) ---
  async function uploadToCloudinary(base64Data) {
    const cloudName   = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey      = process.env.CLOUDINARY_API_KEY;
    const apiSecret   = process.env.CLOUDINARY_API_SECRET;

    // Generate SHA-1 signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const crypto = await import('crypto');
    const signature = crypto
      .createHash('sha1')
      .update(`timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const formData = new URLSearchParams();
    formData.append('file', base64Data);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) {
      throw new Error('Image upload failed.');
    }

    const data = await response.json();
    return data.secure_url;
  }

  let rimImageUrl, vehicleImageUrl;
  try {
    rimImageUrl     = await uploadToCloudinary(rimImageBase64);
    vehicleImageUrl = await uploadToCloudinary(vehicleImageBase64);
  } catch {
    // Never expose internal error details to client
    return res.status(500).json({ error: 'Image upload failed. Please try again.' });
  }

  // --- Send email via EmailJS REST API (server side) ---
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
          customer_name:      name,
          customer_email:     email,
          customer_phone:     phone || 'Not provided',
          rim_size:           rimSize,
          reply_to:           email,
          rim_image_url:      rimImageUrl,
          vehicle_image_url:  vehicleImageUrl,
        },
      }),
    });

    if (!emailRes.ok) throw new Error('Email send failed.');
  } catch {
    return res.status(500).json({ error: 'Failed to send notification. Please try again.' });
  }

  return res.status(200).json({ success: true });
}
