export interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail(
  env: any,
  { to, subject, html, text }: SendEmailParams
): Promise<{ success: boolean; error?: string }> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.EMAIL_FROM || 'no-reply@arksystems.ai';

  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: Array.isArray(to) ? to : [to],
          subject,
          html: html || text,
          text,
        }),
      });
      if (res.ok) return { success: true };
      const body = await res.text();
      return { success: false, error: `resend_failed:${res.status} ${body}` };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  if (env.ENVIRONMENT === 'development') {
    console.log('[DEV_EMAIL]', { to, subject, text, html });
    return { success: true };
  }

  return { success: false, error: 'EMAIL_SEND_DISABLED' };
}
