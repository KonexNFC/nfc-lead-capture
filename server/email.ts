// SendGrid email integration via Replit connector (connection:conn_sendgrid_01KGTZG5GDMAJN99QWA90VEKZM)
import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email };
}

async function getSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return { client: sgMail, fromEmail: email };
}

const BASE = process.env.APP_BASE_URL || 'https://konexnfc.com';

// ─── Templates ─────────────────────────────────────────────────────────────────

function emailWrapper(body: string) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;background:#fff;">
      <div style="text-align:center;margin-bottom:32px;">
        <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#111;">KONEX</span>
      </div>
      ${body}
      <p style="font-size:12px;color:#aaa;text-align:center;margin-top:32px;">
        KONEX &mdash; Premium NFC Digital Business Cards
      </p>
    </div>
  `;
}

// ─── Password Reset ────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<void> {
  try {
    const { client, fromEmail } = await getSendGridClient();
    await client.send({
      to: toEmail,
      from: { email: fromEmail, name: 'KONEX' },
      subject: 'Reset your KONEX password',
      text: `Reset your KONEX password:\n${resetUrl}\n\nExpires in 1 hour.`,
      html: emailWrapper(`
        <div style="background:#f9fafb;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
          <h2 style="font-size:20px;font-weight:600;color:#111;margin:0 0 12px;">Reset your password</h2>
          <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;">Click the button below to set a new password. This link expires in 1 hour.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${resetUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Reset Password</a>
          </div>
          <p style="font-size:13px;color:#888;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `),
    });
    console.log(`[EMAIL] Password reset sent to ${toEmail}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Password reset to ${toEmail}:`, err);
    throw err;
  }
}

// ─── Org Invite ────────────────────────────────────────────────────────────────

export async function sendOrganizationInviteEmail(
  toEmail: string,
  orgName: string,
  inviterName: string,
  role: string,
  acceptUrl: string,
): Promise<void> {
  try {
    const { client, fromEmail } = await getSendGridClient();
    await client.send({
      to: toEmail,
      from: { email: fromEmail, name: 'KONEX' },
      subject: `You've been invited to join ${orgName} on KONEX`,
      text: `${inviterName} invited you to join "${orgName}" as ${role}.\n\nAccept: ${acceptUrl}\n\nExpires in 7 days.`,
      html: emailWrapper(`
        <div style="background:#f9fafb;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
          <h2 style="font-size:20px;font-weight:600;color:#111;margin:0 0 12px;">You're invited!</h2>
          <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 8px;">
            <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> as a <strong>${role}</strong>.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${acceptUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Accept Invitation</a>
          </div>
          <p style="font-size:13px;color:#888;">Expires in 7 days.</p>
        </div>
      `),
    });
    console.log(`[EMAIL] Org invite sent to ${toEmail} for: ${orgName}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Org invite to ${toEmail}:`, err);
  }
}

// ─── Lead Notification ────────────────────────────────────────────────────────

export async function sendLeadNotificationEmail(
  toEmail: string,
  profileName: string,
  leadName: string,
  leadContact: string,
  leadDetails: { email?: string | null; telephone?: string | null; whatsapp?: string | null; company?: string | null; note?: string | null },
): Promise<void> {
  try {
    const { client, fromEmail } = await getSendGridClient();
    const rows = [
      leadDetails.email && `<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:14px;">Email</td><td style="padding:4px 0;font-size:14px;color:#333;">${leadDetails.email}</td></tr>`,
      leadDetails.telephone && `<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:14px;">Phone</td><td style="padding:4px 0;font-size:14px;color:#333;">${leadDetails.telephone}</td></tr>`,
      leadDetails.company && `<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:14px;">Company</td><td style="padding:4px 0;font-size:14px;color:#333;">${leadDetails.company}</td></tr>`,
      leadDetails.note && `<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:14px;">Note</td><td style="padding:4px 0;font-size:14px;color:#333;">${leadDetails.note}</td></tr>`,
    ].filter(Boolean).join('');

    await client.send({
      to: toEmail,
      from: { email: fromEmail, name: 'KONEX' },
      subject: `New lead: ${leadName} viewed your KONEX profile`,
      text: `New lead from "${profileName}": ${leadName}\n${leadContact}`,
      html: emailWrapper(`
        <div style="background:#f9fafb;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
          <h2 style="font-size:20px;font-weight:600;color:#111;margin:0 0 8px;">New Lead Captured</h2>
          <p style="font-size:14px;color:#888;margin:0 0 20px;">From your profile &ldquo;${profileName}&rdquo;</p>
          <div style="background:#fff;border-radius:8px;padding:16px;border:1px solid #e5e7eb;">
            <p style="font-size:16px;font-weight:600;color:#111;margin:0 0 12px;">${leadName}</p>
            <table style="border-collapse:collapse;">${rows}</table>
          </div>
        </div>
      `),
    });
    console.log(`[EMAIL] Lead notification sent to ${toEmail}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Lead notification to ${toEmail}:`, err);
  }
}

// ─── Activation Link (sent after successful payment capture) ──────────────────

