import Link from "next/link";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/* ---------------------------------- Badge --------------------------------- */

export type BadgeTone =
  | "gray"
  | "blue"
  | "indigo"
  | "green"
  | "emerald"
  | "amber"
  | "red"
  | "purple"
  | "violet"
  | "orange"
  | "cyan"
  | "pink";

const BADGE_TONES: Record<BadgeTone, string> = {
  gray: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  blue: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  green: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  red: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
  violet: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300",
};

export function Badge({
  tone = "gray",
  className,
  children,
  ...props
}: { tone?: BadgeTone } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        BADGE_TONES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* --------------------------------- Button --------------------------------- */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-md active:bg-indigo-800 disabled:hover:bg-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
  secondary:
    "bg-indigo-50 text-indigo-700 hover:bg-indigo-100/90 active:bg-indigo-200 disabled:hover:bg-indigo-50 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25 dark:active:bg-indigo-500/30 dark:disabled:hover:bg-indigo-500/15 focus-visible:ring-2 focus-visible:ring-indigo-500/50",
  outline:
    "border border-slate-300/80 bg-white text-slate-700 hover:border-indigo-400 hover:bg-slate-50/80 hover:text-slate-900 disabled:hover:bg-white dark:border-slate-700 dark:bg-surface dark:text-slate-200 dark:hover:border-indigo-500/60 dark:hover:bg-slate-800/60 dark:disabled:hover:bg-surface focus-visible:ring-2 focus-visible:ring-indigo-500/50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500/50",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "primary", size = "md", icon: Icon, className, children, type, ...props }: ButtonProps) {
  return (
    <button type={type ?? "button"} className={cn(BUTTON_BASE, BUTTON_SIZES[size], BUTTON_VARIANTS[variant], className)} {...props}>
      {Icon && <Icon aria-hidden className="size-4" />}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  icon: Icon,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(BUTTON_BASE, BUTTON_SIZES[size], BUTTON_VARIANTS[variant], className)}>
      {Icon && <Icon aria-hidden className="size-4" />}
      {children}
    </Link>
  );
}

/* ---------------------------------- Card ---------------------------------- */

export function Card({
  hover = false,
  className,
  children,
  ...props
}: { hover?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-muted bg-surface/95 backdrop-blur-xs shadow-card",
        hover && "transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover hover:border-indigo-200/80 dark:hover:border-indigo-900/60",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon: Icon,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 border-b border-border-muted px-5 py-4", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <Icon aria-hidden className="size-4.5" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* -------------------------------- StatCard -------------------------------- */

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "indigo",
  className,
  href,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon: LucideIcon;
  tone?: BadgeTone;
  className?: string;
  href?: string;
}) {
  const content = (
    <Card hover className={cn("flex items-start gap-4 p-5", href && "transition-transform hover:-translate-y-0.5", className)}>
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl shadow-xs",
          BADGE_TONES[tone],
        )}
      >
        <Icon aria-hidden className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

/* ------------------------------- PageHeader -------------------------------- */

export function PageHeader({
  title,
  subtitle,
  actions,
  icon: Icon,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <Icon aria-hidden className="size-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* -------------------------------- EmptyState ------------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="bg-dot-grid relative flex size-14 items-center justify-center rounded-2xl bg-indigo-50/60 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400">
        <Icon aria-hidden className="size-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

/* --------------------------------- Avatar ---------------------------------- */

const AVATAR_TONES: BadgeTone[] = ["indigo", "emerald", "purple", "amber", "pink", "cyan"];

const AVATAR_GRADIENTS: Partial<Record<BadgeTone, string>> = {
  indigo: "from-indigo-500 to-violet-600",
  emerald: "from-emerald-500 to-teal-600",
  purple: "from-purple-500 to-fuchsia-600",
  amber: "from-amber-500 to-orange-600",
  pink: "from-pink-500 to-rose-600",
  cyan: "from-sky-500 to-cyan-600",
};

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const tone = AVATAR_TONES[Math.abs([...name].reduce((acc, ch) => acc + (ch.charCodeAt(0) % 30), 0)) % AVATAR_TONES.length];
  const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg" };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-inner",
        AVATAR_GRADIENTS[tone] ?? AVATAR_GRADIENTS.indigo,
        sizes[size],
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* -------------------------------- Divider --------------------------------- */

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border-muted", className)} />;
}