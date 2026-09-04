"use client";

import { useState } from "react";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  KeyRound,
  Laptop,
  Loader2,
  Lock,
  LogOut,
  QrCode,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { SessionUser } from "@/lib/types";
import {
  initTwoFactorSetupAction,
  confirmAndEnableTwoFactorAction,
  disableTwoFactorAction,
  TwoFactorSetupData,
} from "./actions";

export function SettingsClient({
  user,
  initialTwoFactor = false,
}: {
  user: SessionUser;
  initialTwoFactor?: boolean;
}) {
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

  // Security 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactor);
  const [setupStep, setSetupStep] = useState<"idle" | "scanning" | "backupCodes" | "disabling">("idle");
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [confirmToken, setConfirmToken] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disableToken, setDisableToken] = useState("");
  const [loading2fa, setLoading2fa] = useState(false);
  const [error2fa, setError2fa] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);


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
              {/* 2FA Status & Controls */}
              <div className="pt-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</p>
                      {twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="size-3.5" /> Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Secure sign-in with Google Authenticator or TOTP app
                    </p>
                  </div>

                  {!twoFactorEnabled ? (
                    <Button
                      onClick={async () => {
                        setLoading2fa(true);
                        setError2fa(null);
                        try {
                          const data = await initTwoFactorSetupAction();
                          setSetupData(data);
                          setSetupStep("scanning");
                        } catch (err: any) {
                          setError2fa(err.message || "Failed to initialize 2FA setup");
                        } finally {
                          setLoading2fa(false);
                        }
                      }}
                      disabled={loading2fa || setupStep === "scanning"}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 gap-1.5"
                    >
                      {loading2fa ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
                      <span>Setup Google 2FA</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setSetupStep("disabling")}
                      variant="secondary"
                      className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 shrink-0 gap-1.5"
                    >
                      Disable 2FA
                    </Button>
                  )}
                </div>

                {error2fa && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-xs">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{error2fa}</span>
                  </div>
                )}

                {/* STEP 1: SCAN QR CODE & ENTER CONFIRMATION CODE */}
                {setupStep === "scanning" && setupData && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <QrCode className="size-4 text-emerald-500" />
                        Scan QR Code with Authenticator App
                      </h3>
                      <button
                        onClick={() => {
                          setSetupStep("idle");
                          setSetupData(null);
                          setError2fa(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                        {/* QR Code Image */}
                        <img src={setupData.qrCodeUrl} alt="Google Authenticator QR Code" className="size-44 object-contain rounded" />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Scan with Google Authenticator / Authy</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Or enter secret key manually:
                          </label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white dark:bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 break-all select-all">
                              {setupData.secret}
                            </code>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(setupData.secret);
                                setCopiedSecret(true);
                                setTimeout(() => setCopiedSecret(false), 2000);
                              }}
                            >
                              {copiedSecret ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Enter 6-Digit Authenticator Code to Confirm:
                          </label>
                          <input
                            type="text"
                            value={confirmToken}
                            onChange={(e) => setConfirmToken(e.target.value)}
                            placeholder="000000"
                            maxLength={6}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-center text-lg font-mono tracking-widest text-slate-900 dark:text-slate-100 outline-none"
                          />
                        </div>

                        <Button
                          onClick={async () => {
                            setLoading2fa(true);
                            setError2fa(null);
                            try {
                              const res = await confirmAndEnableTwoFactorAction(setupData.secret, confirmToken);
                              if (res.success && res.backupCodes) {
                                setTwoFactorEnabled(true);
                                setBackupCodes(res.backupCodes);
                                setSetupStep("backupCodes");
                              } else {
                                setError2fa(res.error || "Invalid 2FA verification code.");
                              }
                            } catch (err: any) {
                              setError2fa(err.message || "Failed to confirm 2FA");
                            } finally {
                              setLoading2fa(false);
                            }
                          }}
                          disabled={loading2fa || confirmToken.trim().length !== 6}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          {loading2fa ? <Loader2 className="size-4 animate-spin" /> : "Verify & Activate 2FA"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: DISPLAY EMERGENCY BACKUP CODES */}
                {setupStep === "backupCodes" && (
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                          2FA Activated Successfully!
                        </h3>
                      </div>
                      <button onClick={() => setSetupStep("idle")} className="text-slate-400 hover:text-slate-600">
                        <X className="size-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Save these 8 single-use emergency backup codes in a safe place. If you lose your phone, you can use one of these codes to log in.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2">
                      {backupCodes.map((code, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-lg py-1.5 px-2.5 text-center font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {code}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(backupCodes.join("\n"));
                          setCopiedSecret(true);
                          setTimeout(() => setCopiedSecret(false), 2000);
                        }}
                        className="gap-1.5"
                      >
                        {copiedSecret ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                        <span>Copy Codes</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSetupStep("idle")}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white ml-auto"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}

                {/* DISABLE 2FA CONFIRMATION */}
                {setupStep === "disabling" && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">Disable Two-Factor Authentication</h3>
                      <button onClick={() => setSetupStep("idle")} className="text-slate-400 hover:text-slate-600">
                        <X className="size-4" />
                      </button>
                    </div>
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      Enter your current 6-digit authenticator code to confirm disabling 2FA:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={disableToken}
                        onChange={(e) => setDisableToken(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="flex-1 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-slate-900 dark:text-slate-100 outline-none"
                      />
                      <Button
                        onClick={async () => {
                          setLoading2fa(true);
                          setError2fa(null);
                          try {
                            const res = await disableTwoFactorAction(disableToken);
                            if (res.success) {
                              setTwoFactorEnabled(false);
                              setSetupStep("idle");
                              setDisableToken("");
                            } else {
                              setError2fa(res.error || "Invalid 2FA token.");
                            }
                          } catch (err: any) {
                            setError2fa(err.message || "Failed to disable 2FA");
                          } finally {
                            setLoading2fa(false);
                          }
                        }}
                        disabled={loading2fa || !disableToken.trim()}
                        className="bg-rose-600 hover:bg-rose-500 text-white gap-1.5"
                      >
                        {loading2fa ? <Loader2 className="size-4 animate-spin" /> : "Confirm Disable"}
                      </Button>
                    </div>
                  </div>
                )}
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
