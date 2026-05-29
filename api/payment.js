// /api/payment.js — Creates a PayFast payment request
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const { name, email, phone, rimSize } = req.body;

  if (!name || !email || !rimSize) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const merchantId  = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase  = process.env.PAYFAST_PASSPHRASE;

  const data = {
    merchant_id:      merchantId,
    merchant_key:     merchantKey,
    return_url:       'https://rim-visualization.vercel.app/success',
    cancel_url:       'https://rim-visualization.vercel.app',
    notify_url:       'https://rim-visualization.vercel.app/api/notify',
    name_first:       name.split(' ')[0],
    name_last:        name.split(' ').slice(1).join(' ') || '-',
    email_address:    email,
    m_payment_id:     `RIMVIZ-${Date.now()}`,
    amount:           '49.99',
    item_name:        'RimViz Visualisation Service',
    item_description: `Rim visualisation for ${name} - ${rimSize} inch rims`,
    custom_str1:      email,
    custom_str2:      phone || '',
    custom_str3:      rimSize,
  };

  // Generate signature
  const pfParamString = Object.entries(data)
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, '+')}`)
    .join('&') + `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;

  const signature = crypto.createHash('md5').update(pfParamString).digest('hex');
  data.signature = signature;

  return res.status(200).json({ payfastData: data, payfastUrl: 'https://sandbox.payfast.co.za/eng/process' });
};
