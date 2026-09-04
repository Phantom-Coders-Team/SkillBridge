import { redirect, notFound } from "next/navigation";
import { User, Mail, MapPin, Phone, GraduationCap, Hash, Sparkles, Building2 } from "lucide-react";
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
        },
      },
    },
  });

  if (!user) notFound();

  const p = user.profile;

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
            {p.skills.split(",").map((s, i) => (
              <Badge key={i} tone="indigo">{s.trim()}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
