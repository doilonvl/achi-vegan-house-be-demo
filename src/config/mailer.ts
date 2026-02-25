import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const port = Number(process.env.SMTP_PORT ?? 587);
const secure =
  process.env.SMTP_SECURE != null
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

const smtpOptions: SMTPTransport.Options = {
  host: process.env.SMTP_HOST!,
  port,
  secure,
  auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  requireTLS: !secure,
  connectionTimeout: 10000,
  socketTimeout: 10000,
};

export const transporter = nodemailer.createTransport(smtpOptions);

export async function verifyMailer() {
  try {
    await transporter.verify();
    console.log(
      `[MAILER] SMTP ready — host=${process.env.SMTP_HOST} port=${port} secure=${secure} from=${process.env.MAIL_FROM_ADDR}`
    );
  } catch (e: any) {
    console.error("[MAILER] SMTP verify failed:", e?.message);
  }
}