export async function sendActivationEmail(
  toEmail: string,
  customerName: string | null | undefined,
  activationToken: string,
  productName: string,
): Promise<void> {
  const activationUrl = `${BASE}/checkout/activate?token=${activationToken}`;
  const name = customerName || 'there';
  try {
    const { client, fromEmail } = await getSendGridClient();
    await client.send({
      to: toEmail,
      from: { email: fromEmail, name: 'KONEX' },
      subject: `Your ${productName} is ready — activate now`,
      text: `Hi ${name},\n\nThank you for your order! Click the link below to set up your KONEX profile:\n\n${activationUrl}\n\nThis link expires in 7 days.`,
      html: emailWrapper(`
        <div style="background:#13131A;border-radius:16px;padding:36px;border:1px solid rgba(255,255,255,0.08);">
          <h2 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;">Payment confirmed ✓</h2>
          <p style="font-size:15px;color:rgba(255,255,255,0.65);margin:0 0 6px;">Hi ${name},</p>
          <p style="font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;margin:0 0 28px;">
            Your <strong style="color:#fff;">${productName}</strong> purchase is confirmed. Set up your profile now — it takes under 2 minutes.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${activationUrl}" style="display:inline-block;background:#3B82F6;color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;letter-spacing:0.01em;">
              Activate My Profile
            </a>
          </div>
          <p style="font-size:13px;color:rgba(255,255,255,0.4);text-align:center;margin:0;">
            This link expires in 7 days.
          </p>
        </div>
      `),
    });
    console.log(`[EMAIL] Activation email sent to ${toEmail}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Activation email to ${toEmail}:`, err);
    // Don't throw — token is already in the API response; email is best-effort
  }
}

// ─── Welcome (sent after profile is fully activated) ──────────────────────────

