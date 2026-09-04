import { redirect, notFound } from "next/navigation";
import { User, Mail, MapPin, Phone, GraduationCap, Hash, Sparkles, Building2, Globe, Calendar, Award, Users, BookOpen } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS, ROLE_COLORS, type Role } from "@/lib/types";
import { Avatar, Badge, Card, PageHeader } from "@/components/ui";

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
      profile: {
        select: {
          bio: true,
          department: true,
          companyName: true,
          designation: true,
          collegeName: true,
          skills: true,
          location: true,
          phone: true,
          avatarUrl: true,
          year: true,
          rollNumber: true,
          institutionType: true,
          establishedYear: true,
          websiteUrl: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          naacGrade: true,
          nbaAccredited: true,
          aicteApproved: true,
          principalName: true,
          tpoName: true,
          tpoPhone: true,
          totalStudents: true,
          totalFaculty: true,
          departments: true,
        },
      },
    },
  });

  if (!user) notFound();

  const p = user.profile;
  const isInstitution = user.role === "INSTITUTIONS" || user.role === "INSTITUTION";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Profile"
        subtitle={`Viewing ${user.name}'s public profile.`}
        icon={User}
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
              {ROLE_LABELS[user.role as Role]}
            </span>

            {p?.companyName && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {p.companyName}
                {p.designation ? ` · ${p.designation}` : ""}
              </p>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-px border-t border-border-muted bg-border-muted sm:grid-cols-2">
          {[
            { icon: Mail, label: "Email", value: user.email },
            { icon: Phone, label: "Phone", value: p?.phone },
            { icon: MapPin, label: "Location", value: p?.location },
            { icon: Building2, label: "College", value: p?.collegeName },
            { icon: GraduationCap, label: "Department", value: p?.department },
            { icon: Hash, label: "Roll Number", value: p?.rollNumber },
            { icon: User, label: "Year", value: p?.year ? `Year ${p.year}` : undefined },
          ].map(({ icon: Icon, label, value }) =>
            value ? (
              <div key={label} className="flex items-start gap-3 bg-surface p-4">
                <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</dt>
                  <dd className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{value}</dd>
                </div>
              </div>
            ) : null,
          )}
        </dl>
      </Card>

      {p?.bio && (
        <Card className="mt-6 p-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">About</h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.bio}</p>
        </Card>
      )}

      {p?.skills && (
        <Card className="mt-6 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles aria-hidden className="size-4 text-indigo-500" /> Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {p.skills.split(",").map((s: string, i: number) => (
              <Badge key={i} tone="indigo">{s.trim()}</Badge>
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
            </div>
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
    </div>
  );
}
