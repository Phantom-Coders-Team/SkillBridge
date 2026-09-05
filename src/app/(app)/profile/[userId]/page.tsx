import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  MapPin,
  Phone,
  GraduationCap,
  Hash,
  Sparkles,
  Building2,
  Globe,
  Calendar,
  Award,
  Users,
  BookOpen,
  Briefcase,
  School,
  ExternalLink,
  FileText,
  Download,
  ScrollText,
  BadgeCheck,
  ShieldCheck,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS, ROLE_COLORS, type Role } from "@/lib/types";
import { Avatar, Badge, Card, PageHeader, type BadgeTone } from "@/components/ui";

const PORTFOLIO_TYPE_TONE: Record<string, BadgeTone> = {
  CERTIFICATION: "purple",
  PROJECT: "blue",
  INTERNSHIP: "emerald",
  ACHIEVEMENT: "amber",
  PUBLICATION: "violet",
  VOLUNTEERING: "cyan",
};

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const viewer = await getCurrentUser();
  if (!viewer) redirect("/login");

  const { userId } = await params;
  if (userId === viewer.id) redirect("/profile");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profile: true,
    },
  });

  if (!user) notFound();

  const p = user.profile;
  const normalizedRole = user.role.toUpperCase();
  const isStudent = normalizedRole === "STUDENT" || normalizedRole === "STUDENTS";

  const [documents, assessments, portfolioItems, proofsOfWork, projects] = isStudent
    ? await Promise.all([
        prisma.userDocument.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.skillAssessment.findMany({
          where: { studentId: userId },
          orderBy: { score: "desc" },
        }),
        prisma.portfolioItem.findMany({
          where: { studentId: userId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.proofOfWork.findMany({
          where: { studentId: userId },
          include: { project: { select: { title: true } } },
          orderBy: { createdAt: "desc" },
        }),
        prisma.project.findMany({
          where: { ownerId: userId },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], [], [], [], []];

  const resumeDoc = documents.find(
    (d) =>
      d.type?.toLowerCase().includes("resume") ||
      d.name?.toLowerCase().includes("resume") ||
      d.type?.toLowerCase().includes("cv")
  ) || documents[0] || null;
  const isAcademician =
    normalizedRole === "ACADEMICIAN" ||
    normalizedRole === "FACULTY" ||
    normalizedRole === "ACADEMICIANS";
  const isIndustry =
    normalizedRole === "INDUSTRY" ||
    normalizedRole === "INDUSTRIES";
  const isInstitution =
    normalizedRole === "INSTITUTION" ||
    normalizedRole === "INSTITUTIONS" ||
    normalizedRole === "TPO";

  const infoItems = isStudent
    ? [
        { icon: Mail, label: "Email", value: user.email },
        { icon: Phone, label: "Phone", value: p?.phone },
        { icon: Building2, label: "College / University", value: p?.collegeName },
        { icon: GraduationCap, label: "Degree & Branch", value: p?.department },
        { icon: User, label: "Year of Study", value: p?.year ? `Year ${p.year}` : undefined },
        { icon: Hash, label: "Roll Number", value: p?.rollNumber },
        { icon: MapPin, label: "Location", value: p?.location },
      ]
    : isAcademician
    ? [
        { icon: Building2, label: "Institution", value: p?.collegeName },
        { icon: GraduationCap, label: "Academic Department", value: p?.department },
        { icon: BookOpen, label: "Academic Designation", value: p?.designation },
        { icon: Mail, label: "Academic Email", value: user.email },
        { icon: Phone, label: "Contact Phone", value: p?.phone },
        { icon: MapPin, label: "Campus Location", value: p?.location },
      ]
    : isIndustry
    ? [
        { icon: Briefcase, label: "Company / Organization", value: p?.companyName },
        { icon: User, label: "Recruiter Designation", value: p?.designation },
        { icon: Building2, label: "Industry Sector", value: p?.department },
        { icon: Globe, label: "Company Website", value: p?.websiteUrl, isLink: true },
        { icon: Mail, label: "Work Email", value: user.email },
        { icon: Phone, label: "Phone", value: p?.phone },
        { icon: MapPin, label: "Headquarters", value: p?.location },
      ]
    : [
        { icon: School, label: "Institution Name", value: p?.collegeName },
        { icon: Building2, label: "Classification", value: p?.institutionType },
        { icon: User, label: "TPO Head", value: p?.tpoName },
        { icon: Globe, label: "Official Website", value: p?.websiteUrl, isLink: true },
        { icon: Mail, label: "Official Email", value: user.email },
        { icon: Phone, label: "TPO Phone", value: p?.tpoPhone || p?.phone },
        { icon: MapPin, label: "Campus Location", value: p?.city ? `${p.city}, ${p.state}` : p?.location },
      ];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Profile"
        subtitle={`Viewing ${user.name}'s public profile.`}
        icon={User}
        actions={
          isStudent ? (
            <div className="flex flex-wrap items-center gap-2">
              {resumeDoc && (
                <a
                  href={`/api/documents/${resumeDoc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition"
                >
                  <FileText className="size-3.5" />
                  <span>View Resume</span>
                  <ExternalLink className="size-2.5 opacity-70" />
                </a>
              )}
              <Link
                href={`/portfolio/${user.id}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-900/60 transition"
              >
                <ScrollText className="size-3.5 text-purple-600 dark:text-purple-400" />
                <span>Digital Portfolio</span>
              </Link>
            </div>
          ) : undefined
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          {p?.avatarUrl ? (
            <img
              src={p.avatarUrl}
              alt={user.name}
              className="size-24 rounded-full object-cover ring-4 ring-white shadow-lg dark:ring-slate-900"
            />
          ) : (
            <Avatar name={user.name} size="lg" />
          )}

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
            <span className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${ROLE_COLORS[user.role as Role]}`}>
              {ROLE_LABELS[user.role as Role] ?? user.role}
            </span>

            {isAcademician && p?.designation && (
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {p.designation} {p.department ? `· ${p.department}` : ""}
              </p>
            )}

            {isIndustry && (p?.companyName || p?.designation) && (
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="font-semibold">{p.designation ?? "Recruiter"}</span>
                {p.companyName ? ` · ${p.companyName}` : ""}
              </p>
            )}

            {isInstitution && p?.collegeName && (
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {p.collegeName} {p.institutionType ? `(${p.institutionType})` : ""}
              </p>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-px border-t border-border-muted bg-border-muted sm:grid-cols-2">
          {infoItems.map(({ icon: Icon, label, value, isLink }: any) =>
            value ? (
              <div key={label} className="flex items-start gap-3 bg-surface p-4">
                <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</dt>
                  <dd className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                    {isLink && typeof value === "string" && value.startsWith("http") ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        <span>{value}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              </div>
            ) : null,
          )}
        </dl>
      </Card>

      {p?.bio && (
        <Card className="mt-6 p-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {isStudent
              ? "Career Objective & About"
              : isAcademician
              ? "Academic & Research Bio"
              : isIndustry
              ? "About Company & Culture"
              : "Institutional Overview"}
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.bio}</p>
        </Card>
      )}

      {p?.skills && (
        <Card className="mt-6 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles aria-hidden className="size-4 text-indigo-500" />
            {isStudent
              ? "Verified Skills & Competencies"
              : isAcademician
              ? "Research Areas & Specializations"
              : isIndustry
              ? "Hiring Tech Stack & Evaluated Skills"
              : "Core Academic Disciplines"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {p.skills.split(",").map((s: string, i: number) => (
              <Badge key={i} tone="indigo">{s.trim()}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Student: Verified Assessments */}
      {isStudent && assessments.length > 0 && (
        <Card className="mt-6 p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <BadgeCheck className="size-4 text-emerald-600" />
              Verified Skill Assessments
            </h3>
            <span className="text-xs text-slate-400">
              {assessments.length} Assessment{assessments.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-border-muted p-3 bg-surface-muted/30"
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {a.skillName}
                  </span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {a.score}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Student: Resume & Documents */}
      {isStudent && documents.length > 0 && (
        <Card className="mt-6 p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <FileText className="size-4 text-indigo-600" />
              Resume & Verified Documents
            </h3>
            <span className="text-xs text-slate-400">
              {documents.length} File{documents.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            {documents.map((doc) => {
              const isDocResume =
                doc.type?.toLowerCase().includes("resume") ||
                doc.name?.toLowerCase().includes("resume") ||
                doc.type?.toLowerCase().includes("cv");

              return (
                <div
                  key={doc.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${
                    isDocResume
                      ? "border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20"
                      : "border-border-muted bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {doc.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {doc.type} · Uploaded{" "}
                        {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition"
                    >
                      <span>View</span>
                      <ExternalLink className="size-2.5" />
                    </a>
                    <a
                      href={`/api/documents/${doc.id}?download=1`}
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
        </Card>
      )}

      {/* Student: Digital Portfolio Items */}
      {isStudent && portfolioItems.length > 0 && (
        <Card className="mt-6 p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Award className="size-4 text-purple-600" />
              Digital Portfolio & Certifications
            </h3>
            <Link
              href={`/portfolio/${user.id}`}
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 inline-flex items-center gap-1"
            >
              <span>View Full Showcase</span>
              <ExternalLink className="size-2.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {portfolioItems.map((it) => (
              <div
                key={it.id}
                className="rounded-xl border border-border-muted p-3.5 space-y-1.5 bg-surface"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={PORTFOLIO_TYPE_TONE[it.type] ?? "gray"}>{it.type}</Badge>
                  {it.year && <span className="text-[11px] text-slate-400">{it.year}</span>}
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{it.title}</p>
                {it.issuer && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{it.issuer}</p>
                )}
                {it.description && (
                  <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {it.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Student: Proof of Work */}
      {isStudent && (proofsOfWork.length > 0 || projects.length > 0) && (
        <Card className="mt-6 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
            <FolderOpen className="size-4 text-indigo-500" />
            Proof of Work & Project Artifacts
          </h3>
          <div className="divide-y divide-border-muted">
            {proofsOfWork.map((po) => (
              <div key={po.id} className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {po.project.title}
                </span>
                <Badge tone="green">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="size-3" />
                    Verified Proof
                  </span>
                </Badge>
              </div>
            ))}
            {projects.map((pr) => (
              <div key={pr.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{pr.title}</p>
                  {pr.techStack && (
                    <p className="text-xs text-slate-400">Stack: {pr.techStack}</p>
                  )}
                </div>
                <Badge tone="gray">{pr.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isInstitution && p && (
        <Card className="mt-6 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Building2 aria-hidden className="size-4 text-amber-500" /> Institution Details
          </h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {p.institutionType && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Type</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.institutionType}</dd>
              </div>
            )}
            {p.establishedYear && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Established</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.establishedYear}</dd>
              </div>
            )}
            {p.websiteUrl && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Website</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">
                    {p.websiteUrl}
                  </a>
                </dd>
              </div>
            )}
            {p.address && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Address</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {p.address}
                  {p.city ? `, ${p.city}` : ""}
                  {p.state ? `, ${p.state}` : ""}
                  {p.pincode ? ` - ${p.pincode}` : ""}
                </dd>
              </div>
            )}
            {p.naacGrade && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">NAAC Grade</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.naacGrade}</dd>
              </div>
            )}
            <div className="flex gap-4">
              {p.nbaAccredited && (
                <div>
                  <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">NBA</dt>
                  <dd className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Accredited</dd>
                </div>
              )}
              {p.aicteApproved && (
                <div>
                  <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">AICTE</dt>
                  <dd className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Approved</dd>
                </div>
              )}
              {p.ugcRecognized && (
                <div>
                  <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">UGC</dt>
                  <dd className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Recognized</dd>
                </div>
              )}
            </div>
            {p.affiliatedUniversity && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Affiliated University</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.affiliatedUniversity}</dd>
              </div>
            )}
            {p.principalName && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Principal / Director</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.principalName}</dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      {isInstitution && p && (p.tpoName || p.tpoPhone || p.totalStudents || p.totalFaculty || p.departments) && (
        <Card className="mt-6 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Users aria-hidden className="size-4 text-indigo-500" /> Placement & Departments
          </h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {p.tpoName && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">TPO Name</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.tpoName}</dd>
              </div>
            )}
            {p.tpoPhone && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">TPO Phone</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.tpoPhone}</dd>
              </div>
            )}
            {p.totalStudents && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Total Students</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.totalStudents.toLocaleString()}</dd>
              </div>
            )}
            {p.totalFaculty && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Total Faculty</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.totalFaculty.toLocaleString()}</dd>
              </div>
            )}
            {p.departments && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Departments</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {p.departments.split(",").map((d: string, i: number) => (
                    <Badge key={i} tone="amber">{d.trim()}</Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      {isInstitution && p && (p.averagePlacementRate || p.highestPackage || p.averagePackage) && (
        <Card className="mt-6 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Award aria-hidden className="size-4 text-emerald-500" /> Placement Statistics
          </h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {p.averagePlacementRate && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Placement Rate</dt>
                <dd className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.averagePlacementRate}%</dd>
              </div>
            )}
            {p.highestPackage && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Highest Package</dt>
                <dd className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{p.highestPackage}</dd>
              </div>
            )}
            {p.averagePackage && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Average Package</dt>
                <dd className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{p.averagePackage}</dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      {isInstitution && p && (p.coursesOffered || p.admissionContact || p.admissionPhone || p.facilities) && (
        <Card className="mt-6 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <BookOpen aria-hidden className="size-4 text-sky-500" /> Courses & Admissions
          </h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {p.coursesOffered && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Courses Offered</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {p.coursesOffered.split(",").map((c: string, i: number) => (
                    <Badge key={i} tone="blue">{c.trim()}</Badge>
                  ))}
                </dd>
              </div>
            )}
            {p.admissionContact && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Admission Contact</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.admissionContact}</dd>
              </div>
            )}
            {p.admissionPhone && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Admission Phone</dt>
                <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.admissionPhone}</dd>
              </div>
            )}
            {p.facilities && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">Facilities</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {p.facilities.split(",").map((f: string, i: number) => (
                    <Badge key={i} tone="cyan">{f.trim()}</Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      {isInstitution && p && (p.motto || p.vision) && (
        <Card className="mt-6 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles aria-hidden className="size-4 text-amber-500" /> About the Institution
          </h3>
          {p.motto && (
            <p className="text-sm italic text-slate-500 dark:text-slate-400">“{p.motto}”</p>
          )}
          {p.vision && (
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.vision}</p>
          )}
        </Card>
      )}
    </div>
  );
}
