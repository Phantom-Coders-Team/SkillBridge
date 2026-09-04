"use client";

import { useState } from "react";
import {
  CalendarClock,
  CalendarRange,
  Video,
  ExternalLink,
  Plus,
  Clock,
  Calendar,
  Sparkles,
  User,
} from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";
import { createMentorSlot } from "./actions";

const SLOT_TONE: Record<string, BadgeTone> = {
  AVAILABLE: "green",
  BOOKED: "blue",
  COMPLETED: "gray",
  CANCELLED: "red",
};

interface SlotData {
  id: string;
  topic: string | null;
  timeSlot: string;
  durationMins: number;
  status: string;
  studentName?: string | null;
  studentEmail?: string | null;
}

export function MentorSlotsClient({
  slots: initialSlots,
  isIndustry,
}: {
  slots: SlotData[];
  isIndustry: boolean;
}) {
  const [slots, setSlots] = useState<SlotData[]>(initialSlots);
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await createMentorSlot(formData);
    setSubmitting(false);
    if (res.ok) {
      setIsAdding(false);
      window.location.reload();
    } else {
      setError(res.error || "Failed to create slot");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          icon={CalendarRange}
          title="Mentor Slots"
          subtitle={
            isIndustry
              ? "Host 1:1 mentorship sessions, code clinics, and architecture reviews for aspiring candidates."
              : "Mentorship sessions booked with industry leaders."
          }
        />

        {isIndustry && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="size-4" />
            Host New Slot
          </button>
        )}
      </div>

      {isAdding && (
        <Card className="p-5 border-indigo-200 bg-indigo-50/20 dark:border-indigo-900/60 dark:bg-indigo-950/10">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Open a New Mentorship Slot
          </h3>
          <p className="text-xs text-slate-500">
            Students can reserve this slot for 1:1 guidance or code clinics.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                defaultValue={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                className="mt-1 w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Time
              </label>
              <input
                type="time"
                name="time"
                required
                defaultValue="15:00"
                className="mt-1 w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Duration
              </label>
              <select
                name="durationMins"
                className="mt-1 w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="15">15 Minutes (Code Clinic)</option>
                <option value="30">30 Minutes (Standard)</option>
                <option value="45">45 Minutes (In-depth)</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Focus Area / Topic (Optional)
              </label>
              <input
                type="text"
                name="topic"
                placeholder="e.g. Full-Stack Code Review, System Design, or Career Pathways"
                className="mt-1 w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            {error && (
              <p className="sm:col-span-3 text-xs font-semibold text-rose-600">
                {error}
              </p>
            )}

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-xl border border-border-muted px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Publish Slot"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {slots.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No mentor slots yet"
          description="Host your first slot to connect with promising student talent."
        />
      ) : (
        <div className="space-y-3">
          {slots.map((s) => {
            const dateObj = new Date(s.timeSlot);
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
            const meetingLink = `https://meet.jit.si/SkillBridge-Mentor-${s.id.slice(0, 10)}`;

            return (
              <Card
                key={s.id}
                hover
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={SLOT_TONE[s.status] ?? "gray"}>{s.status}</Badge>
                    {s.studentName && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <User className="size-3 text-indigo-500" />
                        Student: {s.studentName}
                      </span>
                    )}
                  </div>

                  {s.topic && (
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {s.topic}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Calendar className="size-3.5 text-indigo-500" />
                      {formattedDate}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Clock className="size-3.5 text-indigo-500" />
                      {formattedTime} ({s.durationMins}m)
                    </span>
                  </div>
                </div>

                {s.status === "BOOKED" && (
                  <div className="shrink-0 flex items-center gap-2">
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      <Video className="size-4" />
                      Join Video Meeting
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
