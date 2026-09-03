import Link from "next/link";
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  FlaskConical,
  GraduationCap,
  Radar,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const ROLES: { title: string; desc: string; icon: LucideIcon; tone: string }[] = [
  { title: "Students", desc: "Build proof of work, earn skill tokens, and get discovered by mentors and recruiters.", icon: GraduationCap, tone: "text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/15" },
  { title: "Faculty", desc: "Review capstone projects, assess skills, and keep syllabi aligned with breaking trends.", icon: FlaskConical, tone: "text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/15" },
  { title: "Industry", desc: "Pitch roles, host mentorships, post challenges, and sign off on real student work.", icon: Building2, tone: "text-purple-600 bg-purple-50 dark:text-purple-300 dark:bg-purple-500/15" },
  { title: "TPO", desc: "Manage placements, partners, and analytics — from skill heatmaps to signed offers.", icon: Briefcase, tone: "text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/15" },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Award, title: "Verifiable proof of work", desc: "Every contribution carries a dual faculty + industry sign-off and a public verification badge." },
  { icon: Radar, title: "Skill radar & decay", desc: "Track badge freshness, spot decaying skills, and re-certify to stay ready for hiring." },
  { icon: Sparkles, title: "Challenge marketplace", desc: "Capstones, R&D sprints, and micro-consultancy gigs posted directly by industry partners." },
  { icon: TrendingUp, title: "PRI-powered hiring", desc: "Reverse placement ranks students by job readiness so the right talent meets the right roles." },
];

const STEPS = [
  { step: "01", title: "Connect & contribute", desc: "Join the ecosystem, join lab units, and take on live industry challenges." },
  { step: "02", title: "Get verified", desc: "Faculty and industry grade your work with dual sign-offs and skill assessments." },
  { step: "03", title: "Get hired", desc: "Rank high on the PRI leaderboard, receive pitches, and land placements." },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-[--background]">
      {/* Ambient gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-indigo-50 via-white to-white dark:from-indigo-950/40 dark:via-transparent dark:to-transparent" />
        <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-400/20 blur-[110px]" />
        <div className="absolute right-[-120px] top-40 h-[320px] w-[420px] rounded-full bg-violet-400/20 blur-[100px]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
            <GraduationCap aria-hidden className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Campus Bridge</span>
            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Academia × Industry</span>
          </span>
        </Link>
        {user ? (
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            Go to Dashboard <ArrowRight aria-hidden className="size-4" />
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-surface dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              Sign up
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <section className="pt-14 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Sparkles aria-hidden className="size-3.5" />
            Now live: Reverse placement & skill decay engine
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
            Where academia meets industry for{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
              real impact
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
            A unified portal for students, faculty, industry partners, and placement officers —
            from verified skill badges and capstone projects to dual-graded offers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              Get started <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center rounded-xl border border-slate-300 bg-white px-6 text-base font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-surface dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
            >
              Explore demo as guest
            </Link>
          </div>
        </section>

        {/* Role cards */}
        <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role) => (
            <div
              key={role.title}
              className="group relative overflow-hidden rounded-2xl border border-border-muted bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover dark:bg-surface"
            >
              <div className={`flex size-10 items-center justify-center rounded-xl ${role.tone}`}>
                <role.icon aria-hidden className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{role.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{role.desc}</p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section className="mt-20">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.step} className="relative rounded-2xl border border-border-muted bg-white p-6 shadow-card dark:bg-surface">
                <span className="text-3xl font-extrabold tracking-tight text-indigo-100 dark:text-indigo-500/40">{step.step}</span>
                <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-4 rounded-2xl border border-border-muted bg-white p-6 shadow-card dark:bg-surface">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <f.icon aria-hidden className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="relative mt-24 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-6 py-14 text-center shadow-xl shadow-indigo-600/20">
          <div aria-hidden className="bg-dot-grid absolute inset-0 opacity-20" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to bridge the gap?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-indigo-100">
              Join students, faculty, and industry partners already collaborating on real problems.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-base font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 active:scale-[0.98]"
              >
                Create your account <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-xl border border-white/20 bg-white/10 px-6 text-base font-semibold text-white transition-all hover:bg-white/20"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border-muted py-6 text-center text-sm text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} Campus Bridge — Academia-Industry Collaboration Portal
      </footer>
    </div>
  );
}