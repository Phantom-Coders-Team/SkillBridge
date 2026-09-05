"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
  Building2,
  Briefcase,
  School,
  BookOpen,
  MapPin,
  Globe,
  Award,
  Hash,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { signupAction } from "./actions";
import { cn } from "@/lib/cn";
import ThemeToggle from "@/components/ThemeToggle";
import { SkillBridgeLogo, SkillBridgeWordmark } from "@/components/SkillBridgeLogo";

const ROLE_OPTIONS = [
  {
    value: "STUDENT",
    label: "Student",
    badge: "Job Seeker",
    icon: GraduationCap,
    tone: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/40",
  },
  {
    value: "ACADEMICIAN",
    label: "Academician",
    badge: "Faculty / Researcher",
    icon: BookOpen,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/40",
  },
  {
    value: "INDUSTRY",
    label: "Industry",
    badge: "Recruiter / Partner",
    icon: Briefcase,
    tone: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-500/40",
  },
  {
    value: "INSTITUTION",
    label: "Institution",
    badge: "University / TPO",
    icon: School,
    tone: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/40",
  },
];

const ROLE_PITCHES: Record<
  string,
  {
    tag: string;
    heading: string;
    description: string;
    features: string[];
  }
> = {
  STUDENT: {
    tag: "For Students & Candidates",
    heading: "Start building your future with verified skills.",
    description:
      "Showcase proof of work, sync GitHub footprints, apply to vetted internships, and book 1:1 industry mentorship sessions.",
    features: [
      "1:1 Industry Mentorship & Live Code Clinics",
      "GitHub repository & programming language footprint sync",
      "Direct internship & job applications with live tracking",
      "Real-time interview scheduling & calendar invitations",
    ],
  },
  ACADEMICIAN: {
    tag: "For Academicians & Faculty",
    heading: "Bridge academic excellence with real industry.",
    description:
      "Mentor student capstone challenges, supervise industry R&D labs, collaborate on sabbaticals, and award dual gradings.",
    features: [
      "Capstone problem review & R&D lab supervision",
      "Dual-grading portal with Placement Readiness Index (PRI)",
      "Faculty-industry sabbatical and training exchange",
      "Cross-college mentorship & live office hours",
    ],
  },
  INDUSTRY: {
    tag: "For Industry & Employers",
    heading: "Discover top verified talent instantly.",
    description:
      "Post internships and jobs, screen candidates by verified skill match score, and schedule structured interviews effortlessly.",
    features: [
      "Targeted candidate scouting by verified skill score %",
      "Interactive interview scheduler with Meet/Zoom integration",
      "Sponsor real-world capstone challenges & hackathons",
      "One-click candidate dossier & application exports",
    ],
  },
  INSTITUTION: {
    tag: "For Universities & TPO Cells",
    heading: "Elevate your campus placement success.",
    description:
      "Track batch placement readiness, monitor department skill heatmaps, manage industry MoUs, and streamline accreditation.",
    features: [
      "Campus-wide department skill heatmap & readiness analytics",
      "Real-time placement & internship tracking dashboard",
      "NAAC / NBA / AICTE accreditation data management",
      "Institutional alumni & industry partnership outreach",
    ],
  },
};

