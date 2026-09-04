import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/notifications";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id),
    getUnreadCount(user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, notificationId } = body;

    if (action === "mark_read" && notificationId) {
      await markNotificationAsRead(notificationId, user.id);
      return NextResponse.json({ success: true });
    }

    if (action === "mark_all_read") {
      await markAllNotificationsAsRead(user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
