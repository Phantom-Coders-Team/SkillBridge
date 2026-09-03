"use client";

import { useState } from "react";
import { bookOfficeHour } from "./actions";
import { OFFICE_HOUR_COST, CODE_CLINIC_COST } from "./costs";

export interface BookableSlot {
  id: string;
  topic: string | null;
  timeSlot: string;
  durationMins: number;
  companyName: string | null;
  mentorName: string;
  designation: string | null;
}

export function BookingModal({
  slot,
  balance,
  onClose,
  onBooked,
}: {
  slot: BookableSlot;
  balance: number;
  onClose: () => void;
  onBooked: (balance: number) => void;
}) {
  const [variant, setVariant] = useState<"OFFICE_HOUR" | "CODE_CLINIC">("OFFICE_HOUR");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cost = variant === "CODE_CLINIC" ? CODE_CLINIC_COST : OFFICE_HOUR_COST;
  const cannotAfford = balance < cost;

  async function confirm() {
    setSubmitting(true);
    setError(null);
    const res = await bookOfficeHour(slot.id, variant);
    setSubmitting(false);
    if (res.ok && res.balance !== undefined) {
      onBooked(res.balance);
    } else {
      setError(res.error || "Booking failed.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Spend Tokens · Reserve Session</h3>
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700" aria-label="Close">
            <span className="text-lg">✕</span>
          </button>
        </div>

        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800/50">
          <p className="font-medium text-gray-900 dark:text-gray-100">{slot.mentorName}</p>
          {slot.companyName && <p className="text-gray-600 dark:text-gray-300">{slot.companyName}{slot.designation ? ` · ${slot.designation}` : ""}</p>}
          {slot.topic && <p className="mt-1 text-gray-700 dark:text-gray-300">{slot.topic}</p>}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {new Date(slot.timeSlot).toLocaleString()} · {slot.durationMins} min
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => setVariant("OFFICE_HOUR")}
            className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${variant === "OFFICE_HOUR" ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40" : "border-gray-200 dark:border-gray-600"}`}
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Office Hours</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">General career + skill guidance</p>
            </div>
            <span className="text-sm font-bold text-indigo-600">{OFFICE_HOUR_COST} 🪙</span>
          </button>
          <button
            type="button"
            onClick={() => setVariant("CODE_CLINIC")}
            className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${variant === "CODE_CLINIC" ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40" : "border-gray-200 dark:border-gray-600"}`}
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">15-min Code Clinic</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hands-on code review / live debugging</p>
            </div>
            <span className="text-sm font-bold text-indigo-600">{CODE_CLINIC_COST} 🪙</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-700 dark:bg-amber-900/40">
          <span className="text-amber-800">Your balance</span>
          <span className={`font-bold ${cannotAfford ? "text-red-600" : "text-gray-900 dark:text-gray-100"}`}>{balance} 🪙</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800/50">
          <span className="text-gray-600 dark:text-gray-300">Cost</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">−{cost} 🪙</span>
        </div>

        {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={submitting || cannotAfford}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              `Book · ${cost} tokens`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
