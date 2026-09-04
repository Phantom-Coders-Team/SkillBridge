export type Role = "STUDENT" | "FACULTY" | "INDUSTRY" | "INSTITUTIONS" | "TPO";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
}

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  INDUSTRY: "Industry",
  INSTITUTIONS: "Institutions",
  TPO: "Institutions",
};

export const ROLE_COLORS: Record<Role, string> = {
  STUDENT: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  FACULTY: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  INDUSTRY: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
  INSTITUTIONS: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  TPO: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

