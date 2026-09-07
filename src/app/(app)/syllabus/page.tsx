import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SyllabusAudit } from "./SyllabusAudit";
import { BookOpen, Layers, ShieldCheck, TrendingDown, Clock, CheckCircle2 } from "lucide-react";

function obsolescenceColor(score: number): string {
  if (score < 0.25) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300";
  if (score < 0.45) return "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300";
  return "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300";
}

export default async function SyllabusPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const syllabi = await prisma.syllabus.findMany({
    orderBy: { obsolescenceScore: "desc" },
    take: 50,
  });

  const avgObsolescence =
    syllabi.length > 0
      ? Math.round((syllabi.reduce((acc, s) => acc + s.obsolescenceScore, 0) / syllabi.length) * 100)
      : 0;

  const totalReviews = syllabi.reduce((acc, s) => acc + s.reviewCount, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-surface via-surface to-indigo-50/40 p-6 shadow-card dark:border-indigo-950/60 dark:from-surface dark:via-surface dark:to-indigo-950/20 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-24 bottom-0 hidden size-40 rounded-full bg-emerald-500/10 blur-3xl sm:block" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/30">
              <BookOpen className="size-3.5" />
              AICTE × NEP 2020 Aligned
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
              <ShieldCheck className="size-3.5" />
              Autonomous Curriculum Patches
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Syllabus Obsolescence Engine
          </h1>
          <p className="mt-2 max-w-3xl text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Audit college curriculum modules against active enterprise software stacks, identify outdated textbook concepts (e.g. legacy SOAP, CORBA, 8085 assembly, Waterfall SDLC), and inject refreshed industry-approved patch modules without waiting for multi-year university board cycles.
          </p>

          {/* Quick Metrics Ticker */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-surface/80 p-3.5 backdrop-blur-xs dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tracked University Courses</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{syllabi.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-surface/80 p-3.5 backdrop-blur-xs dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Average Obsolescence Rate</p>
              <p className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">{avgObsolescence}%</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-surface/80 p-3.5 backdrop-blur-xs dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Patches & Reviews</p>
              <p className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">{totalReviews}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-surface/80 p-3.5 backdrop-blur-xs dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Curriculum Flexibility</p>
              <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">20% NEP Window</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Audit Component */}
      <SyllabusAudit
        userRole={user.role}
        initialSyllabi={syllabi.map((s) => ({
          ...s,
          lastReviewedAt: s.lastReviewedAt,
        }))}
      />

      {/* Tracked University Syllabi Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Tracked Academic Syllabi Catalog
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live curriculum records monitored across university departments.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {syllabi.length} Active Records
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border-muted bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-muted bg-surface-subtle font-semibold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3.5">Course Title</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Syllabus Modules</th>
                  <th className="px-5 py-3.5">Obsolescence Gap</th>
                  <th className="px-5 py-3.5">Reviews</th>
                  <th className="px-5 py-3.5">Last Audited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted text-slate-600 dark:text-slate-300">
                {syllabi.map((s) => {
                  let topics: string[] = [];
                  try {
                    topics = JSON.parse(s.topicsJson);
                  } catch {
                    topics = [];
                  }
                  return (
                    <tr
                      key={s.id}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/40"
                    >
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">
                        {s.title}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">
                        {s.department}
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <span className="line-clamp-2 text-[11px] text-slate-600 dark:text-slate-400">
                          {topics.join(" • ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${obsolescenceColor(
                            s.obsolescenceScore
                          )}`}
                        >
                          {Math.round(s.obsolescenceScore * 100)}%
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        {s.reviewCount} patches
                      </td>
                      <td className="px-5 py-4 text-[11px] text-slate-400">
                        {s.lastReviewedAt ? new Date(s.lastReviewedAt).toLocaleDateString() : "Pending"}
                      </td>
                    </tr>
                  );
                })}
                {syllabi.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                      No university syllabi tracked yet. Audit a course above to add it to the catalog.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
