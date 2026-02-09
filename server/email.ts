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

async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return { client: sgMail, fromEmail: email };
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();

    await client.send({
      to: toEmail,
      from: { email: fromEmail, name: 'KONEX' },
      subject: 'Reset your KONEX password',
      text: `You requested a password reset for your KONEX account.\n\nClick the link below to set a new password:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #111; margin: 0;">KONEX</h1>
          </div>
          <div style="background: #f9fafb; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 20px; font-weight: 600; color: #111; margin: 0 0 12px;">Reset your password</h2>
            <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 24px;">
              You requested a password reset for your KONEX account. Click the button below to set a new password.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 13px; color: #888; line-height: 1.5; margin: 24px 0 0;">
              This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
          <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">
            KONEX - Digital Business Cards
          </p>
        </div>
      `,
    });

    console.log(`[EMAIL] Password reset email sent to ${toEmail}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send password reset email to ${toEmail}:`, err);
    throw err;
  }
}

export async function sendLeadNotificationEmail(
  toEmail: string,
  profileName: string,
  leadName: string,
  leadContact: string,
  leadDetails: { email?: string | null; telephone?: string | null; whatsapp?: string | null; company?: string | null; note?: string | null }
): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();

    const detailRows: string[] = [];
    if (leadDetails.email) detailRows.push(`<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:14px;">Email</td><td style="padding:4px 0;font-size:14px;color:#333;">${leadDetails.email}</td></tr>`);
    if (leadDetails.telephone) detailRows.push(`<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:14px;">Phone</td><td style="padding:4px 0;font-size:14px;color:#333;">${leadDetails.telephone}</td></tr>`);
    if (leadDetails.whatsapp) detailRows.push(`<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:14px;">WhatsApp</td><td style="padding:4px 0;font-size:14px;color:#333;">${leadDetails.whatsapp}</td></tr>`);
    if (leadDetails.company) detailRows.push(`<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:14px;">Company</td><td style="padding:4px 0;font-size:14px;color:#333;">${leadDetails.company}</td></tr>`);
    if (leadDetails.note) detailRows.push(`<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:14px;">Note</td><td style="padding:4px 0;font-size:14px;color:#333;">${leadDetails.note}</td></tr>`);

    const textDetails = [
      leadDetails.email ? `Email: ${leadDetails.email}` : null,
      leadDetails.telephone ? `Phone: ${leadDetails.telephone}` : null,
      leadDetails.whatsapp ? `WhatsApp: ${leadDetails.whatsapp}` : null,
      leadDetails.company ? `Company: ${leadDetails.company}` : null,
      leadDetails.note ? `Note: ${leadDetails.note}` : null,
    ].filter(Boolean).join('\n');

    await client.send({
      to: toEmail,
      from: { email: fromEmail, name: 'KONEX' },
      subject: `New lead: ${leadName} viewed your KONEX profile`,
      text: `You have a new lead from your KONEX profile "${profileName}".\n\nName: ${leadName}\n${textDetails}\n\nLog in to your KONEX dashboard to view all your leads.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #111; margin: 0;">KONEX</h1>
          </div>
          <div style="background: #f9fafb; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 20px; font-weight: 600; color: #111; margin: 0 0 8px;">New Lead Captured</h2>
            <p style="font-size: 14px; color: #888; margin: 0 0 20px;">From your profile "${profileName}"</p>
            <div style="background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb;">
              <p style="font-size: 16px; font-weight: 600; color: #111; margin: 0 0 12px;">${leadName}</p>
              <table style="border-collapse: collapse;">${detailRows.join('')}</table>
            </div>
          </div>
          <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">
            KONEX - Digital Business Cards
          </p>
        </div>
      `,
    });

    console.log(`[EMAIL] Lead notification sent to ${toEmail} for lead: ${leadName}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send lead notification to ${toEmail}:`, err);
  }
}
