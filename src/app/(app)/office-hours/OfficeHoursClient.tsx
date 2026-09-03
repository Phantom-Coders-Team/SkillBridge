"use client";

import { useState } from "react";
import { BookingModal, type BookableSlot } from "./BookingModal";
import { OFFICE_HOUR_COST, CODE_CLINIC_COST } from "./costs";

export function OfficeHoursClient({
  slots,
  initialBalance,
}: {
  slots: BookableSlot[];
  initialBalance: number;
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [selected, setSelected] = useState<BookableSlot | null>(null);

  return (
    <div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Token Balance</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{balance} 🪙</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">spendable on mentorship</p>
        </div>
        <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Office Hours</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{OFFICE_HOUR_COST} 🪙</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">per general session</p>
        </div>
        <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Code Clinic</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{CODE_CLINIC_COST} 🪙</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">per 15-min slot</p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-gray-100">Available Sessions</h2>
      {slots.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-border-muted bg-surface p-8 text-center text-sm text-slate-500 shadow-card">
          No available mentorship sessions right now.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((s) => (
            <div key={s.id} className="flex flex-col rounded-2xl border border-border-muted bg-surface p-5 shadow-card">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{s.mentorName}</h3>
              {s.companyName && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {s.companyName}
                  {s.designation ? ` · ${s.designation}` : ""}
                </p>
              )}
              {s.topic && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{s.topic}</p>}
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {new Date(s.timeSlot).toLocaleString()} · {s.durationMins} min
              </p>
              <div className="mt-4 flex-1" />
              <button
                onClick={() => setSelected(s)}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Book with tokens
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <BookingModal
          slot={selected}
          balance={balance}
          onClose={() => setSelected(null)}
          onBooked={(newBalance) => {
            setBalance(newBalance);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
