"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { GraduationCap, Menu, X, Sun, Moon, Monitor } from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/types";
import { NAV_ITEMS } from "@/lib/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/cn";

function isActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const current = resolvedTheme ?? theme ?? "light";

  return (
    <button
      onClick={() => setTheme(current === "dark" ? "light" : current === "light" ? "system" : "dark")}
      aria-label="Toggle theme"
      className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
    >
      {!mounted ? <Monitor className="size-4" /> : current === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

function NavList({ user, pathname, onNavigate }: { user: SessionUser; pathname: string; onNavigate?: () => void }) {
  const items = NAV_ITEMS[user.role];
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Workspace
      </p>
      {items.map((item) => {
        const active = isActive(item.href, pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200",
            )}
          >
            <Icon
              aria-hidden
              className={cn(
                "size-4.5 shrink-0 transition-colors",
                active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300",
              )}
            />
            <span className="truncate">{item.label}</span>
            {active && <span className="ml-auto size-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />}
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

function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <Brand />
      <NavList user={user} pathname={pathname} />
      <div className="border-t border-border-muted p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                <UserAvatar user={user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{ROLE_LABELS[user.role]}</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex h-16 shrink-0 items-center gap-3 border-b border-border-muted px-5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
        <GraduationCap aria-hidden className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Skill Bridge</span>
        <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Academia × Industry</span>
      </span>
    </Link>
  );
}

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentItem = NAV_ITEMS[user.role].find((item) => isActive(item.href, pathname));

  return (
    <div className="flex min-h-screen bg-[--background]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border-muted bg-surface lg:block">
        <Sidebar user={user} />
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
            <Sidebar user={user} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border-muted bg-surface/85 px-4 backdrop-blur-md sm:px-6 dark:bg-surface/90">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 lg:hidden"
            >
              <Menu aria-hidden className="size-5" />
            </button>
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
                ROLE_COLORS[user.role],
              )}
            >
              {ROLE_LABELS[user.role]}
            </span>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full border border-transparent p-1 transition-colors hover:border-border-muted"
              >
          <UserAvatar user={user} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
                  <div className="animate-pop-in absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-border-muted bg-surface p-2 shadow-pop">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-border-muted" />
                    <div className="px-3 py-2">
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