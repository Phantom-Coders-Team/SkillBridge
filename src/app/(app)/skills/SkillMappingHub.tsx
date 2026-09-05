"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap,
  Target,
  ExternalLink,
  BookOpen,
  Award,
  ChevronRight,
} from "lucide-react";
import { Card, Badge, type BadgeTone } from "@/components/ui";

export interface AssessedSkill {
  id: string;
  skillName: string;
  score: number;
  decayStatus?: string;
}

export interface LearningProgramItem {
  id: string;
  title: string;
  description: string;
  programType: string;
  companyName: string;
  skills: string | null;
  duration: string | null;
}

interface SkillMappingHubProps {
  assessedSkills: AssessedSkill[];
  learningPrograms?: LearningProgramItem[];
}

interface IndustrySector {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiredSkills: string[];
  hiringPartners: string[];
  growthRate: string;
}

const INDUSTRY_SECTORS: IndustrySector[] = [
  {
    id: "cloud-devops",
    name: "Enterprise Cloud & DevOps",
    icon: "☁️",
    description: "Cloud-native distributed systems, microservices, containerization, and automated release infrastructure.",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Cloud"],
    hiringPartners: ["Amazon AWS", "Microsoft India", "HCLTech", "Infosys"],
    growthRate: "+28% YoY Demand",
  },
  {
    id: "genai-data",
    name: "Generative AI & Data Intelligence",
    icon: "🧠",
    description: "Large Language Models, semantic search, vector pipelines, predictive machine learning, and agentic workflows.",
    requiredSkills: ["Python", "Machine Learning", "AI", "Vector", "SQL", "Data"],
    hiringPartners: ["Google India", "NVIDIA India", "Intel India", "Samsung R&D"],
    growthRate: "+42% YoY Demand",
  },
  {
    id: "fullstack-saas",
    name: "Full Stack & SaaS Product Engineering",
    icon: "🚀",
    description: "Modern web applications, high-performance APIs, reactive frontends, and transactional database architecture.",
    requiredSkills: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Full Stack"],
    hiringPartners: ["Zoho", "Wipro", "TCS", "Reliance Jio"],
    growthRate: "+24% YoY Demand",
  },
  {
    id: "embedded-systems",
    name: "Embedded Systems & Smart Mobility",
    icon: "⚡",
    description: "Firmware architecture, real-time operating systems (RTOS), telemetry, and connected vehicle platforms.",
    requiredSkills: ["C++", "Embedded", "IoT", "Firmware", "Automotive", "Linux"],
    hiringPartners: ["Tata Motors", "Samsung R&D", "Intel India"],
    growthRate: "+19% YoY Demand",
  },
  {
    id: "cybersecurity-fintech",
    name: "Cybersecurity & FinTech Architecture",
    icon: "🛡️",
    description: "Zero-trust network security, high-throughput payment rails, cryptographic verification, and compliance.",
    requiredSkills: ["Security", "Cryptography", "OAuth", "API Security", "FinTech", "Blockchain"],
    hiringPartners: ["Wipro", "TCS", "HCLTech", "Infosys"],
    growthRate: "+31% YoY Demand",
  },
];

interface JobRole {
  title: string;
  sectorId: string;
  salaryBand: string;
  demandTier: "VERY HIGH" | "HIGH" | "STEADY";
  matchingSkills: string[];
  keyCompetencies: string[];
  careerOutlook: string;
}

const TARGET_JOB_ROLES: JobRole[] = [
  {
    title: "Full Stack Cloud Engineer",
    sectorId: "fullstack-saas",
    salaryBand: "₹10 - 18 LPA",
    demandTier: "VERY HIGH",
    matchingSkills: ["React", "Node.js", "Next.js", "TypeScript", "PostgreSQL"],
    keyCompetencies: ["Server Actions", "Database Indexing", "API Security", "Component Architecture"],
    careerOutlook: "Core technical backbone across high-growth startups and tech enterprises.",
  },
  {
    title: "Cloud Infrastructure & DevOps Engineer",
    sectorId: "cloud-devops",
    salaryBand: "₹12 - 22 LPA",
    demandTier: "VERY HIGH",
    matchingSkills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    keyCompetencies: ["Multi-stage Docker", "HPA Scaling", "Terraform IaC", "Observability"],
    careerOutlook: "Critical for enterprise cloud adoption and continuous delivery pipelines.",
  },
  {
    title: "AI Solutions Architect & LLM Engineer",
    sectorId: "genai-data",
    salaryBand: "₹16 - 30 LPA",
    demandTier: "VERY HIGH",
    matchingSkills: ["Python", "Machine Learning", "SQL", "Next.js"],
    keyCompetencies: ["Prompt Optimization", "RAG Pipelines", "Vector Embeddings", "Model Deployment"],
    careerOutlook: "Fastest-growing engineering specialization globally.",
  },
  {
    title: "Embedded Systems & IoT Specialist",
    sectorId: "embedded-systems",
    salaryBand: "₹9 - 17 LPA",
    demandTier: "HIGH",
    matchingSkills: ["C++", "Linux", "IoT"],
    keyCompetencies: ["RTOS Scheduling", "Device Drivers", "CAN Bus Protocols", "Memory Management"],
    careerOutlook: "High demand across EV, automotive, and industrial automation sectors.",
  },
];

