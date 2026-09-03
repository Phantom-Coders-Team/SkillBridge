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
    { label: "Sync Skills (DPI/Git)", href: "/sync", icon: Sparkles },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Challenge Marketplace", href: "/challenges", icon: Sparkles },
    { label: "Lab Units", href: "/lab-units", icon: FlaskConical },
    { label: "Proof of Work", href: "/proof-of-work", icon: Award },
    { label: "Skills Radar", href: "/skills", icon: Radar },
    { label: "Skill Tokens", href: "/tokens", icon: Coins },
    { label: "Office Hours", href: "/office-hours", icon: CalendarClock },
    { label: "Internships & Jobs", href: "/internships", icon: Briefcase },
    { label: "Mentors", href: "/mentors", icon: Handshake },
    { label: "Reverse Placement", href: "/reverse-placement", icon: TrendingUp },
    { label: "Job Pitches", href: "/job-pitches", icon: ClipboardList },
    { label: "Portfolio", href: "/portfolio", icon: ScrollText },
    { label: "My Profile", href: "/profile", icon: User },
  ],
  FACULTY: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Challenge Marketplace", href: "/challenges", icon: Sparkles },
    { label: "R&D Lab Units", href: "/lab-units", icon: FlaskConical },
    { label: "Dual Grading", href: "/dual-grading", icon: Scale },
    { label: "Assessments", href: "/assessments", icon: ClipboardList },
    { label: "Syllabus", href: "/syllabus", icon: BookOpen },
    { label: "Faculty Development", href: "/faculty-portal", icon: Building2 },
    { label: "Sabbaticals", href: "/sabbaticals", icon: Handshake },
  ],
  INDUSTRY: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Challenge Marketplace", href: "/challenges", icon: Sparkles },
    { label: "Dual Grading", href: "/dual-grading", icon: Scale },
    { label: "Mentor Slots", href: "/mentor-slots", icon: CalendarClock },
    { label: "Internships & Jobs", href: "/internships", icon: Briefcase },
    { label: "Job Pitches", href: "/job-pitches", icon: ClipboardList },
    { label: "Reverse Placement", href: "/reverse-placement", icon: TrendingUp },
    { label: "Sabbaticals", href: "/sabbaticals", icon: Building2 },
    { label: "Proof of Work", href: "/proof-of-work", icon: Award },
  ],
  TPO: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Placements", href: "/placements", icon: Target },
    { label: "Skill Heatmap", href: "/heatmap", icon: BarChart3 },
    { label: "Reverse Placement", href: "/reverse-placement", icon: TrendingUp },
    { label: "Partners", href: "/partners", icon: Building2 },
    { label: "Analytics", href: "/analytics", icon: ClipboardCheck },
  ],
};