"use client";

import { useActionState } from "react";
import { signOffProof } from "./actions";

export default function SignOffControls({
  proofId,
  facultySignOff,
  industrySignOff,
  role,
}: {
  proofId: string;
  facultySignOff: string;
  industrySignOff: string;
  role: string;
}) {
  const [state, formAction, pending] = useActionState(signOffProof, null);

  const isFaculty = role === "FACULTY";
  const isIndustry = role === "INDUSTRY";
  const canSign = (isFaculty && facultySignOff === "PENDING") || (isIndustry && industrySignOff === "PENDING");

  if (!canSign) return null;

  return (
    <div className="mt-4 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 p-4">
      <p className="text-xs font-semibold text-indigo-700 mb-3">Sign-off Action</p>
      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="proofId" value={proofId} />
        {isFaculty && (
          <>
            <button type="submit" name="action" value="faculty_sign" disabled={pending} className="rounded-md bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60">
              {pending ? "Signing..." : "Approve (Faculty)"}
            </button>
            <button type="submit" name="action" value="faculty_reject" disabled={pending} className="rounded-md bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-60">
              Reject
            </button>
          </>
        )}
        {isIndustry && (
          <>
            <button type="submit" name="action" value="industry_sign" disabled={pending} className="rounded-md bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60">
              {pending ? "Signing..." : "Approve (Industry)"}
            </button>
            <button type="submit" name="action" value="industry_reject" disabled={pending} className="rounded-md bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-60">
              Reject
            </button>
          </>
        )}
      </form>
      {state?.error && <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>}
      {state?.success && <p className="mt-2 rounded-md bg-green-50 px-3 py-2 text-xs text-green-600">Sign-off recorded!</p>}
    </div>
  );
}

export function VerifiedBadge({
  publicToken,
  facultySignOff,
  industrySignOff,
  qrDataUrl,
}: {
  publicToken: string | null;
  facultySignOff: string;
  industrySignOff: string;
  qrDataUrl?: string;
}) {
  if (!publicToken) return null;
  const isDualAttested = facultySignOff === "APPROVED" && industrySignOff === "APPROVED";

  return (
    <div className="mt-4 rounded-lg border bg-gray-50 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">
            {isDualAttested ? "Dual-Attested Verified Badge" : "Partially Attested Badge"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Public ID: {publicToken}</p>
          <a href={`/verify/${publicToken}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-medium text-indigo-600 hover:underline">
            Open public verification page ↗
          </a>
        </div>
      </div>
      {qrDataUrl && (
        <div className="mt-4 flex items-center gap-3">
          <img src={qrDataUrl} alt="Verified badge QR code" width={96} height={96} className="rounded border border-gray-200 bg-white" />
          <p className="text-xs text-gray-500">
            Scan to verify this proof-of-work. The QR encodes the public verification URL.
          </p>
        </div>
      )}
    </div>
  );
}
