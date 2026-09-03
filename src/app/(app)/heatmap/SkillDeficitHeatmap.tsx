"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
} from "recharts";

export interface HeatCell {
  batch: string;
  skill: string;
  avgScore: number;
  requiredScore: number;
}

export interface Recommendation {
  id: string;
  batch: string;
  skill: string;
  deficit: number;
  message: string;
}

const DEFICIT_COLOR = (deficit: number): string => {
  if (deficit >= 25) return "#dc2626";
  if (deficit >= 15) return "#f97316";
  if (deficit >= 8) return "#facc15";
  return "#22c55e";
};

export function SkillDeficitHeatmap({
  initialCells,
  initialRecommendations,
}: {
  initialCells: HeatCell[];
  initialRecommendations: Recommendation[];
}) {
  const data = initialCells.map((c) => ({
    ...c,
    deficit: c.requiredScore - c.avgScore,
    z: Math.max(0, c.requiredScore - c.avgScore),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Skill Readiness Heatmap</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Cell color = gap between average student score and upcoming campus hiring benchmark.
        </p>
        <div className="mt-4 h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="skill" type="category" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={70} />
              <YAxis dataKey="batch" type="category" tick={{ fontSize: 12 }} width={130} />
              <ZAxis dataKey="z" range={[300, 500]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<ChartTooltip />}
              />
              <Legend />
              <Scatter data={data}>
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={DEFICIT_COLOR(entry.deficit)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-500" /> Ready (0–7)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-yellow-400" /> Minor gap (8–14)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-orange-500" /> Gap (15–24)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-red-600" /> Critical (25+)</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Automated Early-Warning Recommendations</h3>
        {initialRecommendations.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            All department batches meet or exceed their hiring benchmarks. No early warning required.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {initialRecommendations.map((r) => (
              <div key={r.id} className="flex items-start gap-3 rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                <span className="text-2xl leading-none">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-orange-900">{r.batch} · {r.skill}</p>
                  <p className="mt-1 text-sm text-orange-800">{r.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type ChartTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
};

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload as HeatCell & { deficit: number };
  return (
    <div className="rounded-lg border border-border-muted bg-surface p-3 text-sm shadow-card">
      <p className="font-semibold text-gray-900 dark:text-gray-100">
        {p.batch} · {p.skill}
      </p>
      <p className="mt-1 text-gray-600 dark:text-gray-300">
        Avg score: <span className="font-medium">{p.avgScore}</span>
      </p>
      <p className="text-gray-600 dark:text-gray-300">
        Benchmark: <span className="font-medium">{p.requiredScore}</span>
      </p>
      <p className="mt-1 font-semibold" style={{ color: DEFICIT_COLOR(p.deficit) }}>
        {p.deficit > 0 ? `Deficit: +${p.deficit}` : `Ahead by ${Math.abs(p.deficit)}`}
      </p>
    </div>
  );
}
