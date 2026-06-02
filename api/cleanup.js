// /api/cleanup.js — Deletes Cloudinary images that have passed their 25 day expiry
// Call this via a cron job or manually — add to vercel.json as a cron

const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  // Secure with a secret key so only you can trigger it
  const { secret } = req.query;
  if (secret !== process.env.CLEANUP_SECRET) {
    return res.status(401).json({ error: 'Unauthorised' });
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const cloudName  = process.env.CLOUDINARY_CLOUD_NAME || 'dfyjxhjce';
    const apiKey     = process.env.CLOUDINARY_API_KEY;
    const apiSecret  = process.env.CLOUDINARY_API_SECRET;

    // Get all images due for deletion (score <= now)
    const due = await redis.zrange('pending_deletes', 0, now, { byScore: true });

    if (!due || due.length === 0) {
      return res.status(200).json({ message: 'No images to delete', deleted: 0 });
    }

    let deleted = 0;
    const errors = [];

    for (const item of due) {
      try {
        const { publicId } = typeof item === 'string' ? JSON.parse(item) : item;

        const timestamp = Math.floor(Date.now() / 1000);
        const str = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha256').update(str).digest('hex');

        const formData = new URLSearchParams();
        formData.append('public_id', publicId);
        formData.append('timestamp', timestamp);
        formData.append('api_key', apiKey);
        formData.append('signature', signature);

        const res2 = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
          { method: 'POST', body: formData }
        );

        const result = await res2.json();
        if (result.result === 'ok') {
          // Remove from pending deletes
          await redis.zrem('pending_deletes', typeof item === 'string' ? item : JSON.stringify(item));
          deleted++;
        } else {
          errors.push({ publicId, result });
        }
      } catch (err) {
        errors.push({ error: err.message });
      }
    }

    return res.status(200).json({
      message: `Deleted ${deleted} image(s)`,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (err) {
    console.error('Cleanup error:', err);
    return res.status(500).json({ error: 'Cleanup failed' });
  }
};
