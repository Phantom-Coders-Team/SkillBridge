import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  FileText,
  FolderOpen,
  ScrollText,
  ShieldCheck,
  ExternalLink,
  Download,
  Building2,
  Mail,
  Phone,
  User,
  CheckCircle2,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";

const TYPE_TONE: Record<string, BadgeTone> = {
  CERTIFICATION: "purple",
  PROJECT: "blue",
  INTERNSHIP: "emerald",
  ACHIEVEMENT: "amber",
  PUBLICATION: "violet",
  VOLUNTEERING: "cyan",
};

export default async function StudentPortfolioViewPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const viewer = await getCurrentUser();
  if (!viewer) redirect("/login");

  const { userId } = await params;
  if (userId === viewer.id) redirect("/portfolio");

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profile: true,
    },
  });

  if (!student) notFound();

  const [skills, proofs, items, documents, projects] = await Promise.all([
    prisma.skillAssessment.findMany({
      where: { studentId: userId },
      orderBy: { score: "desc" },
    }),
    prisma.proofOfWork.findMany({
      where: { studentId: userId },
      include: { project: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.portfolioItem.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const p = student.profile;
  const resumeDoc =
    documents.find(
      (d) =>
        d.type?.toLowerCase().includes("resume") ||
        d.name?.toLowerCase().includes("resume") ||
        d.type?.toLowerCase().includes("cv")
    ) || documents[0] || null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={`${student.name}'s Digital Portfolio`}
        subtitle="Verified showcase of student credentials, skills, certifications, and proofs of work."
        icon={ScrollText}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {resumeDoc && (
              <a
                href={`/api/documents/${resumeDoc.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
              >
                <FileText className="size-4" />
                <span>View Resume</span>
                <ExternalLink className="size-3 opacity-70" />
              </a>
            )}
            <Link
              href={`/profile/${student.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border-muted bg-surface px-4 text-sm font-medium text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition"
            >
              <User className="size-4" />
              <span>Full Profile</span>
            </Link>
          </div>
        }
      />

      {/* Recruiter Evaluation Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-white p-4 dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-surface shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Verified Candidate Dossier
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Official portfolio and verified academic credentials reviewed by institutional faculty.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resumeDoc ? (
            <a
              href={`/api/documents/${resumeDoc.id}?download=1`}
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-300 transition shadow-2xs"
            >
              <Download className="size-3.5" />
              <span>Download Resume PDF</span>
            </a>
          ) : (
            <span className="text-xs text-slate-400">No resume on file</span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Left: Student Overview Card */}
        <Card className="flex flex-col items-center px-6 py-8">
          <Avatar name={student.name} size="lg" />
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{student.name}</h2>
          <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
            {p?.department ? `${p.department}${p.year ? ` · Year ${p.year}` : ""}` : "Student Researcher"}
          </p>
          {p?.collegeName && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 text-center">
              <Building2 className="size-3 shrink-0" />
              {p.collegeName}
            </p>
          )}

          <div className="mt-5 w-full space-y-4">
            {/* Contact quick links */}
            <div className="rounded-xl border border-border-muted bg-surface-muted/30 p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="size-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              {p?.phone && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="size-3.5 text-slate-400 shrink-0" />
                  <span>{p.phone}</span>
                </div>
              )}
            </div>

            {/* Verified Skills */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Verified Skill Assessments
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skills.length === 0 && (
                  <span className="text-xs text-slate-400">No verified skills recorded</span>
                )}
                {skills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900"
                  >
                    <BadgeCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                    {s.skillName} · {s.score}%
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            {p?.bio && (
              <div className="border-t border-border-muted pt-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  About Candidate
                </p>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.bio}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Right: Portfolio Details */}
        <div className="space-y-6">
          {/* Documents & Resume Card */}
          <Card>
            <div className="flex items-center justify-between border-b border-border-muted px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <FileText className="size-4 text-indigo-500" />
                Verified Resume & Documents
              </h3>
              <span className="text-xs text-slate-400">{documents.length} File{documents.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="p-5">
              {documents.length === 0 ? (
                <p className="text-sm text-slate-400">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {documents.map((d) => {
                    const isResume =
                      d.type?.toLowerCase().includes("resume") ||
                      d.name?.toLowerCase().includes("resume") ||
                      d.type?.toLowerCase().includes("cv");

                    return (
                      <div
                        key={d.id}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${
                          isResume
                            ? "border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/30"
                            : "border-border-muted bg-surface"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                            <FileText className="size-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {d.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {d.type} · {new Date(d.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/api/documents/${d.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition"
                          >
                            <span>Open</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                          <a
                            href={`/api/documents/${d.id}?download=1`}
                            download
                            className="inline-flex items-center gap-1 rounded-lg border border-border-muted bg-surface px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                          >
                            <Download className="size-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Certifications & Achievements */}
          <Card>
            <div className="border-b border-border-muted px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Award className="size-4 text-purple-600" />
                Certifications & Achievements
              </h3>
            </div>
            <div className="p-5">
              {items.length === 0 ? (
                <EmptyState
                  icon={Award}
                  title="No portfolio items recorded"
                  description="Candidate has not added external achievements or certifications yet."
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border-muted p-3.5 space-y-1.5 bg-surface"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone={TYPE_TONE[item.type] ?? "gray"}>{item.type}</Badge>
                        {item.year && (
                          <span className="text-[11px] text-slate-400">{item.year}</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </p>
                      {item.issuer && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.issuer}
                        </p>
                      )}
                      {item.description && (
                        <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Proof of Work & Projects */}
          <Card>
            <div className="border-b border-border-muted px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <FolderOpen className="size-4 text-indigo-500" />
                Proof of Work & Verified Projects
              </h3>
            </div>
            <div className="divide-y divide-border-muted">
              {[...proofs, ...projects.map((p) => ({ id: p.id, project: { title: p.title }, description: p.description, status: p.status }))].map((po, i) => (
                <div key={`${po.id}-${i}`} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {po.project.title}
                    </p>
                    <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {po.description}
                    </p>
                  </div>
                  {"status" in po && po.status === "COMPLETED" ? (
                    <Badge tone="green">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="size-3" /> Blockchain Verified
                      </span>
                    </Badge>
                  ) : "facultySignOff" in po ? (
                    <Badge
                      tone={
                        (po as any).facultySignOff === "APPROVED" &&
                        (po as any).industrySignOff === "APPROVED"
                          ? "green"
                          : "amber"
                      }
                    >
                      {(po as any).facultySignOff === "APPROVED" &&
                      (po as any).industrySignOff === "APPROVED" ? (
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="size-3" /> Dual sign-off (Verified)
                        </span>
                      ) : (
                        "Pending sign-off"
                      )}
                    </Badge>
                  ) : (
                    <Badge tone="gray">{(po as any).status ?? ""}</Badge>
                  )}
                </div>
              ))}
              {proofs.length === 0 && projects.length === 0 && (
                <p className="px-5 py-6 text-sm text-slate-400 dark:text-slate-500">
                  No projects or proof of work recorded yet.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
