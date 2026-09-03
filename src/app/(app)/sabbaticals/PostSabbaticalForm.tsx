"use client";

import { useState } from "react";
import { postSabbaticalListing } from "./actions";

export function PostSabbaticalForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [compensation, setCompensation] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const res = await postSabbaticalListing({
      title,
      description,
      domain: domain || null,
      duration: duration || null,
      location: location || null,
      compensation: compensation || null,
    });
    setSubmitting(false);
    if (res.ok) {
      setMessage({ type: "ok", text: "Sabbatical opportunity posted." });
      setTitle("");
      setDescription("");
      setDomain("");
      setDuration("");
      setLocation("");
      setCompensation("");
      setOpen(false);
    } else {
      setMessage({ type: "err", text: res.error || "Failed to post." });
    }
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Post Sabbatical Opportunity
        </button>
      ) : (
        <form onSubmit={submit} className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Post Faculty Sabbatical / Immersion</h3>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100" aria-label="Close">
              <span className="text-lg">✕</span>
            </button>
          </div>

          <label className="mt-4 block text-sm font-medium text-gray-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. GenAI Research Engineering Immersion"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          />

          <label className="mt-4 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the immersion, deliverables, and what faculty will experience."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            rows={4}
            required
          />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Domain</label>
              <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. Generative AI" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 8 weeks (Jun-Aug)" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bengaluru (Hybrid)" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Compensation</label>
              <input value={compensation} onChange={(e) => setCompensation(e.target.value)} placeholder="e.g. Stipend + accommodation" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>

          {message && (
            <p className={`mt-4 rounded-md px-3 py-2 text-sm ${message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message.text}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Post Opportunity"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
