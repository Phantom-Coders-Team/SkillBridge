import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import {
  sendEmail,
  sendApplicationStatusEmail,
  sendRecruiterPitchEmail,
  sendNewApplicationAlertEmail,
  sendMentorBookingEmail,
  sendPitchAcceptedEmail,
} from "./email";

export interface AppNotification {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  message: string;
  type: "APPLICATION" | "PITCH" | "MENTOR_SLOT" | "BADGE" | "TEST" | "SYSTEM";
  link?: string;
  read: boolean;
  emailSent: boolean;
  emailSimulated?: boolean;
  createdAt: string;
}

const STORAGE_FILE = path.join(process.cwd(), ".notifications.json");

// In-memory cache fallback
let notificationsMemory: AppNotification[] = [];

function loadNotifications(): AppNotification[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, "utf-8");
      notificationsMemory = JSON.parse(data);
      return notificationsMemory;
    }
  } catch (err) {
    console.error("Failed to read .notifications.json, using in-memory store", err);
  }
  return notificationsMemory;
}

function saveNotifications(notifications: AppNotification[]) {
  notificationsMemory = notifications;
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(notifications.slice(0, 200), null, 2), "utf-8");
  } catch (err) {
    // Expected on read-only serverless lambdas
  }
}

function mapDbRow(row: any): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    userName: row.user_name,
    title: row.title,
    message: row.message,
    type: row.type as AppNotification["type"],
    link: row.link || undefined,
    read: Boolean(row.read),
    emailSent: Boolean(row.email_sent),
    emailSimulated: Boolean(row.email_simulated),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

/**
 * Creates an in-app notification and dispatches an email notification to user.email
 */
export async function createNotification({
  userId,
  userEmail,
  userName,
  title,
  message,
  type,
  link,
}: {
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  message: string;
  type: AppNotification["type"];
  link?: string;
}): Promise<AppNotification> {
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newNotification: AppNotification = {
    id: notifId,
    userId,
    userEmail,
    userName,
    title,
    message,
    type,
    link,
    read: false,
    emailSent: false,
    createdAt: now,
  };

  try {
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO notifications (id, user_id, user_email, user_name, title, message, type, link, read, email_sent, email_simulated, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::timestamptz)
      ON CONFLICT (id) DO NOTHING
      `,
      notifId,
      userId,
      userEmail,
      userName,
      title,
      message,
      type,
      link || null,
      false,
      false,
      false,
      now
    );
  } catch (err) {
    console.error("Failed to save notification to Neon PostgreSQL, using local fallback", err);
    const current = loadNotifications();
    current.unshift(newNotification);
    saveNotifications(current);
  }

  return newNotification;
}

export async function updateNotificationEmailStatus(
  id: string,
  emailSent: boolean,
  emailSimulated?: boolean
) {
  try {
    await prisma.$executeRawUnsafe(
      `
      UPDATE notifications
      SET email_sent = $1, email_simulated = $2
      WHERE id = $3
      `,
      emailSent,
      Boolean(emailSimulated),
      id
    );
  } catch (err) {
    console.error("Failed to update notification email status in DB", err);
  }

  const all = loadNotifications();
  const item = all.find((n) => n.id === id);
  if (item) {
    item.emailSent = emailSent;
    item.emailSimulated = emailSimulated;
    saveNotifications(all);
  }
}

/**
 * Get recent notifications for a user
 */
export async function getUserNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 30
      `,
      userId
    );
    if (rows && rows.length > 0) {
      return rows.map(mapDbRow);
    }
  } catch (err) {
    console.error("Failed to fetch user notifications from DB, falling back to file/memory", err);
  }

  const all = loadNotifications();
  return all.filter((n) => n.userId === userId).slice(0, 30);
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const result = await prisma.$queryRawUnsafe<{ count: string | number }[]>(
      `
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = $1 AND read = false
      `,
      userId
    );
    if (result && result[0]) {
      return Number(result[0].count);
    }
  } catch (err) {
    console.error("Failed to fetch unread count from DB, falling back to file/memory", err);
  }

  const all = loadNotifications();
  return all.filter((n) => n.userId === userId && !n.read).length;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    await prisma.$executeRawUnsafe(
      `
      UPDATE notifications
      SET read = true
      WHERE id = $1 AND user_id = $2
      `,
      notificationId,
      userId
    );
  } catch (err) {
    console.error("Failed to mark notification as read in DB", err);
  }

  const all = loadNotifications();
  const notif = all.find((n) => n.id === notificationId && n.userId === userId);
  if (notif) {
    notif.read = true;
    saveNotifications(all);
    return true;
  }
  return false;
}