export default function SkillMappingHub({
  assessedSkills,
  learningPrograms = [],
}: SkillMappingHubProps) {
  const [activeTab, setActiveTab] = useState<"PROFILE" | "SECTORS" | "ROLES" | "LEARNING">("PROFILE");

  // Determine strengths and gaps
  const strengths = assessedSkills.filter((s) => s.score >= 70);
  const gaps = assessedSkills.filter((s) => s.score < 70);

  // Normalized lower-case skill names for matching
  const knownSkillTokens = assessedSkills.map((s) => s.skillName.toLowerCase());

  // Calculate sector match scores
  const sectorMatches = INDUSTRY_SECTORS.map((sector) => {
    let matchedCount = 0;
    for (const req of sector.requiredSkills) {
      const found = assessedSkills.find(
        (s) => s.skillName.toLowerCase().includes(req.toLowerCase()) && s.score >= 60
      );
      if (found) matchedCount += 1;
    }
    const score = Math.round((matchedCount / sector.requiredSkills.length) * 100);
    // Baseline boost if student has general strengths
    const dynamicScore = Math.min(100, Math.max(35, score + (strengths.length >= 3 ? 20 : 10)));
    return {
      ...sector,
      matchPercentage: dynamicScore,
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
              <Compass className="size-3.5" />
              <span>Intelligent Skill Mapping & Career Guidance Engine</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              From Assessed Skills to High-Impact Careers
            </h2>
            <p className="text-xs text-indigo-200/90 leading-relaxed sm:text-sm">
              Our recommendation engine evaluates your technical and soft skill assessments, diagnoses competency gaps, and dynamically maps you to top industry sectors, high-growth job roles, and curated up-skilling pathways.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap gap-2">
            <Link
              href="/assessments"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-600 transition-all cursor-pointer"
            >
              <Zap className="size-4" />
              <span>Take Diagnostic Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-muted pb-3">
        {[
          { id: "PROFILE", label: "Skill Profile & Gap Matrix", icon: Target },
          { id: "SECTORS", label: "Industry Sector Matching", icon: Building2 },
          { id: "ROLES", label: "Target Career Roles", icon: Briefcase },
          { id: "LEARNING", label: "Personalized Up-skilling Tracks", icon: GraduationCap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-surface text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-border-muted"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Skill Profile & Gap Matrix */}
      {activeTab === "PROFILE" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Strengths Card */}
            <Card className="p-5 border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 to-transparent dark:border-emerald-900/40 dark:from-emerald-950/20">
              <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Validated Industry Strengths
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Score ≥ 70% · Verified ready for production deployment
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {strengths.length} Skills
                </span>
              </div>

              {strengths.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <p>No verified strengths recorded yet.</p>
                  <Link
                    href="/assessments"
                    className="mt-2 inline-block font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Take a technical questionnaire to validate competencies &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {strengths.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-white/80 p-3 text-xs dark:border-emerald-900/40 dark:bg-surface"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{s.skillName}</p>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                            Enterprise Production Ready
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-black text-emerald-700 dark:text-emerald-300">
                          {s.score}%
                        </span>
                        <div className="h-1.5 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden mt-1">
                          <div className="h-full bg-emerald-500" style={{ width: `${s.score}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Gaps to Bridge Card */}
            <Card className="p-5 border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-transparent dark:border-amber-900/40 dark:from-amber-950/20">
              <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-900/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                    <AlertTriangle className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Identified Skill Gaps
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Competencies below industry baseline (&lt; 70%)
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {gaps.length} Target Areas
                </span>
              </div>

              {gaps.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Zero critical skill gaps detected!
                  </p>
                  <p className="mt-1 text-slate-400">
                    All assessed competencies meet or exceed industry entry-level standards.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gaps.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-white/80 p-3 text-xs dark:border-amber-900/40 dark:bg-surface"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{s.skillName}</p>
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                            Requires Calibration & Practical Projects
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                          {s.score}%
                        </span>
                        <div className="h-1.5 w-16 rounded-full bg-amber-100 dark:bg-amber-950 overflow-hidden mt-1">
                          <div className="h-full bg-amber-500" style={{ width: `${s.score}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Guidance Summary Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <strong>Next Step in Your Career Pathway:</strong> Based on your profile, enrolling in our partner learning programs will bridge your identified gaps and elevate your Placement Readiness Index (PRI).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("LEARNING")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition cursor-pointer"
            >
              <span>Explore Programs</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Industry Sector Matching */}
      {activeTab === "SECTORS" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sectorMatches.map((sector) => (
              <Card key={sector.id} hover className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{sector.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {sector.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {sector.growthRate}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-base font-black text-indigo-600 dark:text-indigo-400">
                        {sector.matchPercentage}%
                      </span>
                      <span className="block text-[10px] text-slate-400">Profile Match</span>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sector.description}
                  </p>

                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Required Competencies:
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {sector.requiredSkills.map((req) => {
                        const hasSkill = assessedSkills.some(
                          (s) => s.skillName.toLowerCase().includes(req.toLowerCase()) && s.score >= 60
                        );
                        return (
                          <span
                            key={req}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              hasSkill
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {hasSkill ? "✓ " : ""}{req}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border-muted/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Top Corporate Hiring Partners:
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {sector.hiringPartners.map((partner) => (
                        <span
                          key={partner}
                          className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {partner}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-muted flex items-center justify-between">
                  <Link
                    href="/internships"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Browse Matching Openings</span>
                    <ArrowRight className="size-3" />
                  </Link>
                  <Link
                    href="/partners"
                    className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    View Partner MoUs
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Target Career Roles & Guidance */}
      {activeTab === "ROLES" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {TARGET_JOB_ROLES.map((role) => (
              <Card key={role.title} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {role.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-black text-indigo-700 dark:text-indigo-300 font-mono">
                          {role.salaryBand}
                        </span>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                          {role.demandTier} DEMAND
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {role.careerOutlook}
                  </p>

                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Target Competency Stack:
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {role.keyCompetencies.map((comp) => (
                        <span
                          key={comp}
                          className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-muted flex items-center justify-between">
                  <Link
                    href="/placements"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>View Campus Recruitment Records</span>
                    <ArrowRight className="size-3" />
                  </Link>
                  <Link
                    href="/reverse-placement"
                    className="text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Reverse Placements
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Personalized Up-skilling Tracks */}
      {activeTab === "LEARNING" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AWS Cloud & DevOps Practitioner Sprint",
                partner: "Amazon AWS",
                type: "CERTIFICATION",
                duration: "4 Weeks",
                skills: "Docker, Kubernetes, AWS Lambda, CI/CD",
                description: "Hands-on container deployment and microservices scaling on AWS infrastructure with dual enterprise certification.",
              },
              {
                title: "Production LLM & Vector Search Intensive",
                partner: "Google India",
                type: "TRAINING",
                duration: "6 Weeks",
                skills: "Python, LangChain, Vector DBs, Gemini 1.5",
                description: "Build enterprise retrieval-augmented generation (RAG) applications and deploy autonomous agents.",
              },
              {
                title: "Full Stack Distributed Architecture",
                partner: "Infosys",
                type: "WORKSHOP",
                duration: "3 Weeks",
                skills: "React, Next.js, PostgreSQL, gRPC",
                description: "Master high-throughput transactional database optimization, Server Actions, and distributed caching.",
              },
              {
                title: "Industrial Agile Engineering & Code Quality",
                partner: "TCS",
                type: "TRAINING",
                duration: "2 Weeks",
                skills: "Agile, CI/CD, Unit Testing, TDD",
                description: "Learn test-driven development, automated pull request workflows, and corporate code standards.",
              },
            ].map((prog) => (
              <Card key={prog.title} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                      {prog.type}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">⏱ {prog.duration}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {prog.title}
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                    Sponsored by {prog.partner}
                  </p>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {prog.description}
                  </p>

                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Bridges Skills:
                    </p>
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                      {prog.skills}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-muted">
                  <Link
                    href="/internships"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-2xs"
                  >
                    <span>Enroll to Bridge Skill Gap</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
