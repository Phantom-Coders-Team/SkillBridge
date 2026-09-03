import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Coins,
  FlaskConical,
  FolderKanban,
  Handshake,
  LayoutDashboard,
  Radar,
  Scale,
  ScrollText,
  Sparkles,
  Target,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  STUDENT: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Skill Radar & Diagnostic", href: "/skills", icon: Radar },
    { label: "Internships & Jobs", href: "/internships", icon: Briefcase },
    { label: "Proof of Work & Badges", href: "/proof-of-work", icon: Award },
    { label: "Mentor Office Hours", href: "/office-hours", icon: CalendarClock },
    { label: "Reverse Placement", href: "/reverse-placement", icon: TrendingUp },
    { label: "Digital Portfolio", href: "/portfolio", icon: ScrollText },
  ],
  FACULTY: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "AI Syllabus Gap Audit", href: "/syllabus", icon: BookOpen },
    { label: "R&D Lab Units", href: "/lab-units", icon: FlaskConical },
    { label: "Dual Grading", href: "/dual-grading", icon: Scale },
    { label: "Faculty Development", href: "/faculty-portal", icon: Building2 },
    { label: "Proof of Work Review", href: "/proof-of-work", icon: Award },
  ],
  INDUSTRY: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Internships & Jobs", href: "/internships", icon: Briefcase },
    { label: "Challenge Marketplace", href: "/challenges", icon: Sparkles },
    { label: "Reverse Placement (Pitches)", href: "/reverse-placement", icon: TrendingUp },
    { label: "Host Mentor Slots", href: "/mentor-slots", icon: CalendarClock },
    { label: "Dual Grading", href: "/dual-grading", icon: Scale },
  ],
  TPO: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Skill Deficit Heatmap", href: "/heatmap", icon: BarChart3 },
    { label: "Placement Records", href: "/placements", icon: Target },
    { label: "Corporate Partners", href: "/partners", icon: Building2 },
    { label: "Cohort Analytics", href: "/analytics", icon: ClipboardCheck },
  ],
};