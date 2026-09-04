import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  Database,
  FileCheck,
  GraduationCap,
  Layers,
  Lock,
  Quote,
  Radar,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import LandingNav from "@/components/LandingNav";
import Reveal from "@/components/Reveal";

const TICKER_ITEMS = [
  { label: "skill_gap(SQL) → 5 departments", highlight: true },
  { label: "2,140 profiles assessed", highlight: false },
  { label: "match_rate ↑ 63%", highlight: true },
  { label: "faculty_internships: open", highlight: false },
  { label: "new: 318 industry partners", highlight: true },
  { label: "verified_certs = true", highlight: false },
  { label: "placement_cycle: live", highlight: true },
];

const PORTALS = [
  {
    role: "STUDENT",
    kicker: "// STUDENTS",
    title: "Know your gaps before recruiters do.",
    tone: "border-indigo-500/30 hover:border-indigo-500/70 bg-gradient-to-b from-indigo-500/[0.04] to-surface",
    kickerColor: "text-indigo-600 dark:text-indigo-400",
    dotColor: "bg-indigo-500",
    btnTone: "border-indigo-500/40 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300",
    bullets: [
      "Skill assessment: self-rating calibrated by aptitude tests",
      "Gap analysis against live industry demand",
      "Match-ranked internships & placements, one-click apply",
      "Application tracker and verified digital portfolio",
    ],
    href: "/signup?role=STUDENT",
    cta: "Enter as student →",
  },
  {
    role: "ACADEMICIAN",
    kicker: "// ACADEMICIANS",
    title: "Teach what the industry practices.",
    tone: "border-purple-500/30 hover:border-purple-500/70 bg-gradient-to-b from-purple-500/[0.04] to-surface",
    kickerColor: "text-purple-600 dark:text-purple-400",
    dotColor: "bg-purple-500",
    btnTone: "border-purple-500/40 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300",
    bullets: [
      "Academician immersions and industrial training",
      "FDP directory, filterable and AICTE-recognised",
      "Consultancy briefs and collaborative research",
      "Mentorship and guest-lecture exchange",
    ],
    href: "/signup?role=ACADEMICIAN",
    cta: "Enter as academician →",
  },
  {
    role: "INDUSTRIES",
    kicker: "// INDUSTRIES",
    title: "Hire on skills, not just resumes.",
    tone: "border-amber-500/30 hover:border-amber-500/70 bg-gradient-to-b from-amber-500/[0.04] to-surface",
    kickerColor: "text-amber-500 dark:text-amber-400",
    dotColor: "bg-amber-500",
    btnTone: "border-amber-500/40 hover:bg-amber-600 hover:text-white text-amber-700 dark:text-amber-300",
    bullets: [
      "Post openings specified by skill and level",
      "Auto-ranked shortlists by verified compatibility",
      "Publish training programs and mentorship cohorts",
      "Pipeline management: shortlist → offer, tracked live",
    ],
    href: "/signup?role=INDUSTRIES",
    cta: "Enter as industry →",
  },
  {
    role: "INSTITUTIONS",
    kicker: "// INSTITUTIONS",
    title: "Drive outcomes across all cohorts.",
    tone: "border-emerald-500/30 hover:border-emerald-500/70 bg-gradient-to-b from-emerald-500/[0.04] to-surface",
    kickerColor: "text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
    btnTone: "border-emerald-500/40 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-300",
    bullets: [
      "Skill deficit heatmap across all departments",
      "Placement records and verified hiring telemetry",
      "AI-assisted syllabus gap analysis and curriculum patches",
      "Accreditation-ready audit records and exports",
    ],
    href: "/signup?role=INSTITUTIONS",
    cta: "Enter as institution →",
  },
];

const LIFECYCLE_PHASES = [
  {
    num: "01",
    title: "Skill development",
    desc: "Assessment → profile → gap analysis → personalized learning, certifications, and career guidance built on industry demand.",
    tag: "Assessment & Upskilling",
  },
  {
    num: "02",
    title: "Internship",
    desc: "Skill-matched recommendations, application tracking, mentor feedback, and verified completion records — for students and faculty alike.",
    tag: "Real-World Experience",
  },
  {
    num: "03",
    title: "Placement",
    desc: "Compatibility-based shortlisting, recruitment management, and analytics on outcomes and skill-demand trends.",
    tag: "Outcome & Hires",
  },
];


