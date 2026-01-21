import { transporter } from "../config/mailer";
import { detectLocale } from "../i18n/localize";
import type { Locale } from "../i18n/types";

function escapeHtml(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type ReservationEmailPayload = {
  fullName: string;
  phoneNumber: string;
  email?: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  note?: string;
  source?: string;
  locale?: string;
};

export async function sendReservationEmail(payload: ReservationEmailPayload) {
  const locale: Locale = detectLocale(payload.locale);
  const copy = {
    vi: {
      subject: `[Achi Vegan House] Yêu cầu đặt bàn mới từ ${payload.fullName}`,
      title: "Achi Vegan House — Đặt bàn mới",
      subtitle: "Yêu cầu đặt bàn mới từ website",
      intro:
        "Thông tin đặt bàn được gửi từ website. Bạn có thể trả lời email này để liên hệ khách.",
      labels: {
        fullName: "Họ và tên",
        phone: "Số điện thoại",
        email: "Email",
        guests: "Số khách",
        date: "Ngày",
        time: "Giờ",
        source: "Nguồn",
        note: "Ghi chú / Yêu cầu đặc biệt",
      },
      footer:
        "Email này được gửi tự động từ website Achi Vegan House. Vui lòng trả lời email để liên hệ khách.",
      text: {
        heading: "Yêu cầu đặt bàn mới",
      },
      sources: {
        website: "Website",
        phone: "Điện thoại",
        walk_in: "Khách đến trực tiếp",
        other: "Khác",
      },
    },
    en: {
      subject: `[Achi Vegan House] New reservation from ${payload.fullName}`,
      title: "Achi Vegan House — Reservation Request",
      subtitle: "New reservation request from the website",
      intro:
        "Reservation details submitted from the website. Click Reply to contact the guest.",
      labels: {
        fullName: "Full name",
        phone: "Phone",
        email: "Email",
        guests: "Guests",
        date: "Date",
        time: "Time",
        source: "Source",
        note: "Note / Special request",
      },
      footer:
        "This email was sent automatically from the Achi Vegan House website. Click Reply to respond.",
      text: {
        heading: "New reservation request",
      },
      sources: {
        website: "Website",
        phone: "Phone",
        walk_in: "Walk-in",
        other: "Other",
      },
    },
  } as const;
  const t = copy[locale];
  const subject = t.subject;
  const fromName = process.env.MAIL_FROM_NAME || "Achi Vegan House";
  const fromAddr = process.env.MAIL_FROM_ADDR || process.env.SMTP_USER!;
  const toAdmin = process.env.MAIL_TO_ADDR || process.env.SMTP_USER!;

  const primary = "#0f766e";
  const textColor = "#0f172a";
  const muted = "#475569";
  const border = "#e2e8f0";
  const bg = "#f8fafc";

  const sourceLabel =
    payload.source &&
    ((t.sources as Record<string, string>)[payload.source] || payload.source);

  const html = `<!DOCTYPE html>
<html lang="${locale}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${bg};font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial,sans-serif;">
  <div style="max-width:720px;margin:24px auto;padding:0 12px;">
    <div style="background:#fff;border:1px solid ${border};border-radius:12px;overflow:hidden;box-shadow:0 12px 24px rgba(15,23,42,0.06);">
      <div style="padding:20px 24px;border-bottom:1px solid ${border};background:linear-gradient(120deg,#ecfeff,#f8fafc);">
        <div style="font-size:18px;font-weight:700;color:${primary};">${escapeHtml(
          t.title
        )}</div>
        <div style="margin-top:4px;font-size:13px;color:${muted};">${escapeHtml(
          t.subtitle
        )}</div>
      </div>

      <div style="padding:20px 24px 4px;color:${textColor};">
        <p style="margin:0 0 16px;font-size:14px;color:${muted};">${escapeHtml(
          t.intro
        )}</p>

        <table cellspacing="0" cellpadding="10" style="width:100%;border-collapse:collapse;border:1px solid ${border};border-radius:10px;overflow:hidden;background:#fff;">
          <tbody>
            <tr style="background:${bg};">
              <td style="width:160px;font-weight:600;color:${textColor};">${escapeHtml(
                t.labels.fullName
              )}</td>
              <td style="color:${textColor};">${escapeHtml(
                payload.fullName
              )}</td>
            </tr>
            <tr>
              <td style="font-weight:600;color:${textColor};">${escapeHtml(
                t.labels.phone
              )}</td>
              <td style="color:${textColor};">${escapeHtml(
                payload.phoneNumber
              )}</td>
            </tr>
            ${
              payload.email
                ? `<tr style="background:${bg};">
              <td style="font-weight:600;color:${textColor};">${escapeHtml(
                t.labels.email
              )}</td>
              <td><a href="mailto:${escapeHtml(
                payload.email
              )}" style="color:${primary};text-decoration:none;">${escapeHtml(
                    payload.email
                  )}</a></td>
            </tr>`
                : ""
            }
            <tr>
              <td style="font-weight:600;color:${textColor};">${escapeHtml(
                t.labels.guests
              )}</td>
              <td style="color:${textColor};">${escapeHtml(
                String(payload.guestCount)
              )}</td>
            </tr>
            <tr style="background:${bg};">
              <td style="font-weight:600;color:${textColor};">${escapeHtml(
                t.labels.date
              )}</td>
              <td style="color:${textColor};">${escapeHtml(
                payload.reservationDate
              )}</td>
            </tr>
            <tr>
              <td style="font-weight:600;color:${textColor};">${escapeHtml(
                t.labels.time
              )}</td>
              <td style="color:${textColor};">${escapeHtml(
                payload.reservationTime
              )}</td>
            </tr>
            ${
              sourceLabel
                ? `<tr style="background:${bg};">
              <td style="font-weight:600;color:${textColor};">${escapeHtml(
                t.labels.source
              )}</td>
              <td style="color:${textColor};">${escapeHtml(sourceLabel)}</td>
            </tr>`
                : ""
            }
          </tbody>
        </table>

        ${
          payload.note
            ? `<div style="margin-top:18px;">
            <div style="font-weight:700;font-size:14px;color:${textColor}; margin-bottom:8px;">${escapeHtml(
              t.labels.note
            )}</div>
            <div style="white-space:pre-wrap;background:#fff;border:1px solid ${border};padding:12px 14px;border-radius:10px;color:${textColor};">
              ${escapeHtml(payload.note)}
            </div>
          </div>`
            : ""
        }
      </div>

      <div style="padding:14px 24px;border-top:1px solid ${border};background:#f8fafc;font-size:12px;color:${muted};">
        ${escapeHtml(t.footer)}
      </div>
    </div>
  </div>
</body></html>`;

  const text = `${subject}

${t.text.heading}
${t.labels.fullName}: ${payload.fullName}
${t.labels.phone}: ${payload.phoneNumber}
${payload.email ? `${t.labels.email}: ${payload.email}\n` : ""}${t.labels.guests}: ${
    payload.guestCount
  }
${t.labels.date}: ${payload.reservationDate}
${t.labels.time}: ${payload.reservationTime}
${sourceLabel ? `${t.labels.source}: ${sourceLabel}\n` : ""}${
    payload.note ? `${t.labels.note}: ${payload.note}\n` : ""
  }
`;

  const mailOptions = {
    from: `"${fromName}" <${fromAddr}>`,
    to: toAdmin,
    replyTo: payload.email || undefined,
    subject,
    html,
    text,
  };

  return transporter.sendMail(mailOptions);
}
