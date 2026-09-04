import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailSendResult {
  success: boolean;
  simulated?: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Creates and caches the nodemailer transporter if SMTP credentials exist in env.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

/**
 * Dispatches an email using nodemailer SMTP, or gracefully simulates in console
 * when credentials are not configured.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<EmailSendResult> {
  const from =
    process.env.SMTP_FROM ||
    `"SkillBridge Notifications" <notifications@skillbridge.edu>`;

  const transporter = getTransporter();

  if (!transporter) {
    // Graceful dev simulation fallback - perfect for local dev and demo juries
    console.log(`\n======================================================`);
    console.log(`📨 [SIMULATED EMAIL NOTIFICATION DISPATCHED]`);
    console.log(`From:    ${from}`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Time:    ${new Date().toISOString()}`);
    console.log(`Body Snippet: ${text || html.slice(0, 150)}...`);
    console.log(`======================================================\n`);

    return {
      success: true,
      simulated: true,
      messageId: `simulated-${Date.now()}`,
    };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ""),
      html,
    });

    console.log(`✅ [EMAIL SENT] ID: ${info.messageId} to ${to}`);
    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    console.error(`❌ [EMAIL ERROR] Failed to send email to ${to}:`, message);
    return {
      success: false,
      error: message,
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                        Branded HTML Template Engine                        */
/* -------------------------------------------------------------------------- */

export interface EmailTemplateProps {
  title: string;
  recipientName: string;
  badgeText?: string;
  badgeTone?: "green" | "blue" | "amber" | "purple" | "indigo";
  headline: string;
  description: string;
  details?: Array<{ label: string; value: string }>;
  ctaLabel?: string;
  ctaUrl?: string;
}

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  green: { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
  blue: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
  amber: { bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
  purple: { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
  indigo: { bg: "#eef2ff", text: "#3730a3", border: "#c7d2fe" },
};

export function renderEmailTemplate({
  title,
  recipientName,
  badgeText,
  badgeTone = "indigo",
  headline,
  description,
  details = [],
  ctaLabel,
  ctaUrl,
}: EmailTemplateProps): string {
  const badgeStyle = BADGE_COLORS[badgeTone] || BADGE_COLORS.indigo;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const finalCtaUrl = ctaUrl ? (ctaUrl.startsWith("http") ? ctaUrl : `${baseUrl}${ctaUrl}`) : baseUrl;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px 32px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 9999px; margin-bottom: 8px;">
                      <span style="color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">SkillBridge Notification</span>
                    </div>
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">SkillBridge</h1>
                    <p style="color: #e0e7ff; font-size: 12px; margin: 4px 0 0 0;">Academia × Industry Portal</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              ${
                badgeText
                  ? `
                <div style="display: inline-block; background-color: ${badgeStyle.bg}; color: ${badgeStyle.text}; border: 1px solid ${badgeStyle.border}; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px;">
                  ${badgeText}
                </div>
              `
                  : ""
              }

              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; line-height: 1.4;">
                ${headline}
              </h2>

              <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0;">
                Hello <strong>${recipientName}</strong>,
              </p>

              <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
                ${description}
              </p>

              ${
                details.length > 0
                  ? `
                <!-- Key Details Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
                  ${details
                    .map(
                      (item) => `
                    <tr>
                      <td style="padding: 6px 8px; font-size: 13px; color: #64748b; font-weight: 600; width: 38%; vertical-align: top;">
                        ${item.label}
                      </td>
                      <td style="padding: 6px 8px; font-size: 13px; color: #0f172a; font-weight: 700; vertical-align: top;">
                        ${item.value}
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </table>
              `
                  : ""
              }

              ${
                ctaLabel
                  ? `
                <!-- Action Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 16px 0;">
                  <tr>
                    <td align="center">
                      <a href="${finalCtaUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
                        ${ctaLabel} &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              `
                  : ""
              }

              <p style="font-size: 12px; color: #94a3b8; margin: 24px 0 0 0; text-align: center;">
                If the button above does not work, copy and paste this URL into your browser:<br/>
                <a href="${finalCtaUrl}" style="color: #6366f1; text-decoration: underline; word-break: break-all;">${finalCtaUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px 0;">
                You are receiving this automated email notification from SkillBridge because you are a registered user.
              </p>
              <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
                &copy; ${new Date().getFullYear()} SkillBridge Platform · Smart India Hackathon
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/* -------------------------------------------------------------------------- */
/*                         High-Level Email Dispatchers                       */
/* -------------------------------------------------------------------------- */

/**
 * 1. Application status update (e.g. Industry approves student application)
 */
export async function sendApplicationStatusEmail({
  studentEmail,
  studentName,
  listingTitle,
  companyName,
  status,
}: {
  studentEmail: string;
  studentName: string;
  listingTitle: string;
  companyName: string;
  status: string;
}) {
  const isApproved =
    status.toUpperCase() === "APPROVED" ||
    status.toUpperCase() === "ACCEPTED" ||
    status.toUpperCase() === "OFFERED";

  const headline = isApproved
    ? `🎉 Congratulations! Your application for "${listingTitle}" has been approved!`
    : `Application Status Update: "${listingTitle}" is now ${status}`;

  const description = isApproved
    ? `Great news! ${companyName} has reviewed your verified skills and credentials and updated your application status to <strong>${status}</strong>. Please log in to review onboarding materials and connect with the hiring manager.`
    : `${companyName} has updated the status of your application for <strong>${listingTitle}</strong> to <strong>${status}</strong>.`;

  const html = renderEmailTemplate({
    title: `Application Update: ${listingTitle}`,
    recipientName: studentName,
    badgeText: isApproved ? "Offer Approved & Verified" : `Status: ${status}`,
    badgeTone: isApproved ? "green" : "blue",
    headline,
    description,
    details: [
      { label: "Company", value: companyName },
      { label: "Opportunity", value: listingTitle },
      { label: "New Status", value: status },
      { label: "Updated At", value: new Date().toLocaleDateString("en-IN", { dateStyle: "long" }) },
    ],
    ctaLabel: "View Application Status",
    ctaUrl: "/internships",
  });

  return sendEmail({
    to: studentEmail,
    subject: isApproved
      ? `🎉 Congratulations! ${companyName} approved your application for ${listingTitle}`
      : `Application Update: ${status} for ${listingTitle} at ${companyName}`,
    html,
  });
}

/**
 * 2. Recruiter Reverse Placement Pitch
 */
export async function sendRecruiterPitchEmail({
  studentEmail,
  studentName,
  companyName,
  roleDetails,
  stipend,
}: {
  studentEmail: string;
  studentName: string;
  companyName: string;
  roleDetails: string;
  stipend: number;
}) {
  const html = renderEmailTemplate({
    title: `New Recruiter Pitch from ${companyName}`,
    recipientName: studentName,
    badgeText: "Direct Corporate Pitch",
    badgeTone: "purple",
    headline: `🚀 ${companyName} wants to hire you through Reverse Placement!`,
    description: `Based on your verified Proof-of-Work badges and high Placement Readiness Index (PRI), recruiters from <strong>${companyName}</strong> have sent you a direct placement pitch.`,
    details: [
      { label: "Company", value: companyName },
      { label: "Proposed Role", value: roleDetails },
      { label: "Monthly Stipend", value: `₹${stipend.toLocaleString("en-IN")}/month` },
      { label: "Platform Priority", value: "Verified Top Candidate (PRI 850+)" },
    ],
    ctaLabel: "Review Job Pitch",
    ctaUrl: "/reverse-placement",
  });

  return sendEmail({
    to: studentEmail,
    subject: `🚀 ${companyName} sent you a Job Pitch with ₹${stipend.toLocaleString("en-IN")}/mo stipend!`,
    html,
  });
}

/**
 * 3. Alert Recruiter about new student application
 */
export async function sendNewApplicationAlertEmail({
  recruiterEmail,
  recruiterName,
  studentName,
  listingTitle,
  matchScore,
}: {
  recruiterEmail: string;
  recruiterName: string;
  studentName: string;
  listingTitle: string;
  matchScore?: number;
}) {
  const html = renderEmailTemplate({
    title: `New Applicant for ${listingTitle}`,
    recipientName: recruiterName,
    badgeText: matchScore ? `${matchScore}% Skill Match` : "New Applicant",
    badgeTone: matchScore && matchScore >= 75 ? "green" : "indigo",
    headline: `📥 ${studentName} applied for "${listingTitle}"`,
    description: `A new student has submitted an application for your opportunity <strong>${listingTitle}</strong>. Their verified portfolio and credentials are ready for your review.`,
    details: [
      { label: "Candidate", value: studentName },
      { label: "Role Listing", value: listingTitle },
      ...(matchScore ? [{ label: "Skill Match Compatibility", value: `${matchScore}% Match` }] : []),
      { label: "Date Received", value: new Date().toLocaleDateString("en-IN", { dateStyle: "long" }) },
    ],
    ctaLabel: "Review Applicant",
    ctaUrl: "/internships",
  });

  return sendEmail({
    to: recruiterEmail,
    subject: `📥 New Applicant: ${studentName} applied for ${listingTitle}`,
    html,
  });
}

/**
 * 4. Mentor Session Confirmation (Office hours)
 */
export async function sendMentorBookingEmail({
  recipientEmail,
  recipientName,
  otherPartyName,
  topic,
  timeLabel,
  isMentor,
}: {
  recipientEmail: string;
  recipientName: string;
  otherPartyName: string;
  topic: string;
  timeLabel: string;
  isMentor: boolean;
}) {
  const headline = isMentor
    ? `📅 Mentorship Session Booked with ${otherPartyName}`
    : `📅 Your Mentorship Session with ${otherPartyName} is Confirmed!`;

  const description = isMentor
    ? `Student <strong>${otherPartyName}</strong> has redeemed their skill tokens to book an office hour session with you on <em>"${topic}"</em>.`
    : `Your office hour session with industry mentor <strong>${otherPartyName}</strong> has been confirmed. Prepare your code queries and questions ahead of time!`;

  const html = renderEmailTemplate({
    title: `Mentorship Session: ${topic}`,
    recipientName,
    badgeText: "1:1 Office Hours Confirmed",
    badgeTone: "amber",
    headline,
    description,
    details: [
      { label: isMentor ? "Student" : "Industry Mentor", value: otherPartyName },
      { label: "Topic / Focus", value: topic },
      { label: "Schedule Time", value: timeLabel },
      { label: "Meeting Venue", value: "SkillBridge Virtual Meet (Link in portal)" },
    ],
    ctaLabel: "Open Office Hours",
    ctaUrl: "/office-hours",
  });

  return sendEmail({
    to: recipientEmail,
    subject: `📅 Confirmed: Mentorship Session on "${topic}" with ${otherPartyName}`,
    html,
  });
}

/**
 * 5. Test Email Trigger for Live Demos
 */
export async function sendTestNotificationEmail({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName: string;
}) {
  const html = renderEmailTemplate({
    title: "SkillBridge Email Notification Test",
    recipientName: userName,
    badgeText: "Live Test Dispatch",
    badgeTone: "green",
    headline: "🔔 Your SkillBridge Email Notifications are Active!",
    description: "This is a test notification confirming that the SkillBridge automated email engine is successfully configured, active, and delivering verified alerts to your inbox.",
    details: [
      { label: "Recipient Email", value: userEmail },
      { label: "Status", value: "Verified & Operational" },
      { label: "Engine", value: "Nodemailer SMTP Dispatcher" },
      { label: "Timestamp", value: new Date().toLocaleString("en-IN") },
    ],
    ctaLabel: "Go to Dashboard",
    ctaUrl: "/dashboard",
  });

  return sendEmail({
    to: userEmail,
    subject: "🔔 SkillBridge Test Notification · Email Service Active",
    html,
  });
}
