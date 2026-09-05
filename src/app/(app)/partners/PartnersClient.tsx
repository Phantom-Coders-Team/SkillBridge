"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Filter,
  GraduationCap,
  Handshake,
  Layers,
  MapPin,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";

export interface PartnerData {
  id: string;
  name: string;
  email: string;
  role: string;
  profile: {
    id: string;
    companyName: string | null;
    designation: string | null;
    department: string | null;
    bio: string | null;
    location: string | null;
    skills: string | null;
    websiteUrl: string | null;
  } | null;
  challenges: Array<{
    id: string;
    title: string;
    challengeType: string;
    domain: string | null;
    stipend: number | null;
    status: string;
  }>;
  learningPrograms: Array<{
    id: string;
    title: string;
    programType: string;
    duration: string | null;
    mode: string | null;
  }>;
  jobPitches: Array<{
    id: string;
    status: string;
  }>;
}

interface PartnersClientProps {
  partners: PartnerData[];
  currentUserRole?: string;
}

const BRAND_METADATA: Record<
  string,
  {
    gradient: string;
    tier: string;
    category: string;
    accentTone: "indigo" | "blue" | "emerald" | "amber" | "violet" | "red" | "pink" | "cyan";
  }
> = {
  "Google India": {
    gradient: "from-blue-600 via-indigo-600 to-sky-500",
    tier: "Tier-1 Strategic MoU",
    category: "AI & Cloud",
    accentTone: "indigo",
  },
  "Microsoft India": {
    gradient: "from-sky-500 via-blue-600 to-indigo-700",
    tier: "Tier-1 Strategic MoU",
    category: "AI & Cloud",
    accentTone: "blue",
  },
  "Amazon AWS": {
    gradient: "from-amber-500 via-orange-600 to-yellow-600",
    tier: "Global Cloud Pioneer",
    category: "AI & Cloud",
    accentTone: "amber",
  },
  "NVIDIA India": {
    gradient: "from-emerald-500 via-teal-600 to-green-700",
    tier: "Deep Learning R&D Anchor",
    category: "Hardware & Silicon",
    accentTone: "emerald",
  },
  "Intel India": {
    gradient: "from-blue-600 via-cyan-600 to-sky-700",
    tier: "Silicon Co-Innovation Lab",
    category: "Hardware & Silicon",
    accentTone: "cyan",
  },
  "Cisco Systems": {
    gradient: "from-teal-600 via-emerald-600 to-blue-600",
    tier: "Networking & Security Anchor",
    category: "Enterprise & SaaS",
    accentTone: "emerald",
  },
  "IBM India Research": {
    gradient: "from-indigo-600 via-blue-700 to-slate-800",
    tier: "Quantum & Cloud Research",
    category: "AI & Cloud",
    accentTone: "indigo",
  },
  "Qualcomm India": {
    gradient: "from-rose-600 via-red-600 to-orange-600",
    tier: "5G & Telecom Pioneer",
    category: "Hardware & Silicon",
    accentTone: "red",
  },
  "Adobe Systems": {
    gradient: "from-red-600 via-rose-600 to-pink-600",
    tier: "Digital Experience & AI",
    category: "Enterprise & SaaS",
    accentTone: "pink",
  },
  Infosys: {
    gradient: "from-blue-600 via-indigo-600 to-cyan-600",
    tier: "Tier-1 Campus Recruiter",
    category: "Enterprise & SaaS",
    accentTone: "blue",
  },
  TCS: {
    gradient: "from-sky-600 via-blue-700 to-indigo-800",
    tier: "Cognitive Operations Anchor",
    category: "Enterprise & SaaS",
    accentTone: "blue",
  },
  Wipro: {
    gradient: "from-teal-600 via-emerald-600 to-sky-700",
    tier: "Cyber Resilience Partner",
    category: "Enterprise & SaaS",
    accentTone: "emerald",
  },
  Zoho: {
    gradient: "from-red-500 via-amber-500 to-orange-600",
    tier: "SaaS Ecosystem Partner",
    category: "Enterprise & SaaS",
    accentTone: "amber",
  },
  HCLTech: {
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
    tier: "Engineering R&D Anchor",
    category: "Enterprise & SaaS",
    accentTone: "violet",
  },
  "L&T Technology Services": {
    gradient: "from-amber-600 via-orange-600 to-yellow-700",
    tier: "Industry 4.0 Co-Innovation",
    category: "Automotive & Industrial",
    accentTone: "amber",
  },
  "Samsung R&D Institute": {
    gradient: "from-blue-700 via-indigo-800 to-purple-900",
    tier: "Mobile Systems Research",
    category: "Hardware & Silicon",
    accentTone: "indigo",
  },
  "Tata Motors": {
    gradient: "from-slate-700 via-blue-900 to-indigo-950",
    tier: "Electric Mobility Lab",
    category: "Automotive & Industrial",
    accentTone: "blue",
  },
  "Reliance Jio Platforms": {
    gradient: "from-blue-600 via-indigo-700 to-rose-600",
    tier: "Indigenous 5G & AI Anchor",
    category: "AI & Cloud",
    accentTone: "indigo",
  },
  "All India Institute of Ayurveda (AIIA)": {
    gradient: "from-emerald-600 via-amber-600 to-teal-700",
    tier: "National Ayush Apex Partner",
    category: "Healthcare & Ayush",
    accentTone: "emerald",
  },
};

