import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
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
import LandingNav from "@/components/LandingNav";
import Reveal from "@/components/Reveal";
import ThreedVisual from "@/components/ThreedVisual";

const ROLES: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: "Students", desc: "Build proof of work, earn skill tokens, and get discovered by mentors and recruiters.", icon: GraduationCap },
  { title: "Faculty", desc: "Review capstone projects, assess skills, and keep syllabi aligned with breaking trends.", icon: FlaskConical },
  { title: "Industry", desc: "Pitch roles, host mentorships, post challenges, and sign off on real student work.", icon: Building2 },
  { title: "TPO", desc: "Manage placements, partners, and analytics — from skill heatmaps to signed offers.", icon: Briefcase },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Award, title: "Verifiable proof of work", desc: "Every contribution carries a dual faculty + industry sign-off and a public verification badge." },
  { icon: Radar, title: "Skill radar & decay", desc: "Track badge freshness, spot decaying skills, and re-certify to stay ready for hiring." },
  { icon: Sparkles, title: "Challenge marketplace", desc: "Capstones, R&D sprints, and micro-consultancy gigs posted directly by industry partners." },
  { icon: TrendingUp, title: "PRI-powered hiring", desc: "Reverse placement ranks students by job readiness so the right talent meets the right roles." },
];

const HIGHLIGHTS: { icon: LucideIcon; stat: string; label: string }[] = [
  { icon: BadgeCheck, stat: "Dual sign-off", label: "Every proof verified by faculty + industry" },
  { icon: TrendingUp, stat: "PRI ranking", label: "Job-readiness scores that take the guesswork out" },
  { icon: Sparkles, stat: "Live challenges", label: "Real problems posted straight from the industry" },
  { icon: Radar, stat: "Skill decay", label: "Stay ahead as your stack — and the market — evolves" },
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
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[820px]">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white to-white dark:from-indigo-950/30 dark:via-transparent dark:to-transparent" />
        <div className="absolute -top-44 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-indigo-300/30 blur-[140px] dark:bg-indigo-600/20" />
        <div className="absolute right-[-170px] top-28 h-[380px] w-[480px] rounded-full bg-violet-300/25 blur-[130px] dark:bg-violet-600/20" />
        <div className="absolute left-[-170px] top-72 h-[340px] w-[440px] rounded-full bg-sky-300/20 blur-[130px] dark:bg-sky-600/15" />
      </div>

      {/* 3D background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <div className="pointer-events-auto absolute left-1/2 top-[32rem] -translate-x-1/2 -translate-y-1/2 opacity-80 sm:top-[26rem]">
          <ThreedVisual />
        </div>
      </div>

      <LandingNav user={user} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-32 sm:px-6">
        {/* Hero */}
        <section className="animate-fade-up pt-20 text-center sm:pt-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
            <Sparkles aria-hidden className="size-3.5 text-indigo-500" />
            Reverse placement & skill decay engine
          </span>
          <h1 className="mx-auto mt-8 max-w-4xl text-[46px] font-semibold leading-[1.04] tracking-[-0.035em] text-slate-900 dark:text-white sm:text-8xl">
            Academia. Industry.
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Real impact.
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400 sm:text-xl">
            One connected place for students, faculty, industry partners, and placement officers —
            from verified skill badges to dual-graded offers.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              Get started <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              href="/login"
              className="group inline-flex items-center gap-1.5 text-base font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Explore the demo
              <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        {/* Role section */}
        <section className="mt-32 sm:mt-40">
          <Reveal>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">Who it&apos;s for</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Built around every role
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((role, i) => (
              <Reveal key={role.title} delay={i * 90}>
                <div className="group flex flex-col items-center text-center">
                  <div className="flex size-16 items-center justify-center rounded-3xl bg-slate-100/80 text-slate-700 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-600/30 dark:bg-slate-800 dark:text-slate-300">
                    <role.icon aria-hidden className="size-7" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{role.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">{role.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-32 sm:mt-40">
          <Reveal>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Three steps to get hired
              </h2>
            </div>
          </Reveal>
          <Reveal className="mx-auto mt-14 max-w-4xl">
            {STEPS.map((step) => (
              <div key={step.step} className="group flex flex-col gap-4 border-t border-slate-200 py-9 dark:border-slate-800 sm:flex-row sm:items-baseline sm:gap-10 last:border-b">
                <span className="text-sm font-semibold uppercase tracking-widest text-indigo-500 transition-colors group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{step.step}</span>
                <div className="sm:-ml-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </section>

        {/* Stats / highlights */}
        <section className="mt-32 sm:mt-40">
          <Reveal>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {HIGHLIGHTS.map((h) => (
                <div key={h.label} className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 backdrop-blur transition-colors duration-300 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700">
                  <h.icon aria-hidden className="size-6 text-indigo-500" />
                  <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{h.stat}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{h.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Features — soft tiles */}
        <section className="mt-32 sm:mt-40">
          <Reveal>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">Why Skill Bridge</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Everything you need, beautifully connected
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="group rounded-[2rem] border border-slate-200/70 bg-white/70 p-8 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/15 dark:text-indigo-400">
                    <f.icon aria-hidden className="size-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Reveal className="mt-32 sm:mt-40">
          <section className="relative overflow-hidden rounded-[3rem] px-6 py-24 text-center sm:px-12 sm:py-28">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700" />
            <div aria-hidden className="absolute -top-28 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-white/15 blur-[100px]" />
            <div aria-hidden className="absolute -bottom-32 -right-20 h-64 w-80 rounded-full bg-violet-400/30 blur-[100px]" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                Ready to bridge the gap?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-indigo-100 sm:text-xl">
                Join students, faculty, and industry partners already collaborating on real problems.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 active:scale-[0.98]"
                >
                  Create your account <ArrowRight aria-hidden className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-1.5 text-base font-medium text-white/90 transition-colors hover:text-white"
                >
                  Sign in
                  <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </main>

      <footer className="relative z-10 mt-24 border-t border-slate-200/70 bg-white/60 py-10 text-center text-sm text-slate-400 backdrop-blur dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-500">
        © {new Date().getFullYear()} Skill Bridge — Academia-Industry Collaboration Portal
      </footer>
    </div>
  );
}
