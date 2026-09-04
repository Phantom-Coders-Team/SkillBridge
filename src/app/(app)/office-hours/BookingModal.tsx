"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Briefcase,
  Code2,
  Layers,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { bookOfficeHour } from "./actions";

export interface BookableSlot {
  id: string;
  topic: string | null;
  timeSlot: string;
  durationMins: number;
  companyName: string | null;
  mentorName: string;
  designation: string | null;
}

const SESSION_FORMATS = [
  {
    id: "Career & Interview Guidance",
    title: "1:1 Career & Interview Guidance",
    desc: "Resume feedback, engineering interview preparation, and corporate hiring expectations.",
    icon: Briefcase,
    badge: "General Mentorship",
  },
  {
    id: "Code Clinic & Live Debugging",
    title: "Hands-on Code Clinic",
    desc: "Live code walkthrough, bug debugging, refactoring, and clean code best practices.",
    icon: Code2,
    badge: "Technical Clinic",
  },
  {
    id: "System Architecture Review",
    title: "System Architecture & PR Review",
    desc: "Database schema review, tech stack recommendations, API design, and cloud deployment.",
    icon: Layers,
    badge: "Architecture",
  },
];

export function BookingModal({
  slot,
  onClose,
  onBooked,
}: {
  slot: BookableSlot;
  onClose: () => void;
  onBooked: (meetingLink: string) => void;
}) {
  const [selectedFormat, setSelectedFormat] = useState(SESSION_FORMATS[0].id);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedMeetingLink, setBookedMeetingLink] = useState<string | null>(null);

  async function confirm() {
    setSubmitting(true);
    setError(null);
    const res = await bookOfficeHour(slot.id, selectedFormat, notes);
    setSubmitting(false);
    if (res.ok && res.meetingLink) {
      setBookedMeetingLink(res.meetingLink);
      onBooked(res.meetingLink);
    } else {
      setError(res.error || "Booking failed. Please try another slot.");
    }
  }

  const dateObj = new Date(slot.timeSlot);
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border-muted bg-white p-6 shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {bookedMeetingLink ? (
          /* Confirmation State */
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Mentorship Session Confirmed!
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your 1:1 session with <strong className="text-slate-700 dark:text-slate-200">{slot.mentorName}</strong> is locked in. An invitation has been dispatched to both your email and in-app notifications.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-left dark:border-emerald-800/60 dark:bg-emerald-950/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Session Video Room
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="truncate font-mono text-xs text-slate-600 dark:text-slate-300">
                  {bookedMeetingLink}
                </span>
                <a
                  href={bookedMeetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <Video className="size-3.5" />
                  Join Room <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Done & View My Bookings
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <>
            <div className="flex items-center justify-between border-b border-border-muted pb-4">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                  <Video className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Book 1:1 Mentorship Session
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct video consultation with industry professional
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Mentor & Slot Summary */}
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 dark:border-indigo-950/60 dark:bg-indigo-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{slot.mentorName}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {slot.companyName ? slot.companyName : "Industry Mentor"}
                    {slot.designation ? ` · ${slot.designation}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Free · Open Access
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                  {formattedDate}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                  {formattedTime} ({slot.durationMins} mins)
                </span>
              </div>
            </div>

            {/* Session Format Selection */}
            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Choose Session Objective
              </label>
              <div className="mt-2 space-y-2">
                {SESSION_FORMATS.map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = selectedFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-indigo-500"
                          : "border-border-muted hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {fmt.title}
                          </p>
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {fmt.badge}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {fmt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Agenda / Notes Input */}
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Discussion Notes or Questions (Optional)
              </label>
              <div className="relative mt-1.5">
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Would like feedback on my Next.js & Prisma full-stack repository or system design advice..."
                  className="w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border-muted pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border-muted px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    Confirm Booking (Free)
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
