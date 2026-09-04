"use client";

import { useState } from "react";
import { Calendar, Video, Link2, FileText, X, Loader2 } from "lucide-react";
import { updateApplicationStatus } from "./actions";
import type { InterviewDetails } from "@/lib/interview";

export default function ScheduleInterviewModal({
  appId,
  studentName,
  existingInterview,
  isReschedule = false,
}: {
  appId: string;
  studentName: string;
  existingInterview?: InterviewDetails;
  isReschedule?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tomorrow at 11:00 AM as a smart default
  const getDefaultDateTime = () => {
    if (existingInterview?.date) {
      try {
        const d = new Date(existingInterview.date);
        return d.toISOString().slice(0, 16);
      } catch {}
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(11, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [date, setDate] = useState(getDefaultDateTime);
  const [mode, setMode] = useState(existingInterview?.mode || "Google Meet");
  const [link, setLink] = useState(existingInterview?.link || "https://meet.google.com/");
  const [notes, setNotes] = useState(
    existingInterview?.notes ||
      "Please prepare a walkthrough of your latest GitHub projects and have your portfolio code ready."
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("appId", appId);
    formData.append("status", "INTERVIEW");
    formData.append("interviewDate", date);
    formData.append("interviewMode", mode);
    formData.append("interviewLink", link);
    formData.append("interviewNotes", notes);

    try {
      const res = await updateApplicationStatus(null, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
      }
    } catch {
      setError("Failed to schedule interview.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold transition-colors cursor-pointer ${
          isReschedule
            ? "border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
            : "bg-purple-600 text-white hover:bg-purple-700 shadow-2xs"
        }`}
        title={isReschedule ? "Update interview schedule" : "Schedule interview with candidate"}
      >
        <Calendar className="size-3" />
        <span>{isReschedule ? "Reschedule" : "Interview"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border-muted bg-surface p-6 shadow-2xl transition-all">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-muted pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Calendar className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isReschedule ? "Reschedule Interview" : "Schedule Candidate Interview"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Candidate: <span className="font-semibold text-slate-700 dark:text-slate-300">{studentName}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Date & Time */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-purple-500 dark:text-slate-100"
                />
              </div>

              {/* Mode */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Platform / Mode *
                </label>
                <div className="relative">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-purple-500 dark:text-slate-100"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom Meeting">Zoom Meeting</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="In-Person / Office Visit">In-Person / Office Visit</option>
                    <option value="Telephonic Round">Telephonic Round</option>
                  </select>
                </div>
              </div>

              {/* Meeting Link / Venue */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Meeting URL / Venue Details *
                </label>
                <div className="relative flex items-center">
                  <Link2 className="absolute left-3 size-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. https://meet.google.com/abc-defg-hij or Corporate Office Floor 4"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full rounded-xl border border-border-muted bg-surface pl-8 pr-3 py-2 text-xs text-slate-900 outline-none transition focus:border-purple-500 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Notes / Instructions */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Instructions for Candidate (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please bring your laptop with project code and be prepared for a 30-min technical discussion."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-purple-500 dark:text-slate-100"
                />
              </div>

              {/* Buttons */}
              <div className="mt-5 flex items-center justify-end gap-2 border-t border-border-muted pt-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="rounded-xl border border-border-muted px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || !date || !link}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Calendar className="size-3.5" />}
                  <span>{isReschedule ? "Update Schedule" : "Schedule & Notify Candidate"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
