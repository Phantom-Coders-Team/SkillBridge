"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Users,
  X,
  Sparkles,
} from "lucide-react";
import { importStudentRosterAction, type StudentRosterRecord } from "./rosterActions";

export function BulkRosterImporter() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<StudentRosterRecord[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    importedCount: number;
    skippedCount: number;
    errors: string[];
  } | null>(null);

  const downloadSampleCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Email,RollNumber,Department,Year,Skills\n" +
      "Arjun Sharma,arjun.sharma26@uit.edu.in,2022CS0104,Computer Science,4,\"React, Next.js, Node.js, PostgreSQL\"\n" +
      "Priya Patel,priya.patel26@uit.edu.in,2022CS0105,Information Technology,4,\"Python, PyTorch, Generative AI, SQL\"\n" +
      "Rohan Verma,rohan.verma26@uit.edu.in,2022EC0042,Electronics & Communication,4,\"Embedded Systems, IoT, C++, ROS\"\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_student_roster.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) return;

      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIdx = header.findIndex((h) => h.includes("name"));
      const emailIdx = header.findIndex((h) => h.includes("email"));
      const rollIdx = header.findIndex((h) => h.includes("roll"));
      const deptIdx = header.findIndex((h) => h.includes("dept") || h.includes("department"));
      const yearIdx = header.findIndex((h) => h.includes("year"));
      const skillsIdx = header.findIndex((h) => h.includes("skill"));

      const records: StudentRosterRecord[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Handle quoted CSV cells
        const row = lines[i];
        const cells: string[] = [];
        let inQuotes = false;
        let cell = "";
        for (let j = 0; j < row.length; j++) {
          const char = row[j];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            cells.push(cell.trim());
            cell = "";
          } else {
            cell += char;
          }
        }
        cells.push(cell.trim());

        if (cells[nameIdx] && cells[emailIdx]) {
          records.push({
            name: cells[nameIdx].replace(/^["']|["']$/g, ""),
            email: cells[emailIdx].replace(/^["']|["']$/g, ""),
            rollNumber: rollIdx !== -1 ? cells[rollIdx]?.replace(/^["']|["']$/g, "") : undefined,
            department: deptIdx !== -1 ? cells[deptIdx]?.replace(/^["']|["']$/g, "") : undefined,
            year: yearIdx !== -1 ? parseInt(cells[yearIdx]?.replace(/^["']|["']$/g, ""), 10) || 4 : 4,
            skills: skillsIdx !== -1 ? cells[skillsIdx]?.replace(/^["']|["']$/g, "") : undefined,
          });
        }
      }

      setParsedRows(records);
    };

    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;

    startTransition(async () => {
      const res = await importStudentRosterAction(parsedRows);
      setResult({
        importedCount: res.importedCount,
        skippedCount: res.skippedCount,
        errors: res.errors,
      });
      router.refresh();
    });
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setResult(null);
          setParsedRows([]);
          setFileName(null);
        }}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 active:scale-95 transition-all"
      >
        <UploadCloud className="size-4" />
        <span>Bulk Student Roster Import (CSV)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <FileSpreadsheet className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Institutional Student Cohort Onboarding
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Batch-import student profiles from university SIS or Excel rosters.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Sample template banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-purple-200 bg-purple-50/60 p-3 dark:border-purple-900/40 dark:bg-purple-950/30">
                <div className="text-xs text-purple-900 dark:text-purple-200">
                  <span className="font-bold">Required Columns:</span> Name, Email, RollNumber, Department, Year, Skills
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-purple-700 shadow-2xs hover:bg-purple-50 dark:bg-slate-800 dark:text-purple-300 dark:hover:bg-slate-700"
                >
                  <Download className="size-3" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* Upload Box */}
              {!result && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/20 dark:border-slate-700 dark:bg-slate-800/40 transition-colors"
                >
                  <UploadCloud className="size-8 text-purple-600 dark:text-purple-400 mb-2" />
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {fileName ? fileName : "Click to browse or drop CSV roster file here"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Accepts standard .csv UTF-8 rosters</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Preview Table */}
              {parsedRows.length > 0 && !result && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Parsed Candidates ({parsedRows.length})</span>
                    <span className="text-purple-600 dark:text-purple-400">Ready to Enroll</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Roll Number</th>
                          <th className="p-2">Department</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                        {parsedRows.slice(0, 10).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                            <td className="p-2 font-medium text-slate-900 dark:text-slate-100">{r.name}</td>
                            <td className="p-2">{r.email}</td>
                            <td className="p-2">{r.rollNumber || "—"}</td>
                            <td className="p-2">{r.department || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedRows.length > 10 && (
                    <p className="text-[10px] text-slate-400 text-center">
                      Showing first 10 of {parsedRows.length} candidates
                    </p>
                  )}
                </div>
              )}

              {/* Result Summary */}
              {result && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Student Cohort Successfully Enrolled!
                  </h4>
                  <div className="flex justify-center gap-4 text-xs font-semibold">
                    <span className="rounded-lg bg-white px-3 py-1.5 text-emerald-800 shadow-2xs dark:bg-slate-800 dark:text-emerald-300">
                      ✓ {result.importedCount} New Accounts Created
                    </span>
                    {result.skippedCount > 0 && (
                      <span className="rounded-lg bg-white px-3 py-1.5 text-slate-600 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
                        ℹ {result.skippedCount} Existing / Skipped
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Default credentials initialized (<code className="font-mono text-purple-600">Student@2026</code>). Students can now log in, take assessments, and generate proof-of-work.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {result ? "Close" : "Cancel"}
              </button>

              {parsedRows.length > 0 && !result && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleCommitImport}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50 transition-all"
                >
                  {isPending ? (
                    <>
                      <Sparkles className="size-3.5 animate-spin" />
                      <span>Importing {parsedRows.length} Students...</span>
                    </>
                  ) : (
                    <>
                      <Users className="size-3.5" />
                      <span>Confirm & Enroll Cohort</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
