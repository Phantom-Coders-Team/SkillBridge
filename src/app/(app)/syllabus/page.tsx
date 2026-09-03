import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SyllabusAudit } from "./SyllabusAudit";

function obsolescenceColor(score: number): string {
  if (score < 0.3) return "bg-green-100 text-green-800";
  if (score < 0.5) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export default async function SyllabusPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const syllabi = await prisma.syllabus.findMany({
    orderBy: { obsolescenceScore: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Syllabus Obsolescence Engine</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Audit syllabus modules against current industry trends and apply refreshed patch modules.
      </p>

      {user.role === "FACULTY" && (
        <div className="mt-6">
          <SyllabusAudit />
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tracked Syllabi</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">{syllabi.length} records</span>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-border-muted bg-surface shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Course</th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Department</th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Topics</th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Obsolescence</th>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Last Reviewed</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {syllabi.map((s) => {
              let topics: string[] = [];
              try {
                topics = JSON.parse(s.topicsJson);
              } catch {
                topics = [];
              }
              return (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{s.title}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.department}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    <span className="line-clamp-1">{topics.join(", ")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${obsolescenceColor(s.obsolescenceScore)}`}>
                      {Math.round(s.obsolescenceScore * 100)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {s.lastReviewedAt ? new Date(s.lastReviewedAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              );
            })}
            {syllabi.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No syllabi tracked yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
