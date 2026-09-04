import { redirect } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Coins, ReceiptText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";

const TYPE_TONE: Record<string, BadgeTone> = {
  CREDIT: "green",
  DEBIT: "red",
  ADJUSTMENT: "blue",
};

export default async function TokensPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let ledger = await prisma.tokenLedger.findFirst({
    where: { studentId: user.id },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 25 },
    },
  });

  if (!ledger && user.role === "STUDENT") {
    ledger = await prisma.tokenLedger.create({
      data: {
        studentId: user.id,
        balance: 100,
        transactions: {
          create: {
            amount: 100,
            type: "CREDIT",
            reason: "Welcome onboarding skill tokens",
          },
        },
      },
      include: {
        transactions: { orderBy: { createdAt: "desc" }, take: 25 },
      },
    });
  }

  const balance = ledger?.balance ?? 0;
  const credits = ledger?.transactions.filter((t) => t.amount > 0).length ?? 0;
  const debits = ledger?.transactions.filter((t) => t.amount < 0).length ?? 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={Coins}
        title="Skill Tokens"
        subtitle="Your balance reflects verified contributions and how you spend them."
      />

      {/* Balance hero */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 p-6">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-100">Current balance</p>
            <p className="mt-1 text-5xl font-extrabold tracking-tight text-white">{balance}</p>
            <p className="mt-1 text-xs text-indigo-200">skill tokens</p>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <dt className="text-[11px] font-medium text-indigo-100">Earned</dt>
              <dd className="mt-0.5 flex items-center justify-center gap-1 text-lg font-bold text-white">
                <ArrowUpRight aria-hidden className="size-4" /> {credits}
              </dd>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <dt className="text-[11px] font-medium text-indigo-100">Spent</dt>
              <dd className="mt-0.5 flex items-center justify-center gap-1 text-lg font-bold text-white">
                <ArrowDownLeft aria-hidden className="size-4" /> {debits}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Transaction history
      </h2>

      {!ledger || ledger.transactions.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No transactions yet"
          description="Earn tokens on completed work and spend them on office hours and code clinics."
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-muted bg-slate-50/70 dark:bg-slate-800/40">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Reason</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Type</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {ledger.transactions.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-700/40">
                  <td className="px-5 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3 text-slate-800">{t.reason || "—"}</td>
                  <td className="px-5 py-3">
                    <Badge tone={TYPE_TONE[t.type] ?? "gray"}>{t.type}</Badge>
                  </td>
                  <td className={`px-5 py-3 text-right font-bold ${t.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {t.amount >= 0 ? `+${t.amount}` : t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}