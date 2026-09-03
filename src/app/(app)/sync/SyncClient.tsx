"use client";

import { useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { CheckCircle2, GraduationCap, Loader2, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface SyncedSkill {
  skillName: string;
  score: number;
}

interface EKYCResult {
  apaarId: string;
  name: string;
  ncrfLevel: string;
  accumulatedCredits: number;
  abcAccountId: string;
  verifiedAt: string;
}

export function SyncClient({
  existingSkills,
  apaarVerified,
}: {
  existingSkills: SyncedSkill[];
  apaarVerified: boolean;
}) {
  // GitHub state
  const [ghUser, setGhUser] = useState("");
  const [ghLoading, setGhLoading] = useState(false);
  const [ghSkills, setGhSkills] = useState<SyncedSkill[]>(existingSkills);
  const [ghMsg, setGhMsg] = useState<string | null>(null);

  // APAAR state
  const [apaarInput, setApaarInput] = useState("");
  const [consent, setConsent] = useState(true);
  const [dpiLoading, setDpiLoading] = useState(false);
  const [ekyc, setEkyc] = useState<EKYCResult | null>(null);
  const [dpiMsg, setDpiMsg] = useState<string | null>(null);

  async function handleSyncGitHub(e: React.FormEvent) {
    e.preventDefault();
    if (!ghUser.trim()) return;
    setGhLoading(true);
    setGhMsg(null);

    try {
      const res = await fetch("/api/student/sync/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ghUser }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "GitHub sync failed");

      setGhSkills(data.skills || []);
      setGhMsg(`Successfully synced ${data.syncedCount} programming skills into your live profile!`);
    } catch (err: any) {
      setGhMsg(err.message || "Could not sync GitHub profile.");
    } finally {
      setGhLoading(false);
    }
  }

  async function handleVerifyDpi(e: React.FormEvent) {
    e.preventDefault();
    if (!apaarInput.trim()) return;
    setDpiLoading(true);
    setDpiMsg(null);

    try {
      const res = await fetch("/api/auth/verify-dpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apaarId: apaarInput, consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "e-KYC verification failed");

      setEkyc(data.data);
      setDpiMsg("National e-KYC verified & mapped to National Credit Framework (NCrF)!");
    } catch (err: any) {
      setDpiMsg(err.message || "Could not verify APAAR ID.");
    } finally {
      setDpiLoading(false);
    }
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. GitHub Code & Skill Sync */}
      <Card className="flex flex-col p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-800">
            <GithubIcon className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sync GitHub Repositories</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Parses language frequency & commit footprint into verified skills.
            </p>
          </div>
        </div>

        <form onSubmit={handleSyncGitHub} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              GitHub Username
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. torvalds, gaearon"
                value={ghUser}
                onChange={(e) => setGhUser(e.target.value)}
                className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 dark:text-slate-100"
              />
              <Button type="submit" disabled={ghLoading || !ghUser.trim()} className="shrink-0 gap-1.5">
                {ghLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                Sync
              </Button>
            </div>
          </div>
        </form>

        {ghMsg && (
          <p className="mt-3 rounded-xl bg-indigo-50/80 p-3 text-xs font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            {ghMsg}
          </p>
        )}

        <div className="mt-6 border-t border-border-muted pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Live Verified Skills ({ghSkills.length})
          </h3>
          {ghSkills.length === 0 ? (
            <p className="mt-2 text-xs text-slate-400">No synced skills yet. Sync your GitHub account above.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {ghSkills.map((s) => (
                <Badge key={s.skillName} tone="indigo" className="gap-1.5 py-1 text-xs">
                  <Sparkles className="size-3 text-indigo-500" />
                  {s.skillName}
                  <span className="rounded-full bg-indigo-200/80 px-1.5 py-0.2 text-[10px] font-bold text-indigo-900 dark:bg-indigo-800 dark:text-indigo-100">
                    {s.score}%
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 2. National DPI / APAAR ID e-KYC */}
      <Card className="flex flex-col p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">APAAR / DigiLocker e-KYC</h2>
              {(apaarVerified || ekyc) && (
                <Badge tone="green" className="gap-1 text-[10px]">
                  <CheckCircle2 className="size-3" /> Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              National Credit Framework (NCrF) & Academic Bank of Credits (ABC).
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyDpi} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              12-Digit APAAR ID (One Nation One Student ID)
            </label>
            <input
              type="text"
              maxLength={14}
              placeholder="e.g. 1234-5678-9012"
              value={apaarInput}
              onChange={(e) => setApaarInput(e.target.value)}
              className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 font-mono text-sm tracking-widest text-slate-900 outline-none transition focus:border-amber-500 dark:text-slate-100"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded border-border-muted text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              I authorize Skill Bridge to retrieve my verified academic credit ledger via DigiLocker DPI Gateway under NEP 2020.
            </span>
          </label>

          <Button
            type="submit"
            disabled={dpiLoading || !apaarInput.trim() || !consent}
            className="w-full gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            {dpiLoading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            Verify with DigiLocker Gateway
          </Button>
        </form>

        {dpiMsg && (
          <p className="mt-3 rounded-xl bg-emerald-50/80 p-3 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {dpiMsg}
          </p>
        )}

        {ekyc && (
          <div className="mt-5 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Beneficiary:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{ekyc.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">NCrF Qualification:</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">{ekyc.ncrfLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Accumulated Credits:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{ekyc.accumulatedCredits} Academic Credits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">ABC Account ID:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{ekyc.abcAccountId}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
