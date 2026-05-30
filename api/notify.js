// /api/notify.js — Receives PayFast payment confirmation and sends emails

const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const data = req.body;

    // ── 1. Verify the payment is genuinely from PayFast ──────────────────────
    const pfPassphrase = process.env.PAYFAST_PASSPHRASE;

    // Build verification string — exclude signature field
    const pfData = { ...data };
    delete pfData.signature;

    const pfParamString = Object.entries(pfData)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
      .join('&') + `&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, '+')}`;

    const generatedSignature = crypto
      .createHash('md5')
      .update(pfParamString)
      .digest('hex');

    if (generatedSignature !== data.signature) {
      console.error('PayFast signature mismatch');
      return res.status(400).end();
    }

    // ── 2. Only process completed payments ───────────────────────────────────
    if (data.payment_status !== 'COMPLETE') {
      return res.status(200).end();
    }

    // ── 3. Extract order details ──────────────────────────────────────────────
    const customerEmail = data.custom_str1 || data.email_address;
    const customerPhone = data.custom_str2 || 'Not provided';
    const rimSize       = data.custom_str3 || 'Not specified';
    const customerName  = `${data.name_first} ${data.name_last}`.trim();
    const orderId       = data.m_payment_id;
    const amount        = data.amount_gross;
    const orderDate     = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });

    // ── 4. Get image URLs from PayFast custom fields ──────────────────────────
    const rimImageUrl     = data.custom_str4 || 'Not provided';
    const vehicleImageUrl = data.custom_str5 || 'Not provided';

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    // ── 5. Send confirmation email to CUSTOMER ────────────────────────────────
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RimViz <onboarding@resend.dev>',
        to: customerEmail,
        subject: `Your RimViz Order is Confirmed — ${orderId}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            
            <!-- Header -->
            <div style="background: #000000; padding: 40px 32px; text-align: center;">
              <h1 style="color: white; font-size: 28px; font-weight: 300; margin: 0; letter-spacing: -1px;">
                Rim<span style="font-weight: 700;">Viz</span>
              </h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px 32px;">
              <h2 style="font-size: 22px; font-weight: 600; color: #1d1d1f; margin: 0 0 8px;">
                Payment Confirmed ✓
              </h2>
              <p style="color: #6b7280; font-size: 16px; margin: 0 0 32px; line-height: 1.6;">
                Hi ${customerName}, thank you for your order! We have received your payment and your visualisation is now in the queue.
              </p>

              <!-- Order Summary Box -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e5e7eb;">
                <h3 style="font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Order ID</td>
                    <td style="padding: 8px 0; color: #1d1d1f; font-size: 15px; font-weight: 600; text-align: right;">${orderId}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e5e7eb;">
                    <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Rim Size</td>
                    <td style="padding: 8px 0; color: #1d1d1f; font-size: 15px; font-weight: 600; text-align: right;">${rimSize} inches</td>
                  </tr>
                  <tr style="border-top: 1px solid #e5e7eb;">
                    <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Amount Paid</td>
                    <td style="padding: 8px 0; color: #1d1d1f; font-size: 15px; font-weight: 600; text-align: right;">R${amount}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e5e7eb;">
                    <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Order Date</td>
                    <td style="padding: 8px 0; color: #1d1d1f; font-size: 15px; font-weight: 600; text-align: right;">${orderDate}</td>
                  </tr>
                </table>
              </div>

              <!-- What happens next -->
              <div style="margin-bottom: 32px;">
                <h3 style="font-size: 16px; font-weight: 600; color: #1d1d1f; margin: 0 0 16px;">What happens next?</h3>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="background: black; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 2px;">1</div>
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">Our team will review your uploaded images and begin working on your visualisation.</p>
                  </div>
                  <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="background: black; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 2px;">2</div>
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">Your visualisation will be delivered to <strong>${customerEmail}</strong> within 24 to 48 hours.</p>
                  </div>
                  <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="background: black; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 2px;">3</div>
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">If you have any questions, reply to this email or contact us at visualiserstudios1@gmail.com.</p>
                  </div>
                </div>
              </div>

              <!-- Reference number callout -->
              <div style="background: #000; border-radius: 12px; padding: 20px 24px; text-align: center; margin-bottom: 32px;">
                <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 0 0 4px;">Your order reference</p>
                <p style="color: white; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 1px;">${orderId}</p>
                <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 8px 0 0;">Keep this for your records</p>
              </div>

              <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0;">
                RimViz · South Africa · visualiserstudios1@gmail.com
              </p>
            </div>
          </div>
        `,
      }),
    });

    // ── 6. Send order notification email to YOU ───────────────────────────────
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RimViz Orders <onboarding@resend.dev>',
        to: 'visualiserstudios1@gmail.com',
        subject: `🔔 New Order — ${orderId} — ${customerName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
            
            <div style="background: #000; padding: 32px; text-align: center;">
              <h1 style="color: white; font-size: 22px; font-weight: 700; margin: 0;">New Order Received</h1>
              <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">${orderDate}</p>
            </div>

            <div style="padding: 32px; background: #f9fafb;">
              
              <!-- Customer Details -->
              <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
                <h3 style="font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Customer</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 40%;">Name</td>
                    <td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Email</td>
                    <td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${customerEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Phone</td>
                    <td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${customerPhone}</td>
                  </tr>
                </table>
              </div>

              <!-- Order Details -->
              <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
                <h3 style="font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Order</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 40%;">Order ID</td>
                    <td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Rim Size</td>
                    <td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${rimSize} inches</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Amount</td>
                    <td style="padding: 6px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">R${amount}</td>
                  </tr>
                </table>
              </div>

              <!-- Images -->
              <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
                <h3 style="font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Customer Images</h3>
                <p style="margin: 0 0 8px;">
                  <a href="${rimImageUrl}" style="color: #0071e3; font-size: 14px; text-decoration: none; font-weight: 600;">
                    → View Rim Image
                  </a>
                </p>
                <p style="margin: 0;">
                  <a href="${vehicleImageUrl}" style="color: #0071e3; font-size: 14px; text-decoration: none; font-weight: 600;">
                    → View Vehicle Image
                  </a>
                </p>
              </div>

              <div style="background: black; border-radius: 12px; padding: 16px; text-align: center;">
                <p style="color: white; font-size: 15px; font-weight: 600; margin: 0;">Complete this order within 24 hours</p>
                <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 4px 0 0;">Reply to ${customerEmail} with the finished visualisation</p>
              </div>

            </div>
          </div>
        `,
      }),
    });

    return res.status(200).end();

  } catch (err) {
    console.error('Notify error:', err);
    return res.status(200).end(); // Always return 200 to PayFast
  }
};
