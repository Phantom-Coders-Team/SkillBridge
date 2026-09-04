"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GraduationCap, Menu, X, ChevronLeft, ChevronRight, Sparkles, User, Settings } from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/types";
import { NAV_ITEMS } from "@/lib/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { Avatar } from "@/components/ui";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/cn";

function isActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  user,
  pathname,
  collapsed = false,
  onNavigate,
}: {
  user: SessionUser;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const items = NAV_ITEMS[user.role] ?? NAV_ITEMS.INSTITUTIONS ?? [];
  return (
    <nav className={cn("flex-1 space-y-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}>
      {!collapsed && (
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Workspace
        </p>
      )}
      {items.map((item) => {
        const active = isActive(item.href, pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer select-none",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
              active
                ? "bg-indigo-50/90 text-indigo-700 shadow-xs dark:bg-indigo-500/15 dark:text-indigo-300 font-semibold"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200",
            )}
          >
            <Icon
              aria-hidden
              className={cn(
                "size-5 shrink-0 transition-colors",
                active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300",
              )}
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && active && <span className="ml-auto size-1.5 rounded-full bg-indigo-500 shadow-xs dark:bg-indigo-400" />}
          </Link>
        );
      })}
    </nav>
  );
}

function UserAvatar({ user, size = "sm" }: { user: SessionUser; size?: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "size-8 text-xs" : "size-10 text-sm";
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className={`${sizeClasses} rounded-full object-cover ring-2 ring-white dark:ring-slate-800`}
      />
    );
  }
  return <Avatar name={user.name} size={size} />;
}

function Brand({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  if (collapsed) {
    return (
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-border-muted px-2">
        <Link
          href="/dashboard"
          className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm transition-transform hover:scale-105"
          title="Skill Bridge"
        >
          <GraduationCap aria-hidden className="size-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-muted px-4">
      <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
          <GraduationCap aria-hidden className="size-5" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Skill Bridge</span>
          <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Academia × Industry</span>
        </span>
      </Link>
      {onToggle && (
        <button
          onClick={onToggle}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <ChevronLeft className="size-4.5" />
        </button>
      )}
    </div>
  );
}

function Sidebar({
  user,
  collapsed = false,
  onToggle,
}: {
  user: SessionUser;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <Brand collapsed={collapsed} onToggle={onToggle} />
      <NavList user={user} pathname={pathname} collapsed={collapsed} />
      <div className="border-t border-border-muted p-2.5">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-xl py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60",
            collapsed ? "justify-center px-0" : "px-2",
          )}
          title={collapsed ? `${user.name} (${ROLE_LABELS[user.role] ?? user.role})` : undefined}
        >
          <UserAvatar user={user} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{ROLE_LABELS[user.role] ?? user.role}</p>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const items = NAV_ITEMS[user.role] ?? NAV_ITEMS.INSTITUTIONS ?? [];
  const currentItem = items.find((item) => isActive(item.href, pathname));

  return (
    <div className="flex min-h-screen bg-[--background]">
      {/* Desktop sidebar with collapse/expand */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-border-muted bg-surface transition-all duration-300 ease-in-out lg:block",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] dark:bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="animate-pop-in absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-xl dark:shadow-2xl">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <Sidebar user={user} collapsed={false} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border-muted bg-surface/85 px-4 backdrop-blur-md sm:px-6 dark:bg-surface/90">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile hamburger menu */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 lg:hidden"
            >
              <Menu aria-hidden className="size-5" />
            </button>

            {/* Outside Expand Button: Only visible when sidebar is collapsed */}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="hidden size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:flex"
              >
                <ChevronRight className="size-5" />
              </button>
            )}

            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{currentItem?.label ?? "Dashboard"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back, {user.name.split(" ")[0]}</p>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                <GraduationCap aria-hidden className="size-4.5" />
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Skill Bridge</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span
              className={cn(
                "hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex",
                ROLE_COLORS[user.role] ?? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
              )}
            >
              {ROLE_LABELS[user.role] ?? user.role}
            </span>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="User profile menu"
                className="flex cursor-pointer items-center gap-2 rounded-full border border-transparent p-1 transition-all hover:border-border-muted hover:shadow-xs focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <UserAvatar user={user} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
                  <div className="animate-pop-in absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-border-muted bg-surface p-2.5 shadow-pop">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      <span
                        className={cn(
                          "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                          ROLE_COLORS[user.role] ?? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
                        )}
                      >
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </div>

                    <div className="my-1.5 h-px bg-border-muted" />

                    <div className="space-y-1 py-1">
                      {/* 1. My Profile at the top */}
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <User className="size-4 shrink-0 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      {/* 2. Skill Sync in the middle (for students) */}
                      {user.role === "STUDENT" && (
                        <Link
                          href="/sync"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                        >
                          <Sparkles className="size-4 shrink-0 text-indigo-500" />
                          <span>Sync Skills (Git & DPI)</span>
                        </Link>
                      )}

                      {/* 3. Settings below */}
                      <Link
                        href="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Settings className="size-4 shrink-0 text-slate-400" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="my-1.5 h-px bg-border-muted" />

                    <div className="px-1.5 py-1">
                      <LogoutButton />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <footer className="border-t border-border-muted py-5 text-center text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Skill Bridge — Academia-Industry Collaboration Portal
        </footer>
      </div>
    </div>
  );
}