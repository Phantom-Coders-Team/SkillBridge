import "server-only";

export interface AuditTopic {
  topic: string;
  outdated: boolean;
  gap: number;
  reason: string;
  replacement?: string;
  patchModule?: string;
}

export interface AuditResult {
  syllabusText: string;
  topics: string[];
  gapPercent: number;
  outdatedTopics: AuditTopic[];
  freshTopics: AuditTopic[];
  currentScore: number;
  projectedScore: number;
  improvement: number;
  patches: { id: string; title: string; replaces: string; description: string }[];
  simulated: boolean;
}

const TOPIC_RULES: {
  keywords: RegExp;
  label: string;
  reason: string;
  replacement: string;
  patchModule: string;
  patchDescription: string;
}[] = [
  {
    keywords: /\b(soap|wsdl|axis2|cxf|xml\s*rpc|uddi)\b/i,
    label: "SOAP / XML Web Services",
    reason:
      "SOAP-based web services have been largely superseded by REST and GraphQL for API design.",
    replacement: "REST API design + GraphQL & OpenAPI (Swagger) specs",
    patchModule: "Modern API Design",
    patchDescription:
      "Introduces RESTful best practices, OpenAPI/Swagger specs, GraphQL queries/mutations, and idempotency & versioning patterns.",
  },
  {
    keywords: /\b(rpc|remote procedure call|corba)\b/i,
    label: "RPC / CORBA",
    reason:
      "Legacy RPC and CORBA have been replaced by message queues, gRPC, and event-driven architectures.",
    replacement: "gRPC & event-driven messaging (Kafka/RabbitMQ)",
    patchModule: "Event-Driven & gRPC Architecture",
    patchDescription:
      "Covers gRPC contracts, protobuf, message brokers, and event sourcing for scalable, decoupled systems.",
  },
  {
    keywords: /\b(basic\s+sorting|bubble\s+sort|selection\s+sort)\b/i,
    label: "Basic Sorting Algorithms",
    reason:
      "Basic sorting alone is insufficient; modern interviews and practice focus on algorithm complexity and advanced data structures.",
    replacement: "Time/Space complexity analysis + advanced data structures",
    patchModule: "Advanced Algorithms & Complexity",
    patchDescription:
      "Adds Big-O analysis, divide & conquer, graphs, and modern competitive/interview patterns.",
  },
  {
    keywords: /\b(waterfall|spiral model|v-model|v model)\b/i,
    label: "Waterfall / Legacy SDLC",
    reason:
      "Legacy sequential SDLC models have given way to Agile, DevOps, and CI/CD practices.",
    replacement: "Agile, Scrum & DevOps (CI/CD pipelines)",
    patchModule: "Agile & DevOps Practices",
    patchDescription:
      "Covers Scrum ceremonies, kanban, CI/CD pipelines, Infrastructure-as-Code, and trunk-based development.",
  },
  {
    keywords: /\b(mlp|multi.?layer perceptron|backpropagation)\b/i,
    label: "Classic Neural Network Theory",
    reason:
      "While foundational, focus has shifted to deep learning frameworks and modern model architectures.",
    replacement: "Deep Learning with PyTorch/TensorFlow + LLM concepts",
    patchModule: "Modern AI/ML & LLMs",
    patchDescription:
      "Adds PyTorch/TensorFlow, transformer architectures, and applied LLM prompting & fine-tuning fundamentals.",
  },
  {
    keywords: /\b(relational\s+algebra)\b/i,
    label: "Relational Algebra (theory only)",
    reason:
      "Theory is still relevant but industry now emphasizes practical SQL analytics and cloud databases.",
    replacement: "Practical SQL + Cloud & NoSQL databases",
    patchModule: "Modern Databases & SQL",
    patchDescription:
      "Bridges relational algebra into real SQL analytics plus cloud (Postgres) and NoSQL (MongoDB/Redis) storage.",
  },
  {
    keywords: /\b(8085|8086|8080|microprocessor)\b/i,
    label: "Legacy Microprocessors",
    reason:
      "Legacy 8-bit/16-bit microprocessor courses lag behind ARM, embedded Linux, and SoC platforms.",
    replacement: "ARM architecture & embedded Linux / SoCs",
    patchModule: "Modern Embedded Platforms",
    patchDescription:
      "Replaces legacy microprocessor labs with ARM Cortex, embedded Linux, and SoC-on-a-board workflows.",
  },
];

const PATCH_TEMPLATES: Record<
  string,
  { title: string; replaces: string; description: string }