const INSTITUTION_CAPSULES = [
  { label: "Role-based access control", icon: Lock },
  { label: "Encrypted document vault — resumes, certificates, reports", icon: ShieldCheck },
  { label: "LMS & certification-provider integrations", icon: Layers },
  { label: "Institutional database sync", icon: Database },
  { label: "Accreditation-ready exports", icon: FileCheck },
  { label: "Skill-demand trend analytics", icon: BarChart3 },
];

const PLATFORM_FEATURES: { icon: LucideIcon; title: string; desc: string; tag: string }[] = [
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
      {/* Ambient background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1080px]">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/70 via-surface/60 to-background dark:from-indigo-950/20 dark:via-[#090d16]/70 dark:to-[#090d16]" />
        <div className="absolute -top-40 left-1/4 h-[560px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-400/20 to-violet-400/20 blur-[150px] dark:from-indigo-600/15 dark:to-purple-600/15" />
        <div className="absolute -top-40 right-1/4 h-[560px] w-[700px] translate-x-1/2 rounded-full bg-gradient-to-tl from-amber-400/15 to-orange-400/15 blur-[150px] dark:from-amber-600/10 dark:to-orange-600/10" />
      </div>

      <LandingNav user={user} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-32 sm:px-6">
        {/* ================================================================
            HERO: ACADEMIA VS INDUSTRY SPLIT SCREEN
        ================================================================ */}
        <section className="relative isolate pt-10 pb-12 md:pt-16 md:pb-20">
          {/* Top Status Capsule */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/80 bg-surface/85 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md dark:border-indigo-800/80 dark:bg-surface/85 dark:text-slate-200">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <Sparkles aria-hidden className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Four doors, One platform</span>
            </div>
          </div>

          {/* Split Screen Grid */}
          <div className="relative mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 items-center">
            {/* Center Seam Divider (Desktop) */}
            <div
              aria-hidden
              className="hidden md:block pointer-events-none absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-indigo-500/20 via-border-muted to-amber-500/20"
            />

            {/* Left Column: Academia */}
            <div className="relative flex flex-col justify-center overflow-hidden rounded-3xl border border-indigo-200/60 bg-surface/75 p-8 sm:p-10 backdrop-blur-md dark:border-indigo-900/40 dark:bg-surface/75 md:text-right md:items-end group transition-all duration-300 hover:border-indigo-400/80">
              {/* Watermark Ghost */}
              <div
                aria-hidden
                className="pointer-events-none absolute right-4 bottom-2 text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-indigo-900/[0.04] dark:text-indigo-200/[0.03] select-none"
              >
                CAMPUS
              </div>

              <span className="font-mono text-xs sm:text-sm font-semibold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                // ACADEMIA
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl sm:leading-[1.12]">
                You learn.
                <br />
                You build.
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                  You&apos;re ready —
                </span>
              </h1>

              <p className="mt-4 max-w-sm text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Students with skills and no map. Academicians with deep knowledge and no live window into current industry
                practice.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 justify-start md:justify-end">
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  Skill Calibration
                </span>
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  Faculty Internships
                </span>
              </div>
            </div>

            {/* Right Column: Industry */}
            <div className="relative flex flex-col justify-center overflow-hidden rounded-3xl border border-amber-200/60 bg-surface/75 p-8 sm:p-10 backdrop-blur-md dark:border-amber-900/40 dark:bg-surface/75 md:text-left md:items-start group transition-all duration-300 hover:border-amber-400/80">
              {/* Watermark Ghost */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-4 bottom-2 text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-amber-900/[0.04] dark:text-amber-200/[0.03] select-none"
              >
                CAREER
              </div>

              <span className="font-mono text-xs sm:text-sm font-semibold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                INDUSTRY //
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl sm:leading-[1.12]">
                They hire.
                <br />
                They train.
                <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
                  They&apos;re searching.
                </span>
              </h1>

              <p className="mt-4 max-w-sm text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Companies with high-impact openings and no reliable way to filter candidates who actually fit production
                standards.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 justify-start">
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                  Verified Shortlists
                </span>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                  Real Code Commits
                </span>
              </div>
            </div>
          </div>

          {/* Central Seam Connector CTA */}
          <div className="relative mx-auto mt-10 max-w-3xl text-center">
            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <Link
                href="/signup"
                className="group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-amber-600 px-8 text-base font-semibold text-white shadow-xl shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-indigo-600/35 active:translate-y-0 active:scale-[0.98]"
              >
                Get started — SkillBridge connects both sides
                <ArrowRight aria-hidden className="size-4.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-border-muted bg-surface/80 px-6 text-sm font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-surface hover:text-slate-900 dark:border-border-muted dark:bg-surface/70 dark:text-slate-200 dark:hover:text-white"
              >
                Explore Demo Experience
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================
            LIVE STATUS TICKER (MARQUEE)
        ================================================================ */}
        <section aria-hidden className="relative -mx-4 sm:-mx-6 border-y border-border-muted bg-surface-subtle/60 py-3 backdrop-blur-md overflow-hidden">
          <div className="animate-marquee flex items-center gap-8">
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-3 font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap pr-8 border-r border-border-muted"
              >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {item.label}
              </span>
            ))}
          </div>
        </section>

        {/* ================================================================
            SECTION 01: FOUR DOORS, ONE PLATFORM (ROLES)
        ================================================================ */}
        <section id="roles" className="mt-28 sm:mt-36">
          <Reveal>
            <div className="max-w-2xl">
              <span className="font-mono text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                01 / FOUR DOORS, ONE PLATFORM
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Pick your side of the bridge.
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400 sm:text-lg leading-relaxed">
                Role-based portals for students, academicians, industries, and institutions — each with an end-to-end workflow built
                specifically for them.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PORTALS.map((p, i) => (
              <Reveal key={p.role} delay={i * 100}>
                <div
                  className={`flex h-full flex-col justify-between rounded-3xl border p-7 sm:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${p.tone}`}
                >
                  <div>
                    <span className={`font-mono text-xs font-bold tracking-wider ${p.kickerColor}`}>
                      {p.kicker}
                    </span>

                    <h3 className="mt-3 text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      {p.title}
                    </h3>

                    <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {p.bullets.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${p.dotColor}`} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border-muted/60">
                    <Link
                      href={p.href}
                      className={`inline-flex h-10 w-full items-center justify-center rounded-xl border bg-surface/80 px-4 text-xs font-semibold transition-all shadow-xs ${p.btnTone}`}
                    >
                      {p.cta}
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ================================================================
            SECTION 02: FULL LIFECYCLE
        ================================================================ */}
        <section id="lifecycle" className="mt-32 sm:mt-40">
          <Reveal>
            <div className="max-w-2xl md:ml-auto md:text-right">
              <span className="font-mono text-xs font-semibold tracking-wider text-amber-500 dark:text-amber-400 uppercase">
                02 / FULL LIFECYCLE
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Not a job board with extras — the whole journey.
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400 sm:text-lg leading-relaxed">
                From initial assessment and continuous skill calibration to mentored internships and verified placements.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {LIFECYCLE_PHASES.map((phase, i) => (
              <Reveal key={phase.num} delay={i * 110}>
                <div className="relative overflow-hidden rounded-3xl border border-border-muted bg-surface/85 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400 hover:shadow-lg dark:border-border-muted dark:bg-surface/85 dark:hover:border-indigo-600/60">
                  {/* Glowing Top Seam Bar */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />

                  {/* Watermark Number */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-4 top-4 font-mono text-5xl font-black text-slate-900/[0.06] dark:text-white/[0.05] select-none"
                  >
                    {phase.num}
                  </span>

                  <span className="inline-block rounded-full bg-surface-subtle px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-border-muted">
                    {phase.tag}
                  </span>

                  <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                    {phase.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {phase.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ================================================================
            SECTION 03: INSTITUTIONS & POLICYMAKERS
        ================================================================ */}
        <section id="institutions" className="mt-32 sm:mt-40">
          <Reveal>
            <div className="rounded-[2.5rem] border border-border-muted bg-gradient-to-b from-indigo-500/[0.03] via-surface/90 to-surface p-8 sm:p-12 lg:p-14 backdrop-blur-md dark:border-border-muted dark:from-indigo-500/[0.05] dark:via-surface/90 dark:to-surface">
              <span className="font-mono text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                03 / INSTITUTIONS &amp; POLICYMAKERS
              </span>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                The whole bridge, visible from above.
              </h2>

              <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg leading-relaxed">
                Dashboards replace end-of-year spreadsheets with live, cohort-level insight into verified competencies,
                internships, and enterprise placements.
              </p>


              {/* Capability Capsules */}
              <div className="mt-8 flex flex-wrap gap-2.5">
                {INSTITUTION_CAPSULES.map((capsule) => (
                  <span
                    key={capsule.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border-muted bg-surface/90 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-xs"
                  >
                    <capsule.icon className="size-3.5 text-indigo-500" />
                    <span>{capsule.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ================================================================
            SECTION 04: PLATFORM CAPABILITIES
        ================================================================ */}
        <section id="capabilities" className="mt-32 sm:mt-40">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                <Sparkles className="size-3.5" /> Engine Capabilities
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Engineered with Rigor &amp; Speed
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
                Replacing theoretical silos with verifiable code proof and automated recruiters&apos; matching.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PLATFORM_FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="group relative rounded-3xl border border-border-muted bg-surface/80 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-border-muted dark:bg-surface/85 dark:hover:border-indigo-600/60">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/15 dark:text-indigo-400">
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

        {/* ================================================================
            SECTION 05: TESTIMONIALS
        ================================================================ */}
        <section id="testimonials" className="mt-32 sm:mt-40">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                <Quote className="size-3.5" /> Verified Endorsements
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Endorsed by Industry &amp; Academia
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
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

        {/* ================================================================
            HIGH-IMPACT CTA: READY TO CROSS?
        ================================================================ */}
        <Reveal className="mt-32 sm:mt-40">
          <section className="relative overflow-hidden rounded-[2.5rem] px-6 py-20 text-center sm:px-12 sm:py-24 shadow-2xl shadow-indigo-600/20">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-amber-600" />
            <div
              aria-hidden
              className="absolute -top-24 left-1/2 h-64 w-[540px] -translate-x-1/2 rounded-full bg-white/15 blur-[90px]"
            />
            <div
              aria-hidden
              className="absolute -bottom-24 -right-16 h-56 w-72 rounded-full bg-amber-400/30 blur-[90px]"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-indigo-100 backdrop-blur-md">
                <Sparkles className="size-3.5" /> Start Your Verified Journey
              </span>
              <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                Ready to cross?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-indigo-100 sm:text-lg">
                Create an account as a student, academician, industry, or institution — or explore instantly with a demo
                account.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-base font-bold text-indigo-700 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-50 active:scale-[0.98]"
                >
                  Get started <ArrowRight aria-hidden className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-1.5 text-base font-medium text-white/90 transition-colors hover:text-white"
                >
                  Explore demo experience
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

      {/* ================================================================
          FOOTER
      ================================================================ */}
      <footer className="relative z-10 mt-24 border-t border-border-muted bg-surface/80 py-12 text-slate-500 backdrop-blur-md dark:bg-slate-950/60 dark:text-slate-400">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
                  <GraduationCap aria-hidden className="size-4.5" />
                </span>
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">
                  Skill<span className="bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent">Bridge</span>
                </span>
              </div>
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                One secure, scalable platform for skill development, internships, and placements — connecting campus and
                career.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Platform</h4>
              <ul className="mt-3.5 space-y-2 text-xs">
                <li>
                  <Link href="/signup?role=STUDENT" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Skill assessment
                  </Link>
                </li>
                <li>
                  <Link href="/signup?role=STUDENT" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Opportunity board
                  </Link>
                </li>
                <li>
                  <a href="#lifecycle" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Lifecycle
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Portals</h4>
              <ul className="mt-3.5 space-y-2 text-xs">
                <li>
                  <Link href="/signup?role=STUDENT" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Students
                  </Link>
                </li>
                <li>
                  <Link href="/signup?role=ACADEMICIAN" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Academicians
                  </Link>
                </li>
                <li>
                  <Link href="/signup?role=INDUSTRIES" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Industries
                  </Link>
                </li>
                <li>
                  <Link href="/signup?role=INSTITUTIONS" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Institutions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Support</h4>
              <ul className="mt-3.5 space-y-2 text-xs">
                <li>
                  <Link href="/verify" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Public Verification
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Data &amp; Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border-muted pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <p>© {new Date().getFullYear()} SkillBridge · role-based access · encrypted storage · audit-logged</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" /> System Online
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
