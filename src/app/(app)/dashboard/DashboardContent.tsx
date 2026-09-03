import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { BadgeTone } from "@/components/ui";
import { Card, StatCard } from "@/components/ui";

export interface Stat {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: BadgeTone;
  sub?: string;
}

export interface QuickLink {
  label: string;
  href: string;
  icon: LucideIcon;
  desc: string;
}

export interface DashboardData {
  name: string;
  roleLabel: string;
  dateLabel: string;
  stats: Stat[];
  quickLinks: QuickLink[];
  roleGuide: { title: string; steps: string[] };
}

export function DashboardContent({
  name,
  roleLabel,
  dateLabel,
  stats,
  quickLinks,
  roleGuide,
}: DashboardData) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-2xl border border-border-muted bg-surface p-6 shadow-card sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-indigo-100/80 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-24 bottom-0 hidden size-40 rounded-full bg-violet-100/70 blur-3xl sm:block" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {roleLabel} workspace
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Welcome back, {name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{dateLabel} — here&apos;s what&apos;s happening on your skill bridge.</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 active:scale-[0.98]"
              >
                <link.icon aria-hidden className="size-4" />
                {link.label}
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            tone={stat.tone}
            sub={stat.sub}
            className="animate-fade-up"
          />
        ))}
      </section>

      {/* Role guide */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CheckCircle2 aria-hidden className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{roleGuide.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Things you can do from here, ranked by impact.</p>
            </div>
          </div>
          <ol className="mt-5 space-y-3">
            {roleGuide.steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6">
          <h2 className="text-sm font-semibold text-white">Pro tip</h2>
          <p className="mt-1 text-xs text-indigo-100">
            Keep your skill badges fresh. Recruiters shortlist from the reverse-placement
            leaderboard and stale skills rank lower.
          </p>
          <div className="mt-4 space-y-2">
            <div className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white">
              <span className="font-semibold">Active</span> badges — fully current
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white">
              <span className="font-semibold">Stale</span> badges — refresh via diagnostic
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white">
              <span className="font-semibold">Expired</span> badges — re-verify to restore
            </div>
          </div>
          <Link href="/skills" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline">
            Go to Skill Radar <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </Card>
      </section>
    </div>
  );
}