const CATEGORIES = [
  "All Domains",
  "AI & Cloud",
  "Hardware & Silicon",
  "Enterprise & SaaS",
  "Automotive & Industrial",
  "Healthcare & Ayush",
] as const;

export function PartnersClient({ partners }: PartnersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Domains");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "CHALLENGES" | "INTERNSHIPS" | "STRATEGIC">("ALL");
  const [collaborationTarget, setCollaborationTarget] = useState<PartnerData | null>(null);
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collabForm, setCollabForm] = useState({
    track: "Joint Capstone R&D Lab",
    department: "Computer Science & Engineering",
    cohortSize: "25-30 Students",
    term: "Upcoming Academic Semester (Fall 2026)",
    notes: "",
  });

  // Calculate aggregated stats
  const totalPartners = partners.length;
  const totalChallenges = useMemo(
    () => partners.reduce((acc, p) => acc + (p.challenges?.length || 0), 0),
    [partners],
  );
  const totalPrograms = useMemo(
    () => partners.reduce((acc, p) => acc + (p.learningPrograms?.length || 0), 0),
    [partners],
  );
  const totalOffers = useMemo(
    () => partners.reduce((acc, p) => acc + (p.jobPitches?.length || 0), 0),
    [partners],
  );

  // Filtered partners
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const name = p.profile?.companyName || p.name;
      const meta = BRAND_METADATA[name] || {
        category: "Enterprise & SaaS",
        tier: "Corporate Industry Partner",
      };

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = name.toLowerCase().includes(query);
        const matchesLocation = p.profile?.location?.toLowerCase().includes(query) ?? false;
        const matchesDept = p.profile?.department?.toLowerCase().includes(query) ?? false;
        const matchesSkills = p.profile?.skills?.toLowerCase().includes(query) ?? false;
        const matchesBio = p.profile?.bio?.toLowerCase().includes(query) ?? false;
        if (!matchesName && !matchesLocation && !matchesDept && !matchesSkills && !matchesBio) {
          return false;
        }
      }

      // Category Pill
      if (selectedCategory !== "All Domains" && meta.category !== selectedCategory) {
        return false;
      }

      // Feature Filter
      if (activeFilter === "CHALLENGES" && (!p.challenges || p.challenges.length === 0)) {
        return false;
      }
      if (activeFilter === "INTERNSHIPS" && (!p.learningPrograms || p.learningPrograms.length === 0)) {
        return false;
      }
      if (activeFilter === "STRATEGIC" && !meta.tier.includes("Strategic")) {
        return false;
      }

      return true;
    });
  }, [partners, searchQuery, selectedCategory, activeFilter]);

  const handleInitiateCollab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaborationTarget) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const company = collaborationTarget.profile?.companyName || collaborationTarget.name;
      setProposalSuccess(
        `Academic Partnership request for ${collabForm.track} with ${company} submitted to TPO Liaison with Reference #SB-MOU-${Math.floor(1000 + Math.random() * 9000)}.`,
      );
      setCollaborationTarget(null);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        icon={Building2}
        title="Corporate & Industry Partners"
        subtitle="Accredited enterprise partners engaged with the institution through active MoUs, capstone sponsorships, and reverse recruitment."
      />

      {/* Success Toast / Alert */}
      {proposalSuccess && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800 shadow-sm backdrop-blur-xs dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">Collaboration Proposal Dispatched</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">{proposalSuccess}</p>
            </div>
          </div>
          <button
            onClick={() => setProposalSuccess(null)}
            className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Hero Stats Section */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Partners</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <Building2 className="size-4.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {totalPartners}+
            </span>
            <Badge tone="indigo">Accredited</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active industry co-innovation network</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sponsored Challenges</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <Sparkles className="size-4.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {totalChallenges}
            </span>
            <Badge tone="amber">Active R&D</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">R&D Capstones & Micro-Consultancies</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Internship & Job Tracks</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Briefcase className="size-4.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {totalPrograms}
            </span>
            <Badge tone="emerald">Open Tracks</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Certified learning & reverse-placement</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Institutional MoUs</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
              <Award className="size-4.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              100%
            </span>
            <Badge tone="purple">NAAC Aligned</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Criterion 1 & 5 Verified MoUs</p>
        </Card>
      </div>

      {/* Interactive Controls & Filter Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, city, tech stack (e.g. GenAI, CUDA, Cloud, 5G)..."
              className="h-10 w-full rounded-xl border border-border-muted bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-surface"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                activeFilter === "ALL"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              All Partners ({partners.length})
            </button>
            <button
              onClick={() => setActiveFilter("STRATEGIC")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                activeFilter === "STRATEGIC"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              Tier-1 Strategic
            </button>
            <button
              onClick={() => setActiveFilter("CHALLENGES")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                activeFilter === "CHALLENGES"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              With Challenges
            </button>
            <button
              onClick={() => setActiveFilter("INTERNSHIPS")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                activeFilter === "INTERNSHIPS"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              With Internships
            </button>
          </div>
        </div>

        {/* Domain Category Filter Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border-muted pt-3">
          <span className="mr-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
            <Filter className="size-3" /> Domains:
          </span>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                selectedCategory === category
                  ? "bg-indigo-50 font-semibold text-indigo-700 ring-1 ring-indigo-300/80 dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-500/40"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </Card>

      {/* Directory Grid */}
      {filteredPartners.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No matching corporate partners found"
          description={`No partners matched your search query "${searchQuery}" or selected domain filter. Try resetting filters.`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Domains");
                setActiveFilter("ALL");
              }}
            >
              Reset All Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => {
            const companyName = partner.profile?.companyName || partner.name;
            const meta = BRAND_METADATA[companyName] || {
              gradient: "from-indigo-600 to-blue-700",
              tier: "Corporate Industry Partner",
              category: "Enterprise & SaaS",
              accentTone: "indigo" as const,
            };

            const initials = companyName
              .split(" ")
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase();

            const skillsList = partner.profile?.skills
              ? partner.profile.skills.split(",").map((s) => s.trim())
              : [];

            const websiteUrl =
              partner.profile?.websiteUrl || `https://www.google.com/search?q=${encodeURIComponent(companyName)}`;

            return (
              <Card
                key={partner.id}
                hover
                className="group flex flex-col justify-between overflow-hidden border border-border-muted transition-all duration-200"
              >
                <div>
                  {/* Card Header Strip with Brand Gradient Banner */}
                  <div className={`h-2.5 w-full bg-gradient-to-r ${meta.gradient}`} />

                  <div className="p-5">
                    {/* Top Row: Avatar Monogram + Tier Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-extrabold text-white shadow-sm ring-2 ring-white/20 ${meta.gradient}`}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                              {companyName}
                            </h3>
                            <CheckCircle2 className="size-4 text-emerald-500" />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {partner.profile?.department || "Corporate Technology Hub"}
                          </span>
                        </div>
                      </div>

                      <Badge tone={meta.accentTone} className="shrink-0">
                        {meta.tier}
                      </Badge>
                    </div>

                    {/* Designation / Lead Person */}
                    {partner.profile?.designation && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <Users className="size-3.5 text-slate-400" />
                        <span>
                          {partner.profile.designation}
                        </span>
                      </p>
                    )}

                    {/* Location Badge */}
                    {partner.profile?.location && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <MapPin className="size-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{partner.profile.location}</span>
                      </p>
                    )}

                    {/* Short Bio */}
                    {partner.profile?.bio && (
                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {partner.profile.bio}
                      </p>
                    )}

                    {/* Core Skills & Tech Domain Chips */}
                    {skillsList.length > 0 && (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {skillsList.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800/80 dark:text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                        {skillsList.length > 4 && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            +{skillsList.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section with Live Metrics & Action Toolbar */}
                <div className="border-t border-border-muted bg-slate-50/60 p-4 dark:bg-surface/50">
                  <div className="grid grid-cols-3 gap-2 pb-3 text-center">
                    <div className="rounded-lg bg-surface p-1.5 shadow-2xs dark:bg-surface">
                      <span className="block text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {partner.challenges?.length || 0}
                      </span>
                      <span className="block text-[10px] text-slate-500">Challenges</span>
                    </div>

                    <div className="rounded-lg bg-surface p-1.5 shadow-2xs dark:bg-surface">
                      <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {partner.learningPrograms?.length || 0}
                      </span>
                      <span className="block text-[10px] text-slate-500">Programs</span>
                    </div>

                    <div className="rounded-lg bg-surface p-1.5 shadow-2xs dark:bg-surface">
                      <span className="block text-xs font-bold text-amber-600 dark:text-amber-400">
                        Active
                      </span>
                      <span className="block text-[10px] text-slate-500">MoU 2026</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setCollaborationTarget(partner)}
                      icon={Handshake}
                    >
                      Propose Collab
                    </Button>

                    <Link
                      href="/challenges"
                      className="inline-flex h-8 items-center justify-center rounded-xl bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
                    >
                      Challenges →
                    </Link>

                    {websiteUrl && (
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        title="Visit official website"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Collaboration Initiation Modal */}
      {collaborationTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-border-muted bg-surface p-6 shadow-2xl dark:bg-surface">
            <button
              onClick={() => setCollaborationTarget(null)}
              className="absolute right-5 top-5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Handshake className="size-5.5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Initiate Industry Collaboration
                </h3>
                <p className="text-xs text-slate-500">
                  Formal proposal to{" "}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {collaborationTarget.profile?.companyName || collaborationTarget.name}
                  </strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleInitiateCollab} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Collaboration Program Model
                </label>
                <select
                  value={collabForm.track}
                  onChange={(e) => setCollabForm({ ...collabForm, track: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-border-muted bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:bg-surface dark:text-slate-100"
                >
                  <option>Joint Capstone R&D Lab</option>
                  <option>Faculty Industrial Sabbatical Exchange</option>
                  <option>Curriculum Modernization & Co-Design Board</option>
                  <option>Reverse Placement Cohort Drive</option>
                  <option>AI / Specialized Center of Excellence (CoE)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Academic Dept
                  </label>
                  <select
                    value={collabForm.department}
                    onChange={(e) => setCollabForm({ ...collabForm, department: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-border-muted bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:bg-surface dark:text-slate-100"
                  >
                    <option>Computer Science & Engineering</option>
                    <option>Electronics & Communication</option>
                    <option>Information Technology</option>
                    <option>Mechanical & Automation</option>
                    <option>Ayush Bio-Informatics</option>
                    <option>Multi-Disciplinary Consortium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Cohort Size
                  </label>
                  <select
                    value={collabForm.cohortSize}
                    onChange={(e) => setCollabForm({ ...collabForm, cohortSize: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-border-muted bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:bg-surface dark:text-slate-100"
                  >
                    <option>10-15 Select Scholars</option>
                    <option>25-30 Students (Standard Squad)</option>
                    <option>50+ Batch (Placement Track)</option>
                    <option>Faculty Members Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Academic Term
                </label>
                <select
                  value={collabForm.term}
                  onChange={(e) => setCollabForm({ ...collabForm, term: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-border-muted bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:bg-surface dark:text-slate-100"
                >
                  <option>Immediate (Fall 2026 Semester)</option>
                  <option>Upcoming Spring Cycle (Jan - May 2027)</option>
                  <option>Summer 2027 Intensive Residency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Proposal Objectives & Lab Scope
                </label>
                <textarea
                  rows={3}
                  value={collabForm.notes}
                  onChange={(e) => setCollabForm({ ...collabForm, notes: e.target.value })}
                  placeholder="Outline proposed student prerequisites, deliverables, faculty co-guides, or specific lab equipment..."
                  className="mt-1.5 w-full rounded-xl border border-border-muted bg-slate-50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:bg-surface dark:text-slate-100 dark:focus:bg-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setCollaborationTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  icon={Send}
                >
                  {isSubmitting ? "Submitting Proposal..." : "Dispatch Proposal to Partner"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
