import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarClock,
  ClipboardCheck,
  FlaskConical,
  LayoutDashboard,
  Radar,
  Scale,
  ScrollText,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Skill Radar & Diagnostic", href: "/skills", icon: Radar },
  { label: "Skill Assessments", href: "/assessments", icon: ClipboardCheck },
  { label: "Internships & Opportunities", href: "/internships", icon: Briefcase },
  { label: "Proof of Work & Badges", href: "/proof-of-work", icon: Award },
  { label: "Joint Evaluation (Dual)", href: "/dual-grading", icon: Scale },
  { label: "Reverse Placement", href: "/reverse-placement", icon: TrendingUp },
  { label: "Mentor Office Hours", href: "/office-hours", icon: CalendarClock },
  { label: "Digital Portfolio", href: "/portfolio", icon: ScrollText },
];

const ACADEMICIAN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Syllabus Gap Audit", href: "/syllabus", icon: BookOpen },
  { label: "R&D Lab Units", href: "/lab-units", icon: FlaskConical },
  { label: "Challenge Marketplace", href: "/challenges", icon: Sparkles },
  { label: "Joint Evaluation (Dual)", href: "/dual-grading", icon: Scale },
  { label: "Academician Development", href: "/faculty-portal", icon: Building2 },
  { label: "Proof of Work Review", href: "/proof-of-work", icon: Award },
  { label: "Candidate Talent Radar", href: "/reverse-placement", icon: TrendingUp },
];

const INDUSTRIES_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Internships & Jobs", href: "/internships", icon: Briefcase },
  { label: "Challenge Marketplace", href: "/challenges", icon: Sparkles },
  { label: "Reverse Placement (Pitches)", href: "/reverse-placement", icon: TrendingUp },
  { label: "Host Mentor Slots", href: "/mentor-slots", icon: CalendarClock },
  { label: "Joint Evaluation (Dual)", href: "/dual-grading", icon: Scale },
  { label: "Proof of Work Review", href: "/proof-of-work", icon: Award },
];

const INSTITUTIONS_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Skill Deficit Heatmap", href: "/heatmap", icon: BarChart3 },
  { label: "Placement Records", href: "/placements", icon: Target },
  { label: "Joint Evaluation (Dual)", href: "/dual-grading", icon: Scale },
  { label: "Corporate Partners", href: "/partners", icon: Building2 },
  { label: "Reverse Placement Radar", href: "/reverse-placement", icon: TrendingUp },
  { label: "Cohort Analytics", href: "/analytics", icon: ClipboardCheck },
];

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  STUDENT: STUDENT_NAV,
  ACADEMICIAN: ACADEMICIAN_NAV,
  INDUSTRY: INDUSTRIES_NAV,
  INSTITUTION: INSTITUTIONS_NAV,
  // Backwards compatibility aliases
  INDUSTRIES: INDUSTRIES_NAV,
  INSTITUTIONS: INSTITUTIONS_NAV,
  FACULTY: ACADEMICIAN_NAV,
  TPO: INSTITUTIONS_NAV,
};