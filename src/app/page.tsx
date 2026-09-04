import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Quote,
  Radar,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import LandingNav from "@/components/LandingNav";
import Reveal from "@/components/Reveal";
import ThreedVisual from "@/components/ThreedVisual";

const ROLES: { title: string; desc: string; icon: LucideIcon; badge: string }[] = [
  {
    title: "Students",
    desc: "Build verifiable proof of work, earn skill tokens, and get discovered by mentors and top recruiters.",
    icon: GraduationCap,
    badge: "Portfolio & PRI Score",
  },
  {
    title: "Faculty",
    desc: "Review capstone projects, validate skill milestones, and align curriculum with market requirements.",
    icon: FlaskConical,
    badge: "Dual Sign-offs",
  },
  {
    title: "Industry",
    desc: "Pitch roles directly, mentor high-potential talent, post challenges, and vet pre-screened student submissions.",
    icon: Building2,
    badge: "Direct Hiring",
  },
  {
    title: "TPO",
    desc: "Coordinate placements, partner relations, and track real-time analytics from skill heatmaps to signed offers.",
    icon: Briefcase,
    badge: "Analytics & Tracking",
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string; tag: string }[] = [
  {
    icon: Award,
    title: "Verifiable Proof of Work",
    desc: "Every project artifact carries a dual cryptographic sign-off from faculty and industry mentors with an instant verification QR badge.",
    tag: "Integrity First",
  },
  {
    icon: Radar,
    title: "Skill Radar & Decay Engine",
    desc: "Badges track real-time freshness. Decay algorithms flag fading competencies and recommend targeted refresh sprints.",
    tag: "Dynamic Recertification",
  },
  {
    icon: Sparkles,
    title: "Industry Challenge Marketplace",
    desc: "Real-world engineering challenges, micro-consultancy gigs, and R&D sprints posted directly by corporate sponsors.",
    tag: "Hands-on Sprints",
  },
  {
    icon: TrendingUp,
    title: "PRI-Powered Reverse Placement",
    desc: "Our Placement Readiness Index (PRI) algorithm ranks students objectively on real code commits, eliminating resume spam.",
    tag: "Smart Matching",
  },
];

const METRICS = [
  { stat: "94%", label: "Placement Rate", desc: "For students with dual-verified proof of work" },
  { stat: "4,800+", label: "Verified Credentials", desc: "Cryptographically authenticated badges issued" },
  { stat: "120+", label: "Industry Partners", desc: "Actively sponsoring challenges and reviewing code" },
  { stat: "15+", label: "University Research Labs", desc: "Collaborating across higher-ed institutions" },
];

const STEPS = [
  {
    step: "01",
    title: "Build & Solve",
    desc: "Enroll in lab units, pick live industry challenges, and push actual code repositories instead of theoretical exams.",
  },
  {
    step: "02",
    title: "Dual Verification",
    desc: "Academic faculty audit theoretical rigor while industry leaders review production code quality and architecture.",
  },
  {
    step: "03",
    title: "Reverse Placement",
    desc: "Climb the PRI leaderboard. Recruiters filter talent by demonstrable proof-of-work and pitch roles directly to you.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "SkillBridge flipped our hiring workflow. Instead of sifting through hundreds of repetitive resumes, we filter by verified PRI and inspect real pull requests signed off by professors.",
    author: "Elena Rostova",
    role: "Engineering Director",
    company: "CloudScale Systems",
    rating: 5,
  },
  {
    quote:
      "Having dual sign-offs made my interview process effortless. Recruiters already knew my code was vetted by both my professor and an active industry architect.",
    author: "Rohan Kulkarni",
    role: "Full Stack Engineer (2025 Grad)",
    company: "Placed at Stripe",
    rating: 5,
  },
  {
    quote:
      "The skill decay model ensures our syllabus remains synchronized with current cloud and AI requirements rather than outdated textbooks.",
    author: "Dr. Arvind Saraf",
    role: "Head of Computer Science",
    company: "Apex Institute of Tech",
    rating: 5,
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-indigo-500/20">
      {/* Ambient glowing gradients */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[880px]">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/90 via-surface/80 to-background dark:from-indigo-950/30 dark:via-[#090d16]/80 dark:to-[#090d16]" />
        <div className="absolute -top-40 left-1/2 h-[560px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-400/25 to-violet-400/25 blur-[140px] dark:from-indigo-600/20 dark:to-purple-600/20" />
        <div className="absolute right-[-160px] top-32 h-[420px] w-[500px] rounded-full bg-violet-300/20 blur-[130px] dark:bg-violet-600/15" />
        <div className="absolute left-[-160px] top-80 h-[380px] w-[460px] rounded-full bg-sky-300/15 blur-[130px] dark:bg-sky-600/10" />
      </div>

      {/* 3D Visual background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="pointer-events-auto absolute left-1/2 top-[32rem] -translate-x-1/2 -translate-y-1/2 opacity-75 sm:top-[28rem]">
          <ThreedVisual />
        </div>
      </div>

      <LandingNav user={user} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-32 sm:px-6">
        {/* Hero Section */}
        <section className="animate-fade-up pt-16 text-center sm:pt-28">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/80 bg-surface/85 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md dark:border-indigo-800/80 dark:bg-surface/85 dark:text-slate-200">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <Sparkles aria-hidden className="size-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Over 1,200+ micro-credentials verified this semester</span>
          </div>

          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-7xl lg:text-8xl">
            Academia. Industry.
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300">
              Real Impact.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
            The next-generation platform uniting students, faculty, and enterprise partners — transforming coursework
            into cryptographically verified proof-of-work and merit-based career placement.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              href="/signup"
              className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-600/40 active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Get Started Free
              <ArrowRight
                aria-hidden
                className="size-4.5 transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border-muted bg-surface/80 px-7 text-base font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-indigo-400 hover:bg-surface hover:text-slate-900 active:scale-[0.98] dark:border-border-muted dark:bg-surface/70 dark:text-slate-200 dark:hover:border-indigo-500/60 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            >
              Explore Demo Experience
            </Link>
          </div>

          {/* Proof Badge Preview Card */}
          <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-indigo-200/80 bg-surface/90 p-5 shadow-xl shadow-indigo-500/5 backdrop-blur-md dark:border-indigo-900/60 dark:bg-surface/90">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-muted pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <ShieldCheck className="size-4" />
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Sample Dual-Verified Credential
                </span>
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                PRI Score: 96/100
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-left text-xs text-slate-600 dark:text-slate-400">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Distributed Microservices Architecture</p>
                <p className="mt-0.5">Grade: A+ • Verified by Prof. K. Sharma & CloudScale Architect</p>
              </div>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="size-4" /> Authentic
              </span>
            </div>
          </div>
        </section>

        {/* Quantifiable Social Proof Metrics */}
        <section className="mt-28 sm:mt-36">
          <Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {METRICS.map((m) => (
                <div
                  key={m.label}
                  className="group rounded-2xl border border-border-muted bg-surface/85 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-border-muted dark:bg-surface/85 dark:hover:border-indigo-600/60"
                >
                  <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                      {m.stat}
                    </span>
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{m.label}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Features Section */}
        <section id="features" className="mt-32 sm:mt-40">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                <Sparkles className="size-3.5" /> Platform Capabilities
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Everything Connected with Rigor & Speed
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
                Engineered to replace outdated academic silos with verifiable industry collaboration.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="group relative rounded-3xl border border-border-muted bg-surface/80 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-border-muted dark:bg-surface/85 dark:hover:border-indigo-600/60">
                  <div className="flex items-center justify-between">
                    <div className="flex size-13 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/15 dark:text-indigo-400">
                      <f.icon aria-hidden className="size-6" />
                    </div>
                    <span className="rounded-full border border-indigo-100 bg-indigo-50/60 px-3 py-1 text-xs font-semibold text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-500/10 dark:text-indigo-300">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mt-32 sm:mt-40">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                <TrendingUp className="size-3.5" /> Proven Methodology
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Three Steps to Your Career Bridge
              </h2>
            </div>
          </Reveal>

          <Reveal className="mx-auto mt-14 max-w-4xl space-y-4">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="group flex flex-col gap-4 rounded-2xl border border-border-muted bg-surface/75 p-7 backdrop-blur-md transition-all duration-200 hover:border-indigo-400 hover:shadow-md dark:border-border-muted dark:bg-surface/75 dark:hover:border-indigo-600/60 sm:flex-row sm:items-center sm:gap-8"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base font-bold text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/15 dark:text-indigo-400">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </section>

        {/* Testimonials / Social Proof Section */}
        <section id="testimonials" className="mt-32 sm:mt-40">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                <Quote className="size-3.5" /> Verified Endorsements
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Endorsed by Industry & Academia
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.author} delay={i * 100}>
                <div className="flex h-full flex-col justify-between rounded-3xl border border-border-muted bg-surface/80 p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg dark:border-border-muted dark:bg-surface/80 dark:hover:border-indigo-600/60">
                  <div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(t.rating)].map((_, idx) => (
                        <Star key={idx} className="size-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                  <div className="mt-6 border-t border-border-muted pt-4">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t.author}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{t.role}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.company}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" className="mt-32 sm:mt-40">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-subtle px-3.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-border-muted">
                <Users className="size-3.5" /> Tailored Ecosystem
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Built for Every Stakeholder
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((role, i) => (
              <Reveal key={role.title} delay={i * 80}>
                <div className="group flex h-full flex-col justify-between rounded-3xl border border-border-muted bg-surface/80 p-6 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400 hover:shadow-lg dark:border-border-muted dark:bg-surface/80 dark:hover:border-indigo-600/60">
                  <div>
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-surface-subtle text-slate-700 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/30 dark:text-slate-300">
                      <role.icon aria-hidden className="size-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{role.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{role.desc}</p>
                  </div>
                  <div className="mt-6">
                    <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                      {role.badge}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* High-Impact CTA */}
        <Reveal className="mt-32 sm:mt-40">
          <section className="relative overflow-hidden rounded-[2.5rem] px-6 py-20 text-center sm:px-12 sm:py-24 shadow-2xl shadow-indigo-600/20">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800" />
            <div
              aria-hidden
              className="absolute -top-24 left-1/2 h-64 w-[540px] -translate-x-1/2 rounded-full bg-white/15 blur-[90px]"
            />
            <div
              aria-hidden
              className="absolute -bottom-24 -right-16 h-56 w-72 rounded-full bg-violet-400/30 blur-[90px]"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-indigo-100 backdrop-blur-md">
                <Sparkles className="size-3.5" /> Start Your Proof-of-Work Journey
              </span>
              <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                Ready to Bridge the Gap?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-indigo-100 sm:text-lg">
                Join forward-thinking universities, ambitious students, and enterprise recruiters modernizing technical
                education.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-base font-bold text-indigo-700 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-50 active:scale-[0.98]"
                >
                  Create Your Account <ArrowRight aria-hidden className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-1.5 text-base font-medium text-white/90 transition-colors hover:text-white"
                >
                  Already have an account? Sign in
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </main>

      <footer className="relative z-10 mt-24 border-t border-slate-200/80 bg-white/70 py-10 text-center text-xs text-slate-500 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Skill Bridge — Academia-Industry Collaboration Platform.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Terms
            </Link>
            <Link href="/verify" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Public Credential Verification
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