/**
 * Mark all user notifications as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    await prisma.$executeRawUnsafe(
      `
      UPDATE notifications
      SET read = true
      WHERE user_id = $1 AND read = false
      `,
      userId
    );
  } catch (err) {
    console.error("Failed to mark all notifications as read in DB", err);
  }

  const all = loadNotifications();
  let updated = false;
  all.forEach((n) => {
    if (n.userId === userId && !n.read) {
      n.read = true;
      updated = true;
    }
  });
  if (updated) {
    saveNotifications(all);
  }
  return true;
}

/* -------------------------------------------------------------------------- */
/*             High-Level Triggers: Save Notification + Send Email            */
/* -------------------------------------------------------------------------- */

export async function notifyApplicationStatusChange({
  studentId,
  studentEmail,
  studentName,
  listingTitle,
  companyName,
  status,
  interviewDetails,
}: {
  studentId: string;
  studentEmail: string;
  studentName: string;
  listingTitle: string;
  companyName: string;
  status: string;
  interviewDetails?: {
    date?: string;
    mode?: string;
    link?: string;
    notes?: string;
  };
}) {
  const isApproved =
    status.toUpperCase() === "APPROVED" ||
    status.toUpperCase() === "ACCEPTED" ||
    status.toUpperCase() === "OFFERED";
  const isInterview = status.toUpperCase() === "INTERVIEW";

  let title = `Application Status: ${status} (${listingTitle})`;
  let message = `${companyName} has updated your application status for ${listingTitle} to ${status}.`;

  if (isApproved) {
    title = `Offer Approved: ${listingTitle}`;
    message = `Congratulations! ${companyName} has updated and approved your placement application for ${listingTitle}.`;
  } else if (isInterview) {
    title = `Interview Scheduled: ${listingTitle}`;
    const datePart = interviewDetails?.date
      ? ` for ${new Date(interviewDetails.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
      : "";
    const modePart = interviewDetails?.mode ? ` via ${interviewDetails.mode}` : "";
    message = `${companyName} scheduled an interview${datePart}${modePart}. Check your applications for meeting link and details.`;
  }

  const notif = await createNotification({
    userId: studentId,
    userEmail: studentEmail,
    userName: studentName,
    title,
    message,
    type: "APPLICATION",
    link: "/internships",
  });

  const emailResult = await sendApplicationStatusEmail({
    studentEmail,
    studentName,
    listingTitle,
    companyName,
    status,
    interviewDetails,
  });

  notif.emailSent = emailResult.success;
  notif.emailSimulated = emailResult.simulated;
  await updateNotificationEmailStatus(notif.id, emailResult.success, emailResult.simulated);

  return { notification: notif, emailResult };
}

export async function notifyRecruiterPitch({
  studentId,
  studentEmail,
  studentName,
  companyName,
  roleDetails,
  stipend,
}: {
  studentId: string;
  studentEmail: string;
  studentName: string;
  companyName: string;
  roleDetails: string;
  stipend: number;
}) {
  const title = `Recruiter Pitch from ${companyName}`;
  const message = `${companyName} pitched you for "${roleDetails}" with a stipend of ₹${stipend.toLocaleString("en-IN")}/mo.`;

  const notif = await createNotification({
    userId: studentId,
    userEmail: studentEmail,
    userName: studentName,
    title,
    message,
    type: "PITCH",
    link: "/reverse-placement",
  });

  const emailResult = await sendRecruiterPitchEmail({
    studentEmail,
    studentName,
    companyName,
    roleDetails,
    stipend,
  });

  notif.emailSent = emailResult.success;
  notif.emailSimulated = emailResult.simulated;
  await updateNotificationEmailStatus(notif.id, emailResult.success, emailResult.simulated);

  return { notification: notif, emailResult };
}

export async function notifyNewApplicationSubmitted({
  recruiterId,
  recruiterEmail,
  recruiterName,
  studentName,
  listingTitle,
  matchScore,
}: {
  recruiterId: string;
  recruiterEmail: string;
  recruiterName: string;
  studentName: string;
  listingTitle: string;
  matchScore?: number;
}) {
  const title = `New Applicant: ${studentName}`;
  const message = `${studentName} applied for "${listingTitle}"${matchScore ? ` (${matchScore}% match)` : ""}.`;

  const notif = await createNotification({
    userId: recruiterId,
    userEmail: recruiterEmail,
    userName: recruiterName,
    title,
    message,
    type: "APPLICATION",
    link: "/internships",
  });

  const emailResult = await sendNewApplicationAlertEmail({
    recruiterEmail,
    recruiterName,
    studentName,
    listingTitle,
    matchScore,
  });

  notif.emailSent = emailResult.success;
  notif.emailSimulated = emailResult.simulated;
  await updateNotificationEmailStatus(notif.id, emailResult.success, emailResult.simulated);

  return { notification: notif, emailResult };
}

export async function notifyMentorBooking({
  studentId,
  studentEmail,
  studentName,
  mentorId,
  mentorEmail,
  mentorName,
  topic,
  timeLabel,
}: {
  studentId: string;
  studentEmail: string;
  studentName: string;
  mentorId: string;
  mentorEmail: string;
  mentorName: string;
  topic: string;
  timeLabel: string;
}) {
  // 1. Notify Student
  const studentNotif = await createNotification({
    userId: studentId,
    userEmail: studentEmail,
    userName: studentName,
    title: `Mentorship Confirmed: ${mentorName}`,
    message: `Your office hour session with ${mentorName} on "${topic}" is confirmed for ${timeLabel}.`,
    type: "MENTOR_SLOT",
    link: "/office-hours",
  });

  // 2. Notify Mentor
  const mentorNotif = await createNotification({
    userId: mentorId,
    userEmail: mentorEmail,
    userName: mentorName,
    title: `New Mentorship Booking: ${studentName}`,
    message: `${studentName} has booked an office hour session with you on "${topic}" (${timeLabel}).`,
    type: "MENTOR_SLOT",
    link: "/office-hours",
  });

  const [studentEmailRes, mentorEmailRes] = await Promise.all([
    sendMentorBookingEmail({
      recipientEmail: studentEmail,
      recipientName: studentName,
      otherPartyName: mentorName,
      topic,
      timeLabel,
      isMentor: false,
    }),
    sendMentorBookingEmail({
      recipientEmail: mentorEmail,
      recipientName: mentorName,
      otherPartyName: studentName,
      topic,
      timeLabel,
      isMentor: true,
    }),
  ]);

  studentNotif.emailSent = studentEmailRes.success;
  studentNotif.emailSimulated = studentEmailRes.simulated;
  mentorNotif.emailSent = mentorEmailRes.success;
  mentorNotif.emailSimulated = mentorEmailRes.simulated;
  await updateNotificationEmailStatus(studentNotif.id, studentEmailRes.success, studentEmailRes.simulated);
  await updateNotificationEmailStatus(mentorNotif.id, mentorEmailRes.success, mentorEmailRes.simulated);

  return { studentNotif, mentorNotif };
}

export async function notifyPitchAccepted({
  recruiterId,
  recruiterEmail,
  recruiterName,
  studentId,
  studentEmail,
  studentName,
  roleDetails,
  stipend,
}: {
  recruiterId: string;
  recruiterEmail: string;
  recruiterName: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  roleDetails: string;
  stipend: number;
}) {
  const recruiterNotif = await createNotification({
    userId: recruiterId,
    userEmail: recruiterEmail,
    userName: recruiterName,
    title: `Job Pitch Accepted: ${studentName}`,
    message: `${studentName} has accepted your placement offer for "${roleDetails}" (₹${stipend.toLocaleString("en-IN")}/mo).`,
    type: "PITCH",
    link: "/job-pitches",
  });

  const studentNotif = await createNotification({
    userId: studentId,
    userEmail: studentEmail,
    userName: studentName,
    title: `Offer Accepted: ${recruiterName}`,
    message: `You accepted the offer from ${recruiterName} for "${roleDetails}".`,
    type: "PITCH",
    link: "/reverse-placement",
  });

  const emailResult = await sendPitchAcceptedEmail({
    recruiterEmail,
    recruiterName,
    studentName,
    roleDetails,
    stipend,
  });

  recruiterNotif.emailSent = emailResult.success;
  recruiterNotif.emailSimulated = emailResult.simulated;
  studentNotif.emailSent = emailResult.success;
  studentNotif.emailSimulated = emailResult.simulated;
  await updateNotificationEmailStatus(recruiterNotif.id, emailResult.success, emailResult.simulated);
  await updateNotificationEmailStatus(studentNotif.id, emailResult.success, emailResult.simulated);

  return { recruiterNotif, studentNotif, emailResult };
}

