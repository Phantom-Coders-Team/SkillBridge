"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Download,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Shield,
  Smartphone,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { SessionUser } from "@/lib/types";

export function SettingsClient({ user }: { user: SessionUser }) {
  // Accordion active sections
  const [openSection, setOpenSection] = useState<string | null>("notifications");

  // Notification toggles
  const [notifs, setNotifs] = useState({
    internshipMatches: true,
    pitchAlerts: true,
    decayReminders: true,
    weeklyDigest: false,
  });

  // Password state
  const [passwordState, setPasswordState] = useState({ current: "", newPass: "", confirm: "" });
  const [passMsg, setPassMsg] = useState<string | null>(null);

  // Security toggles
  const [twoFactor, setTwoFactor] = useState(false);

  // Devices list
  const [devices, setDevices] = useState([
    { id: "1", name: "Windows PC · Chrome 128", location: "New Delhi, India", current: true, time: "Active now" },
    { id: "2", name: "iPhone 15 Pro · Mobile Safari", location: "Bengaluru, India", current: false, time: "2 hours ago" },
  ]);
  const [deviceMsg, setDeviceMsg] = useState<string | null>(null);

  function toggleAccordion(section: string) {
    setOpenSection((prev) => (prev === section ? null : section));
  }

  function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordState.current || !passwordState.newPass) {
      setPassMsg("Please fill in all password fields.");
      return;
    }
    if (passwordState.newPass !== passwordState.confirm) {
      setPassMsg("New passwords do not match.");
      return;
    }
    setPassMsg("Password updated successfully!");
    setPasswordState({ current: "", newPass: "", confirm: "" });
  }

  function handleSignOutOtherDevices() {
    setDevices((prev) => prev.filter((d) => d.current));
    setDeviceMsg("All other devices signed out successfully.");
  }

  return (
    <div className="mt-6 space-y-4">
      {/* 1. Notifications Accordion */}
      <Card className="overflow-hidden border-border-muted p-0 shadow-card">
        <button
          onClick={() => toggleAccordion("notifications")}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Bell className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage communication preferences and alert triggers</p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-5 text-slate-400 transition-transform duration-200",
              openSection === "notifications" && "rotate-180 text-indigo-600",
            )}
          />
        </button>

        {openSection === "notifications" && (
          <div className="border-t border-border-muted bg-surface px-5 py-4">
            <div className="space-y-3.5 divide-y divide-border-muted">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Opportunity & Internship Matches</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Get notified when new postings match your verified skills</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifs.internshipMatches}
                  onChange={(e) => setNotifs({ ...notifs, internshipMatches: e.target.checked })}
                  className="size-4.5 rounded border-border-muted text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Reverse Placement & Recruiter Pitches</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Instant alerts when an industry recruiter pitches an offer</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifs.pitchAlerts}
                  onChange={(e) => setNotifs({ ...notifs, pitchAlerts: e.target.checked })}
                  className="size-4.5 rounded border-border-muted text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Skill Decay & Re-Certification Reminders</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Alerts when verified skill badges approach the 90-day threshold</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifs.decayReminders}
                  onChange={(e) => setNotifs({ ...notifs, decayReminders: e.target.checked })}
                  className="size-4.5 rounded border-border-muted text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Weekly Skill Bridge Digest</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Curated weekly summary of campus challenges and mentor sessions</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifs.weeklyDigest}
                  onChange={(e) => setNotifs({ ...notifs, weeklyDigest: e.target.checked })}
                  className="size-4.5 rounded border-border-muted text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 2. Password Accordion */}
      <Card className="overflow-hidden border-border-muted p-0 shadow-card">
        <button
          onClick={() => toggleAccordion("password")}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <KeyRound className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Password</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your account password and authentication credentials</p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-5 text-slate-400 transition-transform duration-200",
              openSection === "password" && "rotate-180 text-amber-600",
            )}
          />
        </button>

        {openSection === "password" && (
          <div className="border-t border-border-muted bg-surface px-5 py-4">
            <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordState.current}
                  onChange={(e) => setPasswordState({ ...passwordState, current: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordState.newPass}
                  onChange={(e) => setPasswordState({ ...passwordState, newPass: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordState.confirm}
                  onChange={(e) => setPasswordState({ ...passwordState, confirm: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500 dark:text-slate-100"
                />
              </div>

              {passMsg && (
                <p
                  className={cn(
                    "rounded-lg p-2.5 text-xs font-medium",
                    passMsg.includes("success")
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
                  )}
                >
                  {passMsg}
                </p>
              )}

              <Button type="submit" className="gap-1.5">
                <Lock className="size-4" /> Update Password
              </Button>
            </form>
          </div>
        )}
      </Card>

      {/* 3. Security Accordion */}
      <Card className="overflow-hidden border-border-muted p-0 shadow-card">
        <button
          onClick={() => toggleAccordion("security")}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Shield className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Security</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Two-factor authentication, cryptographic signatures & sessions</p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-5 text-slate-400 transition-transform duration-200",
              openSection === "security" && "rotate-180 text-emerald-600",
            )}
          />
        </button>

        {openSection === "security" && (
          <div className="border-t border-border-muted bg-surface px-5 py-4">
            <div className="space-y-4 divide-y divide-border-muted">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Secure sign-in with Google Authenticator or TOTP app</p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="size-4.5 rounded border-border-muted text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Cryptographic Attestation Verification</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All signed proofs of work are anchored with SHA-256 block hashes and verifiable via public QR tokens.
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="size-3.5" /> Zero-Trust Dual-Attestation Active
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 4. Manage Account Accordion */}
      <Card className="overflow-hidden border-border-muted p-0 shadow-card">
        <button
          onClick={() => toggleAccordion("account")}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <UserCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Manage Account</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Email addresses, data export & account controls</p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-5 text-slate-400 transition-transform duration-200",
              openSection === "account" && "rotate-180 text-sky-600",
            )}
          />
        </button>

        {openSection === "account" && (
          <div className="border-t border-border-muted bg-surface px-5 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border-muted p-3.5">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Primary Account Email</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.email}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Verified
                </span>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Data & Compliance</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Download a copy of your verified portfolio items, assessment scores, and token ledger transactions (DPDP Act compliant).
                </p>
                <Button variant="outline" className="mt-2.5 gap-1.5 text-xs">
                  <Download className="size-3.5" /> Export My Data (JSON)
                </Button>
              </div>

              <div className="border-t border-border-muted pt-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Danger Zone</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Deactivating your account will disable your Placement Readiness Index (PRI) from reverse placement drives.
                </p>
                <Button variant="danger" className="mt-2.5 gap-1.5 text-xs">
                  <Trash2 className="size-3.5" /> Deactivate Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 5. Manage Devices Accordion */}
      <Card className="overflow-hidden border-border-muted p-0 shadow-card">
        <button
          onClick={() => toggleAccordion("devices")}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
              <Laptop className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Manage Devices</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Review signed-in devices and active browser sessions</p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-5 text-slate-400 transition-transform duration-200",
              openSection === "devices" && "rotate-180 text-violet-600",
            )}
          />
        </button>

        {openSection === "devices" && (
          <div className="border-t border-border-muted bg-surface px-5 py-4">
            <div className="space-y-3">
              {devices.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl border border-border-muted p-3.5">
                  <div className="flex items-center gap-3">
                    {d.name.includes("iPhone") ? (
                      <Smartphone className="size-5 text-slate-400" />
                    ) : (
                      <Laptop className="size-5 text-slate-400" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{d.name}</p>
                        {d.current && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            This Device
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {d.location} · {d.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {deviceMsg && (
                <p className="rounded-lg bg-emerald-50 p-2.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {deviceMsg}
                </p>
              )}

              {devices.length > 1 && (
                <Button variant="outline" onClick={handleSignOutOtherDevices} className="gap-1.5 text-xs text-red-600 dark:text-red-400">
                  <LogOut className="size-3.5" /> Sign Out All Other Devices
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
