import nodemailer from "nodemailer";

export type EmailPayload = {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  template?: "project-reminder" | "domain-renewal" | "payment-pending" | "assignment";
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function textToHtml(message: string) {
  return message.split("\n").map((line) => (line.trim() ? `<p>${escapeHtml(line)}</p>` : "<br />")).join("");
}

export function renderEmailTemplate(payload: EmailPayload) {
  return `<!doctype html><html><body style="margin:0;background:#f6f8fb;font-family:Inter,Arial,sans-serif;color:#111827;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;"><tr><td style="background:#0f172a;padding:26px 30px;"><div style="color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;">MadeWebs</div><h1 style="margin:10px 0 0;color:#ffffff;font-size:24px;line-height:1.25;">${escapeHtml(payload.subject)}</h1></td></tr><tr><td style="padding:30px;font-size:15px;line-height:1.7;color:#374151;">${textToHtml(payload.message)}</td></tr><tr><td style="border-top:1px solid #e5e7eb;padding:20px 30px;color:#64748b;font-size:12px;">This automated message was sent from MadeWebs Tracker.</td></tr></table></td></tr></table></body></html>`;
}

export async function sendEmail(payload: EmailPayload) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? "MadeWebs Team <noreply@madewebs.in>";

  if (!host || !user || !pass) {
    console.info("Email transport not configured. Logging email payload:", { to: payload.recipientEmail, subject: payload.subject });
    return { queued: true, messageId: "local-log" };
  }

  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  const result = await transporter.sendMail({ from, to: `${payload.recipientName} <${payload.recipientEmail}>`, subject: payload.subject, text: payload.message, html: renderEmailTemplate(payload) });
  return { queued: false, messageId: result.messageId };
}
