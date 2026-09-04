"use client";

import { useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { Loader2, RefreshCw, Sparkles, GitBranch, Code2, CheckCircle2 } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface SyncedSkill {
  skillName: string;
  score: number;
}

export function SyncClient({
  existingSkills,
}: {
  existingSkills: SyncedSkill[];
}) {
  const [ghUser, setGhUser] = useState("");
  const [ghLoading, setGhLoading] = useState(false);
  const [ghSkills, setGhSkills] = useState<SyncedSkill[]>(existingSkills);
  const [ghMsg, setGhMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

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
      setGhMsg({
        text: `Successfully synced ${data.syncedCount} programming skills from GitHub into your profile!`,
        type: "success",
      });
    } catch (err: any) {
      setGhMsg({
        text: err.message || "Could not sync GitHub profile.",
        type: "error",
      });
    } finally {
      setGhLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* GitHub Sync Card */}
      <Card className="flex flex-col p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md dark:bg-slate-800">
              <GithubIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Sync GitHub Repositories
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Analyzes repository languages, commit volume, and code footprint to compute real verified skills.
              </p>
            </div>
          </div>
          <Badge tone="indigo" className="self-start gap-1 text-xs sm:self-auto">
            <Code2 className="size-3.5" />
            Automatic Code Analysis
          </Badge>
        </div>

        <form onSubmit={handleSyncGitHub} className="mt-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              GitHub Username or Organization
            </label>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. torvalds, gaearon, or your-username"
                  value={ghUser}
                  onChange={(e) => setGhUser(e.target.value)}
                  className="w-full rounded-xl border border-border-muted bg-surface px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 dark:text-slate-100"
                />
              </div>
              <Button
                type="submit"
                disabled={ghLoading || !ghUser.trim()}
                className="gap-2 px-6"
              >
                {ghLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                <span>{ghLoading ? "Analyzing Repositories..." : "Sync Profile"}</span>
              </Button>
            </div>
          </div>
        </form>

        {ghMsg && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium ${
              ghMsg.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            {ghMsg.type === "success" && <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />}
            <span>{ghMsg.text}</span>
          </div>
        )}

        <div className="mt-8 border-t border-border-muted pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Verified Skills ({ghSkills.length})
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Integrated with Skill Radar & Diagnostics
            </span>
          </div>

          {ghSkills.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border-muted p-8 text-center">
              <GitBranch className="mx-auto size-8 text-slate-400" />
              <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                No synced skills yet. Enter your GitHub username above to sync your repositories.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2.5">
              {ghSkills.map((s) => (
                <Badge
                  key={s.skillName}
                  tone="indigo"
                  className="gap-1.5 px-3 py-1.5 text-xs font-medium shadow-xs"
                >
                  <Sparkles className="size-3 text-indigo-500" />
                  <span>{s.skillName}</span>
                  <span className="rounded-full bg-indigo-200/80 px-2 py-0.5 text-[10px] font-bold text-indigo-900 dark:bg-indigo-800 dark:text-indigo-100">
                    {s.score}%
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