function RoleParamSync({ onSelect }: { onSelect: (r: string) => void }) {
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role")?.toUpperCase();
  useEffect(() => {
    if (!rawRole) return;
    if (rawRole === "FACULTY" || rawRole === "ACADEMICIANS" || rawRole === "ACADEMICIAN") onSelect("ACADEMICIAN");
    else if (rawRole === "INDUSTRY" || rawRole === "INDUSTRIES") onSelect("INDUSTRY");
    else if (rawRole === "STUDENTS" || rawRole === "STUDENT") onSelect("STUDENT");
    else if (rawRole === "INSTITUTIONS" || rawRole === "INSTITUTION" || rawRole === "TPO") onSelect("INSTITUTION");
  }, [rawRole, onSelect]);
  return null;
}

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("STUDENT");

  const currentPitch = ROLE_PITCHES[selectedRole] || ROLE_PITCHES.STUDENT;

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-background text-foreground transition-colors duration-200">
      <Suspense fallback={null}>
        <RoleParamSync onSelect={setSelectedRole} />
      </Suspense>

      {/* Ambient background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[140px] dark:bg-indigo-600/25" />
        <div className="absolute -bottom-48 -left-32 h-[420px] w-[520px] rounded-full bg-violet-500/15 blur-[120px] dark:bg-violet-600/20" />
        <div className="absolute -right-32 top-1/3 h-[380px] w-[480px] rounded-full bg-sky-500/15 blur-[120px] dark:bg-sky-500/15" />
      </div>

      {/* Top Bar with Home Link and Theme Toggle */}
      <header className="relative z-20 mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-sm font-semibold transition-colors"
        >
          <SkillBridgeLogo size="sm" className="group-hover:scale-105" />
          <SkillBridgeWordmark size="sm" showSubtitle={false} />
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 mx-auto my-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        {/* Brand / Role-Specific pitch panel */}
        <div className="hidden lg:block space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-surface/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/80 dark:bg-surface/80 dark:text-indigo-300">
            <Sparkles className="size-3.5" /> {currentPitch.tag}
          </div>

          <h1 className="max-w-md text-3xl xl:text-4xl font-extrabold leading-[1.18] tracking-tight text-slate-900 dark:text-white">
            {currentPitch.heading}
          </h1>
          <p className="max-w-md text-slate-600 dark:text-slate-400 leading-relaxed text-sm xl:text-base">
            {currentPitch.description}
          </p>

          <ul className="space-y-3 pt-2">
            {currentPitch.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                  <ArrowRight aria-hidden className="size-3.5" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-border-muted/80 bg-surface/60 p-4 backdrop-blur-xs text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Empowered Collaboration</p>
            Seamlessly connect with Academia, Industry Leaders, and Universities across India on a single verified platform.
          </div>
        </div>

        {/* Form */}
        <div className="w-full">
          <div className="rounded-3xl border border-border-muted bg-surface/95 p-6 shadow-card backdrop-blur-md sm:p-8 dark:border-slate-800/80 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                <SkillBridgeLogo size="lg" />
                <SkillBridgeWordmark size="lg" showSubtitle={false} />
              </div>
              <ThemeToggle />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Create your account</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select your role to configure your personalized portal.</p>

            <form action={formAction} className="mt-5 space-y-4" noValidate>
              {/* Role Selection Tabs */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Choose your role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ROLE_OPTIONS.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.value;
                    return (
                      <label key={role.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={isSelected}
                          onChange={() => setSelectedRole(role.value)}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            "flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-center ring-1 transition-all active:scale-[0.98]",
                            isSelected
                              ? `${role.tone} shadow-xs font-bold ring-2`
                              : "bg-surface-subtle text-slate-600 ring-border-muted hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700/70 dark:hover:bg-slate-800"
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span className="text-xs font-bold">{role.label}</span>
                          <span className="text-[10px] opacity-75 font-normal truncate max-w-[90px]">{role.badge}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Common Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="name" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder={
                        selectedRole === "STUDENT"
                          ? "student@college.edu"
                          : selectedRole === "INDUSTRY"
                          ? "recruiter@company.com"
                          : "official@institute.edu"
                      }
                      className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle pl-9 pr-9 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff aria-hidden className="size-3.5" /> : <Eye aria-hidden className="size-3.5" />}
                  </button>
                </div>
              </div>

              {/* ROLE-SPECIFIC ONBOARDING FIELDS */}

              {/* 1. STUDENT FIELDS */}
              {selectedRole === "STUDENT" && (
                <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/30 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                    <GraduationCap className="size-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Student Academic Profile</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="collegeName" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        College / University Name
                      </label>
                      <input
                        id="collegeName"
                        name="collegeName"
                        type="text"
                        placeholder="e.g. IIT Delhi / DTU"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="department" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Department / Branch
                      </label>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="e.g. Computer Science & Engg"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="year" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Year of Study
                      </label>
                      <select
                        id="year"
                        name="year"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 cursor-pointer"
                      >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4" selected>4th Year / Final</option>
                        <option value="5">Postgraduate (M.Tech / MS)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="rollNumber" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Roll Number / Student ID
                      </label>
                      <input
                        id="rollNumber"
                        name="rollNumber"
                        type="text"
                        placeholder="e.g. 21CS045"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="skills" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Primary Skills (comma separated)
                    </label>
                    <input
                      id="skills"
                      name="skills"
                      type="text"
                      placeholder="e.g. React, Python, TypeScript, Node.js"
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* 2. ACADEMICIAN / FACULTY FIELDS */}
              {selectedRole === "ACADEMICIAN" && (
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    <BookOpen className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Academician & Faculty Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="collegeName" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Academic Institution / University
                      </label>
                      <input
                        id="collegeName"
                        name="collegeName"
                        type="text"
                        placeholder="e.g. IIT Bombay / NIT Trichy"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="department" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Academic Department
                      </label>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="e.g. Dept of Computer Science & Engg"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="designation" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Academic Designation
                      </label>
                      <input
                        id="designation"
                        name="designation"
                        type="text"
                        placeholder="e.g. Associate Professor / HOD"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="skills" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Research Areas / Specializations
                      </label>
                      <input
                        id="skills"
                        name="skills"
                        type="text"
                        placeholder="e.g. Machine Learning, Cloud Architecture"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. INDUSTRY / RECRUITER FIELDS */}
              {selectedRole === "INDUSTRY" && (
                <div className="rounded-2xl border border-purple-200/80 bg-purple-50/50 p-3.5 dark:border-purple-900/50 dark:bg-purple-950/30 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-200">
                    <Briefcase className="size-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Company & Hiring Profile</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="companyName" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Company / Organization Name
                      </label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        placeholder="e.g. Infosys / Google / Razorpay"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="designation" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Your Designation
                      </label>
                      <input
                        id="designation"
                        name="designation"
                        type="text"
                        placeholder="e.g. Talent Acquisition Lead / Tech Manager"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="department" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Industry Domain / Sector
                      </label>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="e.g. Fintech / Software & AI / Edtech"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="websiteUrl" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Company Website URL
                      </label>
                      <input
                        id="websiteUrl"
                        name="websiteUrl"
                        type="url"
                        placeholder="https://company.com"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Headquarters / Office Location
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g. Bengaluru, Karnataka, India"
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* 4. INSTITUTION / TPO FIELDS */}
              {selectedRole === "INSTITUTION" && (
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/30 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <School className="size-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Institution & TPO Cell Setup</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="collegeName" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Institution / University Full Name
                      </label>
                      <input
                        id="collegeName"
                        name="collegeName"
                        type="text"
                        placeholder="e.g. National Institute of Technology Warangal"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="institutionType" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Institution Classification
                      </label>
                      <select
                        id="institutionType"
                        name="institutionType"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 cursor-pointer"
                      >
                        <option value="Central University">Central / National Institute</option>
                        <option value="Autonomous Engineering College">Autonomous Engineering College</option>
                        <option value="State University">State University</option>
                        <option value="Affiliated Technical Institute">Affiliated Technical Institute</option>
                        <option value="Polytechnic / Diploma">Polytechnic / Diploma</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="tpoName" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Training & Placement Officer (TPO) Head
                      </label>
                      <input
                        id="tpoName"
                        name="tpoName"
                        type="text"
                        placeholder="e.g. Prof. Arvind K."
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="websiteUrl" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Official Campus Website
                      </label>
                      <input
                        id="websiteUrl"
                        name="websiteUrl"
                        type="url"
                        placeholder="https://college.ac.in"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="city" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Campus City
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="e.g. Hyderabad"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        State
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        placeholder="e.g. Telangana"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {state?.error && (
                <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs text-red-600 dark:bg-red-500/15 dark:text-red-300 border border-red-200 dark:border-red-500/30" role="alert">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
                {pending ? "Creating personalized portal…" : `Join as ${ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label ?? "User"}`}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl py-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
        © 2026 Skill Bridge · Empowering verified academia-industry collaboration
      </footer>
    </div>
  );
}
