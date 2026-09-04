"use client";

import { useState } from "react";
import {
  CalendarClock,
  Video,
  CheckCircle2,
  Users,
  Building2,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Clock,
  Sparkles,
  XCircle,
} from "lucide-react";
import { BookingModal, type BookableSlot } from "./BookingModal";
import { cancelOfficeHour } from "./actions";

export interface BookedSession {
  id: string;
  topic: string | null;
  timeSlot: string;
  durationMins: number;
  status: string;
  mentorName: string;
  companyName: string | null;
  designation: string | null;
}

export function OfficeHoursClient({
  slots,
  myBookings: initialBookings = [],
}: {
  slots: BookableSlot[];
  myBookings?: BookedSession[];
}) {
  const [selectedSlot, setSelectedSlot] = useState<BookableSlot | null>(null);
  const [bookings, setBookings] = useState<BookedSession[]>(initialBookings);
  const [availableSlots, setAvailableSlots] = useState<BookableSlot[]>(slots);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"available" | "my-sessions">("available");

  function copyMeetingLink(id: string, link: string) {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleCancel(slotId: string) {
    if (!confirm("Are you sure you want to cancel this mentorship session?")) return;
    setCancellingId(slotId);
    const res = await cancelOfficeHour(slotId);
    setCancellingId(null);
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== slotId));
    } else {
      alert(res.error || "Failed to cancel session");
    }
  }

  function handleBookingSuccess(meetingLink: string) {
    if (!selectedSlot) return;
    // Add to bookings list
    const newBooking: BookedSession = {
      id: selectedSlot.id,
      topic: selectedSlot.topic,
      timeSlot: selectedSlot.timeSlot,
      durationMins: selectedSlot.durationMins,
      status: "BOOKED",
      mentorName: selectedSlot.mentorName,
      companyName: selectedSlot.companyName,
      designation: selectedSlot.designation,
    };
    setBookings((prev) => [newBooking, ...prev]);
    setAvailableSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));
    setActiveTab("my-sessions");
  }

  return (
    <div className="space-y-6">
      {/* Mentorship Highlights Banner */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Available Mentors
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {availableSlots.length} Slots
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Open for 1:1 booking with verified industry engineers
          </p>
        </div>

        <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                My Booked Sessions
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {bookings.length}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Confirmed consultations ready to attend via live video
          </p>
        </div>

        <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
              <Video className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Attendance Mode
              </p>
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                100% Free
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Direct video call room with screenshare & mic support
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-muted pb-2">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "available"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Users className="size-3.5" />
          Available Sessions ({availableSlots.length})
        </button>

        <button
          onClick={() => setActiveTab("my-sessions")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "my-sessions"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Video className="size-3.5" />
          My Booked Sessions ({bookings.length})
        </button>
      </div>

      {/* TAB 1: AVAILABLE SESSIONS */}
      {activeTab === "available" && (
        <div>
          {availableSlots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-muted bg-surface p-12 text-center shadow-card">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <CalendarClock className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
                No Available Sessions Right Now
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Industry mentors regularly post new office hour slots. Check back soon or browse industry challenges!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableSlots.map((s) => {
                const dateObj = new Date(s.timeSlot);
                const formattedDate = dateObj.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
                const formattedTime = dateObj.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={s.id}
                    className="flex flex-col rounded-2xl border border-border-muted bg-surface p-5 shadow-card transition-all hover:border-indigo-200 dark:hover:border-indigo-900/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {s.mentorName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {s.companyName || "Industry Partner"}
                          {s.designation ? ` · ${s.designation}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        Open Slot
                      </span>
                    </div>

                    {s.topic && (
                      <div className="mt-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50">
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                          {s.topic}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Calendar className="size-3.5 text-indigo-500" />
                        {formattedDate}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Clock className="size-3.5 text-indigo-500" />
                        {formattedTime} ({s.durationMins}m)
                      </span>
                    </div>

                    <div className="mt-4 flex-1" />

                    <button
                      onClick={() => setSelectedSlot(s)}
                      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-[0.98]"
                    >
                      <Sparkles className="size-3.5" />
                      Book 1:1 Session (Free)
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY BOOKED SESSIONS & LIVE ROOMS */}
      {activeTab === "my-sessions" && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-muted bg-surface p-12 text-center shadow-card">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Video className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
                No Booked Sessions Yet
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Explore available sessions above to book free 1:1 consultations, code clinics, or architecture reviews with industry mentors.
              </p>
              <button
                onClick={() => setActiveTab("available")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
              >
                Browse Available Mentors
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const dateObj = new Date(b.timeSlot);
                const formattedDate = dateObj.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const meetingLink = `https://meet.jit.si/SkillBridge-Mentor-${b.id.slice(0, 10)}`;

                return (
                  <div
                    key={b.id}
                    className="flex flex-col gap-4 rounded-2xl border border-emerald-200/80 bg-surface p-5 shadow-card dark:border-emerald-900/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {b.mentorName}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {b.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {b.companyName || "Industry Mentor"}
                        {b.designation ? ` · ${b.designation}` : ""}
                      </p>

                      {b.topic && (
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          🎯 Topic: {b.topic}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Calendar className="size-3.5 text-indigo-500" />
                          {formattedDate}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Clock className="size-3.5 text-indigo-500" />
                          {formattedTime} ({b.durationMins}m)
                        </span>
                      </div>
                    </div>

                    {/* Attendance Video Room Actions */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                      <a
                        href={meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-[0.98]"
                      >
                        <Video className="size-4" />
                        Join Video Meeting
                        <ExternalLink className="size-3.5" />
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyMeetingLink(b.id, meetingLink)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border-muted bg-surface px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {copiedId === b.id ? (
                            <>
                              <Check className="size-3 text-emerald-600" /> Copied Link
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" /> Copy Link
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={cancellingId === b.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        >
                          <XCircle className="size-3" />
                          {cancellingId === b.id ? "Cancelling..." : "Cancel"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onBooked={(meetingLink) => {
            handleBookingSuccess(meetingLink);
          }}
        />
      )}
    </div>
  );
}
