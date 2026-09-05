"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  LineChart,
  AreaChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Briefcase,
  TrendingUp,
  Building2,
  Users,
  Award,
  IndianRupee,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  MapPin,
  Handshake,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Badge, Card, type BadgeTone } from "@/components/ui";
import {
  YEARLY_PLACEMENT_DATA,
  matchCorporatePartner,
  type YearlyPlacementData,
  type CompanyPlacementRecord,
} from "@/lib/placementYearlyData";

const STATUS_TONE: Record<string, BadgeTone> = {
  PITCHED: "gray",
  SHORTLISTED: "blue",
  OFFERED: "green",
  ACCEPTED: "emerald",
  REJECTED: "red",
};

const CATEGORY_TONE: Record<string, string> = {
  "Super Dream":
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60",
  Dream:
    "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60",
  "Core / R&D":
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
  "Mass / IT Services":
    "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

export interface LivePitchRecord {
  id: string;
  studentName: string;
  companyName: string;
  roleDetails: string | null;
  stipend: number | null;
  status: string;
}

export interface CorporatePartnerItem {
  id: string;
  name: string;
  companyName: string;
  location: string | null;
  challengesCount: number;
}

interface PlacementTrackerClientProps {
  livePitches: LivePitchRecord[];
  corporatePartners?: CorporatePartnerItem[];
}

export function PlacementTrackerClient({
  livePitches,
  corporatePartners = [],
}: PlacementTrackerClientProps) {
  // Persistent data state initialized with default data to match SSR exactly
  const [yearlyData, setYearlyData] = useState<YearlyPlacementData[]>(YEARLY_PLACEMENT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  const [selectedYear, setSelectedYear] = useState<string>("2025-26");
  const [chartView, setChartView] = useState<"combined" | "count" | "percentage" | "salary">("combined");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [notification, setNotification] = useState<string | null>(null);

  // Helper to match corporate partners with placement companies
  const getMatchedPartner = (companyName: string): string | null => {
    const directMatch = matchCorporatePartner(companyName);
    if (directMatch) return directMatch;
    if (corporatePartners && corporatePartners.length > 0) {
      const found = corporatePartners.find((p) => {
        const pName = p.companyName.toLowerCase();
        const cName = companyName.toLowerCase();
        return pName === cName || cName.includes(pName) || pName.includes(cName);
      });
      if (found) return found.companyName;
    }
    return null;
  };

  // Sync search param from URL if navigated from /partners
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const searchVal = params.get("search");
        if (searchVal) setSearchQuery(searchVal);
      } catch {}
    }
  }, []);

  // Modal State for Post & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<{
    year: string;
    originalCompanyName: string;
    company: CompanyPlacementRecord;
  } | null>(null);

  // Form Fields
  const [formYear, setFormYear] = useState("2025-26");
  const [customYear, setCustomYear] = useState("");
  const [isCustomYear, setIsCustomYear] = useState(false);
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formCategory, setFormCategory] = useState<CompanyPlacementRecord["category"]>("Super Dream");
  const [formPlacedCount, setFormPlacedCount] = useState<number>(15);
  const [formRoles, setFormRoles] = useState("");
  const [formCtcRange, setFormCtcRange] = useState("");
  const [formAvgCtcLpa, setFormAvgCtcLpa] = useState<number>(25.0);
  const [formLocation, setFormLocation] = useState("");

  // Load from localStorage on client mount after initial hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem("skillbridge_yearly_placement_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setYearlyData(parsed);
        }
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  // Persist to localStorage on data change only after initial client mount
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("skillbridge_yearly_placement_data", JSON.stringify(yearlyData));
    } catch {}
  }, [yearlyData, isLoaded]);

  // Current year record
  const currentYearData = useMemo(() => {
    return (
      yearlyData.find((d) => d.year === selectedYear) ||
      yearlyData[0] ||
      YEARLY_PLACEMENT_DATA[0]
    );
  }, [selectedYear, yearlyData]);

  // Count corporate partners in current view
  const corporatePartnersInBatchCount = useMemo(() => {
    const baseList =
      selectedYear === "all"
        ? yearlyData.flatMap((yd) => yd.companies)
        : currentYearData?.companies || [];
    return baseList.filter((c) => Boolean(getMatchedPartner(c.companyName))).length;
  }, [selectedYear, yearlyData, currentYearData, corporatePartners]);

  // Flattened companies for "All Years" or current year
  const activeCompanies = useMemo(() => {
    let list: (CompanyPlacementRecord & { yearTag: string })[] = [];

    if (selectedYear === "all") {
      yearlyData.forEach((yd) => {
        yd.companies.forEach((c) => {
          list.push({ ...c, yearTag: yd.year });
        });
      });
    } else {
      (currentYearData.companies || []).forEach((c) => {
        list.push({ ...c, yearTag: currentYearData.year });
      });
    }

    if (categoryFilter === "Corporate Partners") {
      list = list.filter((c) => Boolean(getMatchedPartner(c.companyName)));
    } else if (categoryFilter !== "All") {
      list = list.filter((c) => c.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.roles.some((r) => r.toLowerCase().includes(q)) ||
          c.location.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedYear, currentYearData, categoryFilter, searchQuery, yearlyData, corporatePartners]);

  // Metrics calculation
  const totalEligibleCurrent = currentYearData?.eligibleStudents || 500;
  const totalPlacedCurrent = currentYearData?.placedStudents || 0;
  const currentRate = currentYearData?.placementRate || 0;
  const avgPackage = currentYearData?.avgCtcLpa || 0;
  const highestPackage = currentYearData?.highestCtcLpa || 0;

  // Chart data sorted chronologically
  const chartData = useMemo(() => {
    return [...yearlyData]
      .reverse()
      .map((d) => ({
        year: d.year,
        placedStudents: d.placedStudents,
        eligibleStudents: d.eligibleStudents,
        unplacedStudents: Math.max(0, d.eligibleStudents - d.placedStudents),
        placementRate: d.placementRate,
        avgCtcLpa: d.avgCtcLpa,
        highestCtcLpa: d.highestCtcLpa,
        companiesVisited: d.companiesVisited,
      }));
  }, [yearlyData]);

  // Open Post New Placement Record Modal
  function handleOpenPost() {
    setEditingRecord(null);
    setFormYear(selectedYear !== "all" ? selectedYear : "2025-26");
    setIsCustomYear(false);
    setCustomYear("");
    setFormCompanyName("");
    setFormCategory("Super Dream");
    setFormPlacedCount(18);
    setFormRoles("Software Development Engineer, Cloud Systems");
    setFormCtcRange("₹28 - ₹42 LPA");
    setFormAvgCtcLpa(32.5);
    setFormLocation("Bengaluru, Karnataka");
    setIsModalOpen(true);
  }

  // Open Edit Placement Record Modal
  function handleOpenEdit(yearTag: string, comp: CompanyPlacementRecord) {
    setEditingRecord({
      year: yearTag,
      originalCompanyName: comp.companyName,
      company: comp,
    });
    setFormYear(yearTag);
    setIsCustomYear(false);
    setCustomYear("");
    setFormCompanyName(comp.companyName);
    setFormCategory(comp.category);
    setFormPlacedCount(comp.placedCount);
    setFormRoles(comp.roles.join(", "));
    setFormCtcRange(comp.ctcRange);
    setFormAvgCtcLpa(comp.avgCtcLpa);
    setFormLocation(comp.location);
    setIsModalOpen(true);
  }

  // Save (Post new or Update existing)
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formCompanyName.trim()) return;

    const targetYear = isCustomYear && customYear.trim() ? customYear.trim() : formYear;

    const initials =
      formCompanyName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "CP";

    const parsedRoles = formRoles
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    const updatedRecord: CompanyPlacementRecord = {
      companyName: formCompanyName.trim(),
      initials,
      category: formCategory,
      placedCount: Math.max(1, Number(formPlacedCount) || 1),
      roles: parsedRoles.length ? parsedRoles : ["Software Engineer"],
      ctcRange: formCtcRange.trim() || `₹${formAvgCtcLpa} LPA`,
      avgCtcLpa: Number(formAvgCtcLpa) || 15.0,
      location: formLocation.trim() || "India",
    };

    setYearlyData((prevData) => {
      let nextData = prevData.map((yd) => ({
        ...yd,
        companies: [...yd.companies],
      }));

      // If editing, remove from original year first
      if (editingRecord) {
        const origYearIndex = nextData.findIndex((d) => d.year === editingRecord.year);
        if (origYearIndex !== -1) {
          nextData[origYearIndex].companies = nextData[origYearIndex].companies.filter(
            (c) => c.companyName.toLowerCase() !== editingRecord.originalCompanyName.toLowerCase()
          );
        }
      }

      // Check if target year exists
      let targetYearIndex = nextData.findIndex((d) => d.year === targetYear);
      if (targetYearIndex === -1) {
        // Create new academic year entry
        const newYearEntry: YearlyPlacementData = {
          year: targetYear,
          academicYear: targetYear,
          eligibleStudents: 550,
          placedStudents: 0,
          placementRate: 0,
          avgCtcLpa: updatedRecord.avgCtcLpa,
          highestCtcLpa: updatedRecord.avgCtcLpa,
          companiesVisited: 0,
          companies: [],
        };
        nextData.unshift(newYearEntry);
        targetYearIndex = 0;
      }

      // Append new/updated record to target year
      nextData[targetYearIndex].companies.push(updatedRecord);

      // Recalculate aggregates for all years
      return nextData.map((yd) => {
        const totalPlaced = yd.companies.reduce((sum, c) => sum + c.placedCount, 0);
        const rate =
          yd.eligibleStudents > 0
            ? Math.min(100, Math.round((totalPlaced / yd.eligibleStudents) * 1000) / 10)
            : 0;
        const totalAvg =
          yd.companies.length > 0
            ? Math.round(
                (yd.companies.reduce((sum, c) => sum + c.avgCtcLpa, 0) / yd.companies.length) * 10
              ) / 10
            : yd.avgCtcLpa;
        const maxCtc =
          yd.companies.length > 0
            ? Math.max(
                ...yd.companies.map((c) => {
                  const num = parseFloat(c.ctcRange.replace(/[^0-9.]/g, ""));
                  return isNaN(num) ? c.avgCtcLpa : Math.max(num, c.avgCtcLpa);
                })
              )
            : yd.highestCtcLpa;

        return {
          ...yd,
          placedStudents: totalPlaced,
          placementRate: rate,
          avgCtcLpa: totalAvg,
          highestCtcLpa: Math.max(maxCtc, yd.highestCtcLpa),
          companiesVisited: yd.companies.length,
        };
      });
    });

    setIsModalOpen(false);
    setSelectedYear(targetYear);
    setNotification(
      editingRecord
        ? `Placement record for "${formCompanyName}" updated successfully!`
        : `New placement record for "${formCompanyName}" added to ${targetYear}!`
    );
    setTimeout(() => setNotification(null), 4000);
  }

  // Delete Record
  function handleDelete(yearTag: string, companyName: string) {
    if (!confirm(`Are you sure you want to delete ${companyName} from ${yearTag} placement records?`)) {
      return;
    }

    setYearlyData((prevData) => {
      return prevData.map((yd) => {
        if (yd.year !== yearTag) return yd;
        const remaining = yd.companies.filter(
          (c) => c.companyName.toLowerCase() !== companyName.toLowerCase()
        );
        const totalPlaced = remaining.reduce((sum, c) => sum + c.placedCount, 0);
        const rate =
          yd.eligibleStudents > 0
            ? Math.min(100, Math.round((totalPlaced / yd.eligibleStudents) * 1000) / 10)
            : 0;
        return {
          ...yd,
          companies: remaining,
          placedStudents: totalPlaced,
          placementRate: rate,
          companiesVisited: remaining.length,
        };
      });
    });

    setNotification(`Deleted ${companyName} from ${yearTag} placement records.`);
    setTimeout(() => setNotification(null), 4000);
  }

  // Reset to default dataset
  function handleResetToDefaults() {
    if (confirm("Reset placement tracker data back to the default institutional baseline?")) {
      setYearlyData(YEARLY_PLACEMENT_DATA);
      try {
        localStorage.removeItem("skillbridge_yearly_placement_data");
      } catch {}
      setNotification("Placement data reset to defaults.");
      setTimeout(() => setNotification(null), 3000);
    }
  }

  // High-Fidelity Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = chartData.find((d) => d.year === label);
      if (!item) return null;

      return (
        <div className="rounded-2xl border border-border-muted/80 bg-surface/95 p-4 shadow-2xl backdrop-blur-xl text-xs min-w-[270px] animate-in fade-in-50 zoom-in-95">
          <div className="flex items-center justify-between border-b border-border-muted pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-600 font-bold text-xs text-white shadow-xs">
                {item.year.slice(0, 4)}
              </span>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Batch {item.year}
                </p>
                <p className="text-[10px] text-slate-400">Academic Placement Cohort</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {item.placementRate}% Placed
            </span>
          </div>

          <div className="space-y-2 text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 font-medium text-indigo-600 dark:text-indigo-400">
                <span className="size-2 rounded-full bg-indigo-500 shadow-xs" />
                Students Placed:
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {item.placedStudents}{" "}
                <span className="font-normal text-slate-400">/ {item.eligibleStudents} pool</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500 shadow-xs" />
                Placement Rate:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {item.placementRate}%
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 font-medium text-purple-600 dark:text-purple-400">
                <span className="size-2 rounded-full bg-purple-500 shadow-xs" />
                Average CTC:
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                ₹{item.avgCtcLpa} LPA
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
                <span className="size-2 rounded-full bg-amber-500 shadow-xs" />
                Highest CTC:
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                ₹{item.highestCtcLpa} LPA
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border-muted pt-2 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="size-3.5 text-slate-400" />
                Recruiters Visited:
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {item.companiesVisited} Corporate Partners
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            {notification}
          </span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* 1. KEY KPI STATS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-border-muted bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <Users className="size-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Students Placed
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                {totalPlacedCurrent}
                <span className="text-xs font-normal text-slate-400"> / {totalEligibleCurrent}</span>
              </p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Batch {currentYearData?.year || selectedYear} eligible pool
          </div>
        </div>

        <div className="rounded-2xl border border-border-muted bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <TrendingUp className="size-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Placement Rate
              </p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {currentRate}%
              </p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Institutional verification rate
          </div>
        </div>

        <div className="rounded-2xl border border-border-muted bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
              <IndianRupee className="size-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Average CTC
              </p>
              <p className="text-xl font-black text-purple-600 dark:text-purple-400">
                ₹{avgPackage} <span className="text-xs font-semibold">LPA</span>
              </p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Median verified offer package
          </div>
        </div>

        <div className="rounded-2xl border border-border-muted bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <Award className="size-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Highest CTC
              </p>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                ₹{highestPackage} <span className="text-xs font-semibold">LPA</span>
              </p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Super Dream verified offer
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border-muted bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
              <Building2 className="size-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Hiring Partners
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                {currentYearData?.companiesVisited || currentYearData?.companies?.length || 0}
              </p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Active corporate recruiters
          </div>
        </div>
      </div>

      {/* 2. PLACEMENT ANALYTICS GRAPHS (COUNT & PERCENTAGE & SALARY) */}
      <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border-muted pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <BarChart3 className="size-4.5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Yearly Placement Trends &amp; Institutional Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical performance tracking student placement volume, percentage success rate, and compensation trajectories across batches.
            </p>
          </div>

          {/* Chart View Toggle Buttons */}
          <div className="inline-flex shrink-0 items-center rounded-xl border border-border-muted bg-surface-subtle p-1 text-xs font-semibold overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setChartView("combined")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                chartView === "combined"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Combined Overview
            </button>
            <button
              type="button"
              onClick={() => setChartView("count")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                chartView === "count"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Student Volume (Cohort)
            </button>
            <button
              type="button"
              onClick={() => setChartView("percentage")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                chartView === "percentage"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Placement Rate (%)
            </button>
            <button
              type="button"
              onClick={() => setChartView("salary")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                chartView === "salary"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              CTC Growth (LPA)
            </button>
          </div>
        </div>

        {/* Executive Growth Ribbon */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-surface-subtle/50 p-3 border border-border-muted/70 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">5-Yr Rate Jump</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">+24.7% Increase</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <Users className="size-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Latest Placed</p>
              <p className="font-bold text-slate-900 dark:text-slate-100">508 / 540 Candidates</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
              <IndianRupee className="size-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Average CTC Surge</p>
              <p className="font-bold text-purple-600 dark:text-purple-400">₹9.2 → ₹16.4 LPA (+78%)</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <Award className="size-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Peak Super Dream</p>
              <p className="font-bold text-amber-600 dark:text-amber-400">₹54.0 LPA Verified</p>
            </div>
          </div>
        </div>

        {/* Chart Rendering Area with Higher Fidelity */}
        <div className="h-[390px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === "combined" ? (
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 15 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.95} />
                    <stop offset="60%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="areaGlowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="currentColor" opacity={0.08} vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={{ stroke: "currentColor", opacity: 0.15 }}
                  tick={{ fill: "currentColor", opacity: 0.75, fontSize: 11, fontWeight: 600 }}
                  dy={8}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", opacity: 0.7, fontSize: 11 }}
                  domain={[0, 600]}
                  dx={-6}
                  label={{ value: "Students Placed", angle: -90, position: "insideLeft", fontSize: 11, fill: "#6366f1" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", opacity: 0.7, fontSize: 11 }}
                  domain={[60, 100]}
                  unit="%"
                  dx={6}
                  label={{ value: "Placement %", angle: 90, position: "insideRight", fontSize: 11, fill: "#10b981" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 14 }}
                  iconType="circle"
                />
                <ReferenceLine
                  yAxisId="right"
                  y={90}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{ value: "90% Benchmark", position: "insideTopRight", fill: "#10b981", fontSize: 10, fontWeight: 600 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="placedStudents"
                  name="Students Placed (Count)"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  barSize={38}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="placementRate"
                  name="Placement Rate Trend"
                  fill="url(#areaGlowGradient)"
                  stroke="none"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="placementRate"
                  name="Placement Success Rate (%)"
                  stroke="#10b981"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: "#10b981", strokeWidth: 2.5, stroke: "#ffffff" }}
                  activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 3, fill: "#ffffff" }}
                />
              </ComposedChart>
            ) : chartView === "count" ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 15 }}>
                <defs>
                  <linearGradient id="placedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="eligibleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="currentColor" opacity={0.08} vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={{ stroke: "currentColor", opacity: 0.15 }}
                  tick={{ fill: "currentColor", opacity: 0.75, fontSize: 11, fontWeight: 600 }}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", opacity: 0.7, fontSize: 11 }}
                  domain={[0, 600]}
                  dx={-6}
                  label={{ value: "Number of Students", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 14 }} iconType="circle" />
                <Bar
                  dataKey="eligibleStudents"
                  name="Total Eligible Cohort Pool"
                  fill="url(#eligibleGradient)"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
                <Bar
                  dataKey="placedStudents"
                  name="Verified Placed Candidates"
                  fill="url(#placedGradient)"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            ) : chartView === "percentage" ? (
              <AreaChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 15 }}>
                <defs>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="60%" stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="currentColor" opacity={0.08} vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={{ stroke: "currentColor", opacity: 0.15 }}
                  tick={{ fill: "currentColor", opacity: 0.75, fontSize: 11, fontWeight: 600 }}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", opacity: 0.7, fontSize: 11 }}
                  domain={[60, 100]}
                  unit="%"
                  dx={-6}
                  label={{ value: "Placement Rate (%)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#10b981" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 14 }} iconType="circle" />
                <ReferenceLine
                  y={90}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{ value: "Tier 1 Target (90%)", position: "insideTopRight", fill: "#10b981", fontSize: 10, fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="placementRate"
                  name="Placement Success Rate (%)"
                  stroke="#10b981"
                  strokeWidth={3.5}
                  fillOpacity={1}
                  fill="url(#rateGradient)"
                  dot={{ r: 5, fill: "#10b981", strokeWidth: 2.5, stroke: "#ffffff" }}
                  activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 3, fill: "#ffffff" }}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 15 }}>
                <defs>
                  <linearGradient id="salaryAvgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="salaryPeakGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="currentColor" opacity={0.08} vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={{ stroke: "currentColor", opacity: 0.15 }}
                  tick={{ fill: "currentColor", opacity: 0.75, fontSize: 11, fontWeight: 600 }}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", opacity: 0.7, fontSize: 11 }}
                  domain={[0, 60]}
                  unit=" LPA"
                  dx={-6}
                  label={{ value: "Compensation (₹ LPA)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#8b5cf6" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 14 }} iconType="circle" />
                <Bar
                  dataKey="avgCtcLpa"
                  name="Average CTC (₹ LPA)"
                  fill="url(#salaryAvgGrad)"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
                <Bar
                  dataKey="highestCtcLpa"
                  name="Highest Super Dream CTC (₹ LPA)"
                  fill="url(#salaryPeakGrad)"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Interactive Batch Selector Cards with Progress Bars */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 border-t border-border-muted pt-4">
          {chartData.map((d) => {
            const isSelected = selectedYear === d.year;
            return (
              <div
                key={d.year}
                onClick={() => setSelectedYear(d.year)}
                className={`rounded-xl p-3 transition-all cursor-pointer border ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20"
                    : "border-border-muted hover:border-indigo-300 hover:bg-surface-subtle"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {d.year}
                  </span>
                  {isSelected && (
                    <span className="size-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  )}
                </div>

                <div className="mt-1.5 flex items-baseline justify-between">
                  <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {d.placedStudents}
                    <span className="text-[10px] font-normal text-slate-400"> / {d.eligibleStudents}</span>
                  </p>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {d.placementRate}%
                  </p>
                </div>

                {/* Visual Progress Mini-Bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      d.placementRate >= 90
                        ? "bg-emerald-500"
                        : d.placementRate >= 80
                        ? "bg-indigo-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${d.placementRate}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Avg ₹{d.avgCtcLpa}L</span>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">{d.companiesVisited} Cos</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. YEARLY WISE STUDENT PLACED IN COMPANY BREAKDOWN + POST / EDIT CONTROLS */}
      <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border-muted pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Company-Wise Student Placements
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detailed breakdown of candidates placed across corporate hiring partners for academic batch{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {selectedYear === "all" ? "All Academic Years" : selectedYear}
              </strong>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Post Placement Record Button */}
            <button
              type="button"
              onClick={handleOpenPost}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Post Placement Record</span>
            </button>

            {/* Reset to Defaults button */}
            <button
              type="button"
              onClick={handleResetToDefaults}
              title="Reset data to initial baseline"
              className="inline-flex items-center gap-1 rounded-xl border border-border-muted bg-surface px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Academic Year Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {yearlyData.map((yd) => (
            <button
              key={yd.year}
              type="button"
              onClick={() => setSelectedYear(yd.year)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedYear === yd.year
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "border border-border-muted text-slate-600 hover:bg-surface-subtle dark:text-slate-400"
              }`}
            >
              {yd.year}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedYear("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedYear === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "border border-border-muted text-slate-600 hover:bg-surface-subtle dark:text-slate-400"
            }`}
          >
            All Years Combined
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company (Google, AWS), role, or location..."
              className="w-full rounded-xl border border-border-muted bg-surface-subtle py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
              <Filter className="size-3" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setCategoryFilter("All")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === "All"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "border border-border-muted bg-surface-subtle text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              All Companies
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("Corporate Partners")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === "Corporate Partners"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300"
              }`}
            >
              <Handshake className="size-3 text-indigo-500" />
              <span>Corporate Partners ({corporatePartnersInBatchCount})</span>
            </button>
            {["Super Dream", "Dream", "Mass / IT Services", "Core / R&D"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "border border-border-muted bg-surface-subtle text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Company Placement Records Cards / Grid */}
        {activeCompanies.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-muted p-8 text-center text-xs text-slate-400">
            No companies matching &ldquo;{searchQuery}&rdquo; in this tier or academic year.
            <div className="mt-3">
              <button
                type="button"
                onClick={handleOpenPost}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="size-3.5" /> Add Placement Record
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCompanies.map((comp, idx) => {
              const baseCount = totalPlacedCurrent > 0 ? totalPlacedCurrent : 1;
              const pctOfBatch = Math.round((comp.placedCount / baseCount) * 100);
              const matchedPartner = getMatchedPartner(comp.companyName);

              return (
                <div
                  key={`${comp.companyName}-${comp.yearTag}-${idx}`}
                  className={`rounded-2xl border bg-surface-subtle/40 p-4 transition-all hover:shadow-sm flex flex-col justify-between ${
                    matchedPartner
                      ? "border-indigo-200/80 dark:border-indigo-800/50 hover:border-indigo-400"
                      : "border-border-muted hover:border-indigo-300 dark:hover:border-indigo-700/60"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-xs text-white shadow-xs">
                          {comp.initials}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {comp.companyName}
                          </h3>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                            <MapPin className="size-3" />
                            {comp.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                            CATEGORY_TONE[comp.category] || ""
                          }`}
                        >
                          {comp.category}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-surface px-1.5 py-0.5 rounded border border-border-muted">
                          {comp.yearTag}
                        </span>
                      </div>
                    </div>

                    {/* Accredited Corporate Partner Badge Banner */}
                    {matchedPartner && (
                      <div className="mb-2.5 flex items-center justify-between rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 px-2.5 py-1 border border-indigo-100 dark:border-indigo-900/40">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                          <Handshake className="size-3 text-indigo-600 dark:text-indigo-400" />
                          Accredited Corporate Partner
                        </span>
                        <Link
                          href={`/partners?search=${encodeURIComponent(matchedPartner)}`}
                          className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
                        >
                          <span>MoU Hub</span>
                          <ExternalLink className="size-2.5" />
                        </Link>
                      </div>
                    )}

                    {/* Students Placed Counter */}
                    <div className="rounded-xl bg-surface p-2.5 border border-border-muted my-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Students Placed:
                        </span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {comp.placedCount} Candidates
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Batch Share: {pctOfBatch}% of total placed</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          Avg ₹{comp.avgCtcLpa} LPA
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${Math.min(100, pctOfBatch * 2.5)}%` }}
                        />
                      </div>
                    </div>

                    {/* Roles Offered */}
                    <div className="space-y-1 my-2">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Recruited Roles:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {comp.roles.map((r) => (
                          <span
                            key={r}
                            className="rounded-md bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTC Package & Action Buttons */}
                  <div className="border-t border-border-muted/80 pt-2.5 mt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">CTC Package:</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{comp.ctcRange}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Corporate Partner Hub Link */}
                      {matchedPartner && (
                        <Link
                          href={`/partners?search=${encodeURIComponent(matchedPartner)}`}
                          title={`View ${matchedPartner} Corporate Partner Profile and Challenges`}
                          className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Handshake className="size-3 text-indigo-600 dark:text-indigo-400" />
                          <span>Partner Hub</span>
                        </Link>
                      )}

                      {/* Edit button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(comp.yearTag, comp)}
                        className="rounded-lg border border-border-muted bg-surface px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 dark:text-slate-300 dark:hover:text-indigo-400 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="size-3" />
                        <span>Edit</span>
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(comp.yearTag, comp.companyName)}
                        title="Delete placement record"
                        className="rounded-lg border border-border-muted bg-surface p-1 text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:text-rose-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ACTIVE LIVE OFFERS & RECENT PITCHES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Live Placement Pitches &amp; Active Offers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time pipeline of student offers currently in motion across recruiters.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="size-3.5" />
            {livePitches.filter((p) => p.status === "OFFERED" || p.status === "ACCEPTED").length} Offers in Motion
          </span>
        </div>

        {livePitches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-muted bg-surface p-8 text-center text-xs text-slate-400">
            No active placement pitches recorded in database.
          </div>
        ) : (
          <Card className="overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border-muted bg-slate-50/70 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Role Details</th>
                    <th className="px-5 py-3">Stipend / Package</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-muted text-xs">
                  {livePitches.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {p.studentName}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {p.companyName}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {p.roleDetails || "Software Engineer Intern"}
                      </td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-300 font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <IndianRupee className="size-3.5 text-slate-400" />
                          {p.stipend !== null ? p.stipend.toLocaleString("en-IN") : "—"}
                          {p.stipend ? " / mo" : ""}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={STATUS_TONE[p.status] ?? "gray"}>{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* 5. POST / EDIT PLACEMENT RECORD MODAL */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-border-muted bg-surface text-foreground shadow-2xl transition-all"
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border-muted px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                  {editingRecord ? <Pencil className="size-4.5" /> : <Plus className="size-4.5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {editingRecord
                      ? `Edit Placement Record: ${editingRecord.originalCompanyName}`
                      : "Post New Placement Record"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingRecord
                      ? "Update company hiring counts, recruited roles, and compensation package."
                      : "Add verified company recruitment statistics for the institutional placement tracker."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Row 1: Academic Year & Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Academic Year
                  </label>
                  {!isCustomYear ? (
                    <div className="flex gap-2">
                      <select
                        value={formYear}
                        onChange={(e) => {
                          if (e.target.value === "CUSTOM") {
                            setIsCustomYear(true);
                          } else {
                            setFormYear(e.target.value);
                          }
                        }}
                        className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:text-slate-100"
                      >
                        {yearlyData.map((d) => (
                          <option key={d.year} value={d.year}>
                            {d.year}
                          </option>
                        ))}
                        <option value="CUSTOM">+ Enter Custom Year...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customYear}
                        onChange={(e) => setCustomYear(e.target.value)}
                        placeholder="e.g. 2026-27"
                        required
                        className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomYear(false)}
                        className="rounded-lg border border-border-muted px-2.5 py-1 text-xs text-slate-500 hover:bg-surface-subtle"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Placement Tier / Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:text-slate-100"
                  >
                    <option value="Super Dream">Super Dream (≥ ₹20 LPA)</option>
                    <option value="Dream">Dream (₹10 – ₹20 LPA)</option>
                    <option value="Core / R&D">Core / R&D</option>
                    <option value="Mass / IT Services">Mass / IT Services</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Company Name & Placed Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    placeholder="e.g. Google India, Oracle, Apple"
                    className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Number of Students Placed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formPlacedCount}
                    onChange={(e) => setFormPlacedCount(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Row 3: Recruited Roles */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Recruited Job Roles (comma-separated)
                </label>
                <input
                  type="text"
                  value={formRoles}
                  onChange={(e) => setFormRoles(e.target.value)}
                  placeholder="e.g. SDE-1, Cloud Systems Architect, AI Specialist"
                  className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:text-slate-100"
                />
              </div>

              {/* Row 4: CTC Package Range & Average CTC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    CTC Package Range
                  </label>
                  <input
                    type="text"
                    value={formCtcRange}
                    onChange={(e) => setFormCtcRange(e.target.value)}
                    placeholder="e.g. ₹28 - ₹45 LPA"
                    className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Average CTC (in LPA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    value={formAvgCtcLpa}
                    onChange={(e) => setFormAvgCtcLpa(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Row 5: Location */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary Placement Location
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, Karnataka or Pan-India"
                  className="h-10 w-full rounded-xl border border-border-muted bg-surface-subtle px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:text-slate-100"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border-muted">
                {editingRecord ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete(editingRecord.year, editingRecord.originalCompanyName);
                      setIsModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition-all cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Record</span>
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-border-muted px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-surface-subtle dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>{editingRecord ? "Save Changes" : "Post Placement"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
