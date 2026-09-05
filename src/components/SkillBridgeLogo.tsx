import React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface SkillBridgeLogoProps {
  /**
   * Predefined size presets for the logo:
   * - 'sm': h-8 (32px tall, ~54px wide)
   * - 'md': h-10 (40px tall, ~68px wide)
   * - 'lg': h-12 (48px tall, ~82px wide)
   * - 'xl': h-16 (64px tall, ~108px wide)
   */
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  imgClassName?: string;
  alt?: string;
}

const SIZE_CONFIG = {
  sm: "h-8 sm:h-9 w-auto",
  md: "h-9 sm:h-10 w-auto",
  lg: "h-11 sm:h-12 w-auto",
  xl: "h-14 sm:h-16 w-auto",
};

export function SkillBridgeLogo({
  size = "md",
  className,
  imgClassName,
  alt = "SkillBridge Logo",
}: SkillBridgeLogoProps) {
  const sizeClass = SIZE_CONFIG[size] ?? SIZE_CONFIG.md;

  return (
    <img
      src="/logo.svg"
      alt={alt}
      className={cn(
        "shrink-0 object-contain select-none transition-transform duration-200",
        sizeClass,
        className,
        imgClassName
      )}
      loading="eager"
      decoding="async"
    />
  );
}

export interface SkillBridgeWordmarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
  hasSpace?: boolean;
}

const WORDMARK_SIZES = {
  sm: {
    title: "text-sm sm:text-base",
    sub: "text-[9px]",
  },
  md: {
    title: "text-base sm:text-lg",
    sub: "text-[10px]",
  },
  lg: {
    title: "text-lg sm:text-xl",
    sub: "text-[11px]",
  },
  xl: {
    title: "text-xl sm:text-2xl",
    sub: "text-xs",
  },
};

export function SkillBridgeWordmark({
  size = "md",
  showSubtitle = true,
  subtitle = "Academia × Industry",
  className,
  hasSpace = false,
}: SkillBridgeWordmarkProps) {
  const s = WORDMARK_SIZES[size] ?? WORDMARK_SIZES.md;

  return (
    <div className={cn("flex flex-col leading-tight select-none", className)}>
      <span className={cn("font-extrabold tracking-tight text-slate-900 dark:text-white", s.title)}>
        <span>Skill</span>
        {hasSpace && <span className="inline">&nbsp;</span>}
        <span className="bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-purple-300 drop-shadow-xs">
          Bridge
        </span>
      </span>
      {showSubtitle && subtitle && (
        <span className={cn("font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400", s.sub)}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

export interface SkillBridgeBrandProps {
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  subtitle?: string;
  href?: string;
  className?: string;
}

export function SkillBridgeBrand({
  size = "md",
  showSubtitle = true,
  subtitle = "Academia × Industry",
  href,
  className,
}: SkillBridgeBrandProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      <SkillBridgeLogo size={size} className="group-hover:scale-105" />
      <SkillBridgeWordmark size={size} showSubtitle={showSubtitle} subtitle={subtitle} />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}

export default SkillBridgeLogo;
