import { Sparkles } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export function PlaceholderPage({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items?: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={title} subtitle={description} />
      <EmptyState
        icon={Sparkles}
        title="Coming soon"
        description="This module is part of the upcoming phase. The navigation and layout are ready; the detailed workflow will be implemented next."
      />
      {items && items.length > 0 && (
        <Card className="mt-6 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-muted bg-slate-50/70 dark:bg-slate-800/40">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Item</th>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {items.map((item) => (
                <tr key={item.label}>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{item.label}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}