export async function sendWelcomeEmail(
  toEmail: string,
  displayName: string,
  profileSlug: string,
  productType: string,
): Promise<void> {
  const profileUrl = `${BASE}/u/${profileSlug}`;
  const isPhysical = productType === 'physical_card';
  try {
    const { client, fromEmail } = await getSendGridClient();
    await client.send({
      to: toEmail,
      from: { email: fromEmail, name: 'KONEX' },
      subject: `Welcome to KONEX, ${displayName} — your profile is live`,
      text: `Hi ${displayName},\n\nYour KONEX profile is live at:\n${profileUrl}\n\n${isPhysical ? 'Your physical NFC card will be shipped to you shortly.' : 'Share your profile link with anyone to start making connections.'}`,
      html: emailWrapper(`
        <div style="background:#13131A;border-radius:16px;padding:36px;border:1px solid rgba(255,255,255,0.08);">
          <h2 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;">Welcome to KONEX! 🎉</h2>
          <p style="font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;margin:0 0 20px;">
            Hi ${displayName}, your profile is live and ready to share.
          </p>
          <div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:10px;padding:16px;margin-bottom:24px;text-align:center;">
            <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 6px;">Your profile link</p>
            <a href="${profileUrl}" style="font-size:16px;color:#60a5fa;font-weight:600;text-decoration:none;">${profileUrl}</a>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${profileUrl}" style="display:inline-block;background:#3B82F6;color:#fff;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
              View My Profile
            </a>
          </div>
          ${isPhysical ? `<p style="font-size:13px;color:rgba(255,255,255,0.4);text-align:center;margin:16px 0 0;">Your physical NFC card will be shipped shortly. We'll email you a tracking update.</p>` : ''}
        </div>
      `),
    });
    console.log(`[EMAIL] Welcome email sent to ${toEmail}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Welcome email to ${toEmail}:`, err);
  }
}

// ─── Admin: new physical card order to fulfil ─────────────────────────────────

export async function sendAdminOrderNotification(params: {
  adminEmail: string;
  orderId: number;
  productName: string;
  customerName: string;
  customerEmail: string;
  sku: string;
  amount: string;
  shippingAddress?: string;
}): Promise<void> {
  try {
    const { client, fromEmail } = await getSendGridClient();
    const adminUrl = `${BASE}/dashboard/admin/orders`;
    await client.send({
      to: params.adminEmail,
      from: { email: fromEmail, name: 'KONEX Orders' },
      subject: `New order to fulfil — ${params.productName} (${params.customerName})`,
      text: `New KONEX order requires fulfilment.\n\nOrder #${params.orderId}\nProduct: ${params.productName} (${params.sku})\nCustomer: ${params.customerName} <${params.customerEmail}>\nAmount: £${params.amount}\n${params.shippingAddress ? `Address: ${params.shippingAddress}` : ''}\n\nManage orders: ${adminUrl}`,
      html: emailWrapper(`
        <div style="background:#f9fafb;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
          <h2 style="font-size:18px;font-weight:700;color:#111;margin:0 0 16px;">New order to fulfil</h2>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:6px 0;color:#888;font-size:14px;width:120px;">Order #</td><td style="padding:6px 0;font-size:14px;color:#111;">${params.orderId}</td></tr>
            <tr><td style="padding:6px 0;color:#888;font-size:14px;">Product</td><td style="padding:6px 0;font-size:14px;color:#111;">${params.productName} (${params.sku})</td></tr>
            <tr><td style="padding:6px 0;color:#888;font-size:14px;">Customer</td><td style="padding:6px 0;font-size:14px;color:#111;">${params.customerName}</td></tr>
            <tr><td style="padding:6px 0;color:#888;font-size:14px;">Email</td><td style="padding:6px 0;font-size:14px;color:#111;">${params.customerEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#888;font-size:14px;">Amount</td><td style="padding:6px 0;font-size:14px;color:#111;font-weight:600;">£${params.amount}</td></tr>
            ${params.shippingAddress ? `<tr><td style="padding:6px 0;color:#888;font-size:14px;vertical-align:top;">Ship to</td><td style="padding:6px 0;font-size:14px;color:#111;">${params.shippingAddress.replace(/\n/g, '<br>')}</td></tr>` : ''}
          </table>
          <div style="text-align:center;margin:24px 0 0;">
            <a href="${adminUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View Orders Dashboard</a>
          </div>
        </div>
      `),
    });
    console.log(`[EMAIL] Admin order notification sent for order #${params.orderId}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Admin order notification:`, err);
  }
}

// ─── Shipped notification (sent to customer when admin marks as shipped) ───────

export async function sendShippedEmail(
  toEmail: string,
  customerName: string,
  productName: string,
  trackingInfo?: string,
): Promise<void> {
  try {
    const { client, fromEmail } = await getSendGridClient();
    await client.send({
      to: toEmail,
      from: { email: fromEmail, name: 'KONEX' },
      subject: `Your ${productName} has been shipped! 📦`,
      text: `Hi ${customerName},\n\nGreat news — your ${productName} is on its way!\n${trackingInfo ? `Tracking: ${trackingInfo}` : ''}\n\nOnce it arrives, tap it to your phone to open your profile instantly.`,
      html: emailWrapper(`
        <div style="background:#13131A;border-radius:16px;padding:36px;border:1px solid rgba(255,255,255,0.08);">
          <h2 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;">Your card is on its way 📦</h2>
          <p style="font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;margin:0 0 20px;">
            Hi ${customerName}, your <strong style="color:#fff;">${productName}</strong> has been shipped and is on its way to you.
          </p>
          ${trackingInfo ? `
            <div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:10px;padding:16px;margin-bottom:20px;">
              <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 4px;">Tracking information</p>
              <p style="font-size:14px;color:#60a5fa;margin:0;">${trackingInfo}</p>
            </div>
          ` : ''}
          <p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0;">
            When it arrives, tap it against any NFC-enabled phone to open your profile instantly.
          </p>
        </div>
      `),
    });
    console.log(`[EMAIL] Shipped notification sent to ${toEmail}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Shipped notification to ${toEmail}:`, err);
  }
}

// ─── Admin dispute alert ───────────────────────────────────────────────────────

export async function sendAdminDisputeAlert(params: {
  adminEmail: string;
  orderId: number;
  customerEmail: string;
  amount: string;
  reason?: string;
}): Promise<void> {
  try {
    const { client, fromEmail } = await getSendGridClient();
    const adminUrl = `${BASE}/dashboard/admin/orders`;
    await client.send({
      to: params.adminEmail,
      from: { email: fromEmail, name: 'KONEX Alerts' },
      subject: `⚠️ PayPal dispute opened — Order #${params.orderId}`,
      text: `A PayPal dispute has been opened on Order #${params.orderId}.\nCustomer: ${params.customerEmail}\nAmount: £${params.amount}\nReason: ${params.reason || 'Not specified'}\n\nAction required: ${adminUrl}`,
      html: emailWrapper(`
        <div style="background:#fff3cd;border-radius:12px;padding:32px;border:1px solid #ffc107;">
          <h2 style="font-size:18px;font-weight:700;color:#856404;margin:0 0 12px;">⚠️ Dispute opened on Order #${params.orderId}</h2>
          <p style="font-size:14px;color:#666;margin:0 0 16px;">A PayPal dispute requires your attention.</p>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:5px 0;color:#888;font-size:14px;width:100px;">Customer</td><td style="padding:5px 0;font-size:14px;color:#111;">${params.customerEmail}</td></tr>
            <tr><td style="padding:5px 0;color:#888;font-size:14px;">Amount</td><td style="padding:5px 0;font-size:14px;color:#111;font-weight:600;">£${params.amount}</td></tr>
            ${params.reason ? `<tr><td style="padding:5px 0;color:#888;font-size:14px;">Reason</td><td style="padding:5px 0;font-size:14px;color:#111;">${params.reason}</td></tr>` : ''}
          </table>
          <div style="text-align:center;margin:20px 0 0;">
            <a href="${adminUrl}" style="display:inline-block;background:#dc3545;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Review in Dashboard</a>
          </div>
        </div>
      `),
    });
    console.log(`[EMAIL] Dispute alert sent for order #${params.orderId}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Dispute alert:`, err);
  }
}
