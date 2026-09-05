"use client";

import { useState, useTransition } from "react";
import {
  FileText,
  ExternalLink,
  Download,
  Plus,
  Trash2,
  X,
  Upload,
  Loader2,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { Badge, Card, type BadgeTone } from "@/components/ui";
import { uploadDocumentAction, deleteDocumentAction } from "@/app/(app)/profile/actions";

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  dataUrl?: string;
  createdAt?: Date | string;
}

interface PortfolioDocumentsSectionProps {
  documents: DocumentItem[];
  canUpload?: boolean;
}

export default function PortfolioDocumentsSection({
  documents,
  canUpload = false,
}: PortfolioDocumentsSectionProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const [uploadPending, startUploadTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const isResume = (doc: DocumentItem) => {
    const t = doc.type?.toLowerCase() || "";
    const n = doc.name?.toLowerCase() || "";
    return t.includes("resume") || n.includes("resume") || t.includes("cv") || n.includes("cv");
  };

  const getDocBadgeTone = (doc: DocumentItem): BadgeTone => {
    const t = doc.type?.toLowerCase() || "";
    if (isResume(doc)) return "indigo";
    if (t.includes("cert")) return "emerald";
    if (t.includes("internship") || t.includes("report")) return "blue";
    if (t.includes("transcript") || t.includes("academic") || t.includes("marksheet")) return "amber";
    return "gray";
  };

  const filteredDocuments = documents.filter((d) => {
    if (selectedFilter === "ALL") return true;
    const t = d.type?.toLowerCase() || "";
    if (selectedFilter === "RESUME") return isResume(d);
    if (selectedFilter === "CERTIFICATE") return t.includes("cert");
    if (selectedFilter === "INTERNSHIP_REPORT") return t.includes("internship") || t.includes("report");
    if (selectedFilter === "ACADEMIC_RECORD")
      return t.includes("transcript") || t.includes("academic") || t.includes("marksheet");
    return true;
  });

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setIsDeletingId(docId);
    try {
      await deleteDocumentAction(docId);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      setUploadError("Please choose a file to upload.");
      return;
    }

    startUploadTransition(async () => {
      const res = await uploadDocumentAction(null, formData);
      if (res?.error) {
        setUploadError(res.error);
      } else {
        setUploadSuccess(true);
        setTimeout(() => {
          setIsUploadOpen(false);
          setUploadSuccess(false);
        }, 1200);
      }
    });
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-muted px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <FileText className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Resume & Documents
              </h3>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {documents.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified resume and portfolio attachments
            </p>
          </div>
        </div>

        {canUpload && (
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 cursor-pointer"
          >
            <Plus className="size-3.5" /> Upload Document
          </button>
        )}
      </div>

      {/* Document Type Filter Bar */}
      {documents.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border-muted/70 bg-slate-50/50 px-5 py-2.5 dark:bg-slate-800/30">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="size-3" /> Filter:
          </span>
          {[
            { id: "ALL", label: `All (${documents.length})` },
            { id: "RESUME", label: "Resumes / CVs" },
            { id: "CERTIFICATE", label: "Certifications" },
            { id: "INTERNSHIP_REPORT", label: "Internship Reports" },
            { id: "ACADEMIC_RECORD", label: "Academic Records / Transcripts" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-surface text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-muted py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <FileText className="size-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              {documents.length === 0 ? "No documents uploaded yet" : "No documents in this category"}
            </p>
            <p className="mt-1 max-w-sm text-xs text-slate-400 dark:text-slate-500">
              {documents.length === 0
                ? "Upload your resume, certificates, internship reports, and academic records to strengthen your digital portfolio."
                : "Try selecting 'All' or uploading a document for this category."}
            </p>
            {canUpload && (
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
              >
                <Upload className="size-3.5" /> Upload Document
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredDocuments.map((d) => {
              const resumeFlag = isResume(d);
              return (
                <div
                  key={d.id}
                  className={`group flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                    resumeFlag
                      ? "border-indigo-200/80 bg-gradient-to-r from-indigo-50/40 via-white to-transparent dark:border-indigo-900/50 dark:from-indigo-950/20 dark:via-surface dark:to-transparent"
                      : "border-border-muted hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Left: Document Info & Direct Clickable Link */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <a
                      href={`/api/documents/${d.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open document in new tab"
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition ${
                        resumeFlag
                          ? "bg-indigo-600 text-white shadow-sm group-hover:scale-105"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700"
                      }`}
                    >
                      {resumeFlag ? (
                        <FileCheck className="size-5" />
                      ) : (
                        <FileText className="size-5" />
                      )}
                    </a>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`/api/documents/${d.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open document in new tab"
                          className="truncate text-left text-sm font-semibold text-slate-900 transition hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
                        >
                          {d.name}
                        </a>
                        <Badge tone={getDocBadgeTone(d)}>
                          {resumeFlag ? "Resume / CV" : d.type}
                        </Badge>
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                          <ShieldCheck className="size-3 text-emerald-600" />
                          Tamper-Verified
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <span>
                          {d.createdAt
                            ? new Date(d.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Verified Attachment"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Open, Download, Delete) */}
                  <div className="flex items-center gap-1.5">
                    {/* Open in New Tab Button */}
                    <a
                      href={`/api/documents/${d.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      title="Open document in new tab"
                    >
                      <ExternalLink className="size-3.5" />
                      <span>Open</span>
                    </a>

                    {/* Download Button */}
                    <a
                      href={`/api/documents/${d.id}?download=1`}
                      download={d.name}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      title="Download file"
                    >
                      <Download className="size-3.5" />
                      <span>Download</span>
                    </a>

                    {/* Delete button (Owner only) */}
                    {canUpload && (
                      <button
                        type="button"
                        onClick={() => handleDelete(d.id)}
                        disabled={isDeletingId === d.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 p-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete document"
                      >
                        {isDeletingId === d.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-surface p-6 shadow-2xl dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-border-muted pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Upload Resume or Document
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Document Type
                </label>
                <select
                  name="type"
                  defaultValue="Resume"
                  className="mt-1 block w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="Resume">Resume / CV</option>
                  <option value="Certificate">Certificate (Course / Hackathon / Training)</option>
                  <option value="Internship Report">Internship Report / Completion Record</option>
                  <option value="Academic Record">Academic Record / Transcript / Marksheet</option>
                  <option value="Letter of Recommendation">Letter of Recommendation</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select File (PDF, PNG, JPG under 4MB)
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  required
                  className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950/60 dark:file:text-indigo-300 cursor-pointer"
                />
              </div>

              {uploadError && (
                <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {uploadError}
                </p>
              )}

              {uploadSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  Document uploaded successfully!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="rounded-xl border border-border-muted px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
                >
                  {uploadPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="size-3.5" /> Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