> = {};
for (const rule of TOPIC_RULES) {
  PATCH_TEMPLATES[rule.patchModule] = {
    title: rule.patchModule,
    replaces: rule.label,
    description: rule.patchDescription,
  };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function normalizeTopic(topic: string): string {
  return topic
    .split(/\s+/)
    .map((w) => (w.length > 3 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
    .join(" ");
}

export function isServiceConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function auditSyllabus(syllabusText: string): Promise<AuditResult> {
  const lines = syllabusText
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const rawTopics = lines.filter((l) => /^[-*\d.\s]*[A-Za-z]/.test(l));
  const topics =
    rawTopics.length >= 2
      ? rawTopics.map(normalizeTopic)
      : tokenize(syllabusText)
          .filter((t) => !["the", "and", "unit", "module", "of", "to", "for"].includes(t))
          .slice(0, 12)
          .map(normalizeTopic);

  const seen = new Set<string>();
  const uniqueTopics: string[] = [];
  for (const t of topics) {
    const key = t.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueTopics.push(t);
    }
  }

  const detailedOutdated: AuditTopic[] = [];
  const detected: RegExpMatchArray[] = [];

  for (const rule of TOPIC_RULES) {
    const match = syllabusText.match(rule.keywords);
    if (!match) continue;
    detected.push(match);
    detailedOutdated.push({
      topic: rule.label,
      outdated: true,
      gap: 1,
      reason: rule.reason,
      replacement: rule.replacement,
      patchModule: rule.patchModule,
    });
  }

  const freshTopics: AuditTopic[] = uniqueTopics.map((t) => ({
    topic: t,
    outdated: false,
    gap: 0,
    reason: "Aligned with current industry practice.",
  }));

  let explicitGaps: { topic: string; gap: number }[] = [];
  if (isServiceConfigured()) {
    try {
      explicitGaps = await geminiSyllabusGaps(syllabusText, uniqueTopics);
    } catch {
      explicitGaps = [];
    }
  }

  const mergedOutdated = new Map<string, AuditTopic>();
  for (const o of detailedOutdated) mergedOutdated.set(o.topic.toLowerCase(), o);
  for (const g of explicitGaps) {
    if (!mergedOutdated.has(g.topic.toLowerCase())) {
      mergedOutdated.set(g.topic.toLowerCase(), {
        topic: g.topic,
        outdated: true,
        gap: Math.min(1, g.gap),
        reason: "Low alignment with current industry skills.",
        replacement: "Updated industry-aligned content",
        patchModule: "Industry Alignment Patch",
      });
    }
  }

  const outdatedTopics = Array.from(mergedOutdated.values());
  const gapCoverage = detected.length > 0 ? Math.min(0.95, detected.length * 0.22) : 0;
  const explicitGapAvg =
    explicitGaps.length > 0
      ? explicitGaps.reduce((s, g) => s + Math.min(1, g.gap), 0) / explicitGaps.length
      : 0;
  const gapPercent = Math.round(
    Math.min(0.96, Math.max(0.06, outdatedTopics.length * 0.18 + gapCoverage * 0.3 + explicitGapAvg * 0.2)) * 100
  );

  const currentScore = Math.max(4, 100 - gapPercent);
  const projectedScore = Math.min(100, currentScore + Math.round((gapPercent * 0.7)) );
  const improvement = projectedScore - currentScore;

  const patches = Array.from(
    mergedOutdated.values()
      .map((o) => o.patchModule!)
  )
    .filter((id, i, arr) => arr.indexOf(id) === i)
    .map((id) => ({
      id: id.replace(/\s+/g, "-").toLowerCase(),
      ...PATCH_TEMPLATES[id],
    }));

  return {
    syllabusText,
    topics: uniqueTopics,
    gapPercent,
    outdatedTopics,
    freshTopics: freshTopics.filter(
      (f) => !outdatedTopics.some((o) => o.topic.toLowerCase() === f.topic.toLowerCase())
    ),
    currentScore,
    projectedScore,
    improvement,
    patches,
    simulated: !isServiceConfigured(),
  };
}

async function geminiSyllabusGaps(
  syllabusText: string,
  topics: string[]
): Promise<{ topic: string; gap: number }[]> {
  const key = process.env.GEMINI_API_KEY as string;
  const prompt = `You are an expert curriculum auditor. Given the syllabus topics below, identify which are OUTDATED for today's industry and return JSON.
Return ONLY JSON of the form: {"outdated":[{"topic":"...","gap":0.0-1.0,"reason":"..."}]}
Do not return markdown. Topics: ${JSON.stringify(topics)}
Syllabus: ${syllabusText.slice(0, 3000)}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini request failed: ${res.status}`);
  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text || "")
    .replace(/```json|```/g, "")
    .trim();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.outdated)) return [];
  return parsed.outdated.map((o: { topic?: string; gap?: number }) => ({
    topic: String(o.topic || ""),
    gap: Number(o.gap || 0),
  }));
}
