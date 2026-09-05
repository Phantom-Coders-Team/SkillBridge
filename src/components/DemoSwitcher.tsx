"use client";

import { useState } from "react";
import { Sparkles, GraduationCap, Building2, BookOpen, ShieldCheck, ChevronUp, ChevronDown, Check } from "lucide-react";
import type { Role } from "@/lib/types";
import { ALL_INDUSTRY_PARTNERS } from "@/lib/partnersData";

interface PersonaOption {
  key: "student" | "industry" | "academician" | "institution";
  role: Role;
  name: string;
  label: string;
  badge: string;
  icon: typeof GraduationCap;
  color: string;
}

const PERSONAS: PersonaOption[] = [
  {
    key: "student",
    role: "STUDENT",
    name: "Aarav Sharma",
    label: "Student Persona",
    badge: "CS Dept · 4th Yr",
    icon: GraduationCap,
    color: "bg-indigo-500 text-white",
  },
  {
    key: "industry",
    role: "INDUSTRY",
    name: "Infosys Campus Lead",
    label: "Industry Recruiter",
    badge: "Hiring & Projects",
    icon: Building2,
    color: "bg-emerald-500 text-white",
  },
  {
    key: "academician",
    role: "ACADEMICIAN",
    name: "Dr. Rajesh Kumar",
    label: "Academician / Mentor",
    badge: "Lab & Sabbaticals",
    icon: BookOpen,
    color: "bg-purple-500 text-white",
  },
  {
    key: "institution",
    role: "INSTITUTION",
    name: "Dr. Lakshmi Narayanan",
    label: "Institution TPO",
    badge: "Placement & Analytics",
    icon: ShieldCheck,
    color: "bg-amber-500 text-white",
  },
];

export function DemoSwitcher({ currentRole }: { currentRole?: Role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const handleSwitch = async (persona: PersonaOption) => {
    setSwitching(persona.key);
    try {
      const res = await fetch("/api/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: persona.key }),
      });

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        console.error("Failed to switch persona");
      }
    } catch (err) {
      console.error("Demo switch error:", err);
    } finally {
      setSwitching(null);
      setIsOpen(false);
    }
  };

  const handleSwitchEmail = async (email: string, keyName: string) => {
    setSwitching(keyName);
    try {
      const res = await fetch("/api/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        console.error("Failed to switch persona");
      }
    } catch (err) {
      console.error("Demo switch error:", err);
    } finally {
      setSwitching(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 font-sans select-none">
      {isOpen && (
        <div className="w-80 rounded-2xl border border-border-muted bg-surface/95 backdrop-blur-md p-3.5 shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-border-muted pb-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="size-3.5" />
              <span>SIH Demo Persona Switcher</span>
            </div>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
              1-Click Demo
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 px-1 leading-snug">
            Switch stakeholder view instantly for the hackathon jury presentation:
          </p>

          <div className="flex flex-col gap-1.5">
            {PERSONAS.map((p) => {
              const isActive = currentRole === p.role;
              const isPending = switching === p.key;
              const Icon = p.icon;

              return (
                <button
                  key={p.key}
                  type="button"
                  disabled={switching !== null}
                  onClick={() => handleSwitch(p)}
                  className={`flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-semibold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  } ${isPending ? "opacity-60 cursor-wait" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${p.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{p.label} · {p.badge}</span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Check className="size-3" /> Active
                    </span>
                  ) : isPending ? (
                    <span className="text-[10px] text-slate-400 animate-pulse">Switching...</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Switch to ANY Industry Partner */}
          <div className="mt-2 pt-2 border-t border-border-muted">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Building2 className="size-3 text-emerald-500" />
                Switch to Specific Industry Partner:
              </span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">19 Partners</span>
            </div>
            <select
              disabled={switching !== null}
              onChange={(e) => {
                if (e.target.value) {
                  handleSwitchEmail(e.target.value, "industry");
                }
              }}
              defaultValue=""
              className="w-full text-xs rounded-lg border border-border-muted bg-surface-subtle p-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="" disabled>
                Select company (e.g. Google, NVIDIA, AWS)...
              </option>
              {ALL_INDUSTRY_PARTNERS.map((partner) => (
                <option key={partner.email} value={partner.email}>
                  {partner.name} ({partner.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-indigo-200/80 dark:border-indigo-800/80 bg-surface/90 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Quickly switch between Student, Industry, Academician, and TPO views for demo"
      >
        <span className="relative flex size-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
        </span>
        <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
          Demo: {currentRole || "Persona"}
        </span>
        {isOpen ? <ChevronDown className="size-3.5 text-slate-400" /> : <ChevronUp className="size-3.5 text-slate-400" />}
      </button>
    </div>
  );
}
