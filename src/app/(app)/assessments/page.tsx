import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ClipboardCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Radar,
  ArrowRight,
  Compass,
  Building2,
  Clock,
  Award,
  Zap,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";
import { SkillQuizModal } from "./SkillQuizModal";
import { ASSESSMENT_TRACKS } from "./assessmentData";
import { IndustryAssessmentBuilder } from "./IndustryAssessmentBuilder";
import { CustomQuizModal } from "./CustomQuizModal";

const DECAY_TONE: Record<string, BadgeTone> = {
  ACTIVE: "green",
  STALE: "amber",
  AT_RISK: "amber",
  EXPIRED: "red",
  RECERTIFIED: "blue",
  PENDING: "gray",
};

export default async function AssessmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isIndustry = user.role === "INDUSTRY" || user.role === "INDUSTRIES";

  // If no custom assessments exist, seed sample company assessments for rich presentation
  const existingCount = await prisma.customAssessment.count();
  if (existingCount === 0) {
    const industryUser = await prisma.user.findFirst({
      where: { role: { in: ["INDUSTRY", "INDUSTRIES"] } },
    });
    if (industryUser) {
      await prisma.customAssessment.createMany({
        data: [
          {
            companyId: industryUser.id,
            title: "Google Cloud & Generative AI Systems Screening Challenge",
            description:
              "Standardized evaluation testing real-world LLM orchestration, vector embeddings, fine-tuning workflows, and latency-sensitive inference deployment.",
            category: "Technical",
            primarySkill: "Generative AI & LLM Systems",
            durationMinutes: 10,
            passingScore: 75,
            status: "ACTIVE",
            questionsJson: JSON.stringify([
              {
                id: "gai-1",
                text: "When designing a Retrieval-Augmented Generation (RAG) pipeline for production enterprise documentation, how should you address semantic search relevancy decay over large document sets?",
                options: [
                  "Increase LLM temperature to 1.0 to encourage creative hallucinations",
                  "Use hybrid search combining dense vector embeddings with sparse BM25 keyword matching and a Cross-Encoder re-ranker",
                  "Store entire PDFs in a single prompt context window without chunking",
                  "Disable chunk overlap completely to save database memory",
                ],
                correctIndex: 1,
                explanation:
                  "Hybrid search (Dense + BM25) coupled with a Cross-Encoder re-ranking stage ensures high recall of exact technical keywords alongside deep semantic understanding.",
                skillTested: "RAG & Vector Search",
              },
              {
                id: "gai-2",
                text: "What is the primary advantage of Quantization-Aware Training (QAT) and FP8/INT4 precision in production LLM inference engines like TensorRT-LLM or vLLM?",
                options: [
                  "It increases the model parameters by 400%",
                  "It reduces GPU VRAM consumption and memory bandwidth bottlenecks while maintaining over 99% baseline accuracy",
                  "It prevents the model from generating code",
                  "It replaces GPU hardware with standard browser Web Workers",
                ],
                correctIndex: 1,
                explanation:
                  "Quantization reduces memory footprint and memory-bus bandwidth saturation, allowing higher throughput and concurrent request batching.",
                skillTested: "Model Optimization",
              },
              {
                id: "gai-3",
                text: "Which metric is most crucial when evaluating hallucination rates in enterprise customer-support chatbots?",
                options: [
                  "Raw character output count per second",
                  "Faithfulness & Groundedness against retrieved reference context documents",
                  "Number of exclamation marks generated",
                  "GPU cooling fan speed",
                ],
                correctIndex: 1,
                explanation:
                  "Faithfulness measures whether the model's claim can be directly inferred from retrieved reference documents without fabricating facts.",
                skillTested: "LLM Evaluation",
              },
            ]),
          },
          {
            companyId: industryUser.id,
            title: "Microsoft Azure Distributed Microservices & DevOps Assessment",
            description:
              "Evaluates production Kubernetes container orchestration, zero-trust cloud network security, and infrastructure resilience.",
            category: "Technical",
            primarySkill: "Cloud Architecture & DevOps",
            durationMinutes: 10,
            passingScore: 70,
            status: "ACTIVE",
            questionsJson: JSON.stringify([
              {
                id: "az-1",
                text: "In a Kubernetes deployment, what is the purpose of configuring both 'livenessProbe' and 'readinessProbe' with distinct endpoints?",
                options: [
                  "Liveness and readiness probes are completely identical and redundant",
                  "Liveness restarts unhealthy containers, while readiness determines whether the pod receives live ingress traffic from service endpoints",
                  "Readiness shuts down the entire cluster when CPU exceeds 50%",
                  "Liveness probes are only used for Windows containers",
                ],
                correctIndex: 1,
                explanation:
                  "Liveness probes detect deadlocks and restart containers, while readiness probes ensure traffic is only routed to pods that have completed initialization.",
                skillTested: "Kubernetes Orchestration",
              },
              {
                id: "az-2",
                text: "Under the Zero-Trust security model for cloud microservices, which strategy is mandatory for inter-service communication?",
                options: [
                  "Mutual TLS (mTLS) with cryptographically verified service identities and short-lived certificates",
                  "Allowing unencrypted HTTP traffic inside the private VPC subnet",
                  "Hardcoding shared API master keys across all microservice repos",
                  "Disabling firewall rules between frontend and database",
                ],
                correctIndex: 0,
                explanation:
                  "Zero Trust assumes network perimeters are breached and enforces mTLS authentication and least-privilege authorization on every RPC.",
                skillTested: "Cloud Security",
              },
            ]),
          },
        ],
      });
    }
  }

  const [assessments, myAssessments, companyAssessments] = await Promise.all([
    prisma.skillAssessment.findMany({
      where: user.role === "STUDENT" ? { studentId: user.id } : undefined,
      include: {
        student: {
          select: {
            name: true,
            profile: { select: { rollNumber: true, department: true } },
          },
        },
      },
      orderBy: { lastAssessedAt: "desc" },
      take: 50,
    }),
    prisma.skillAssessment.findMany({
      where: { studentId: user.id },
      orderBy: { lastAssessedAt: "desc" },
    }),
    prisma.customAssessment.findMany({
      where: isIndustry ? { companyId: user.id } : { status: "ACTIVE" },
      include: {
        company: {
          select: {
            name: true,
            profile: { select: { companyName: true } },
          },
        },
        submissions: {
          where: user.role === "STUDENT" ? { studentId: user.id } : undefined,
          include: {
            student: {
              select: {
                name: true,
                profile: { select: { rollNumber: true, department: true } },
              },
            },
          },
          orderBy: { completedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const avgMyScore =
    myAssessments.length > 0
      ? Math.round(myAssessments.reduce((sum, a) => sum + a.score, 0) / myAssessments.length)
      : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Student Skill Assessments"
        subtitle="Standardized questionnaire evaluations, skill gap analysis, and industry competency verification."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {isIndustry && <IndustryAssessmentBuilder />}
            <Link
              href="/skills"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 dark:border-indigo-800 dark:bg-indigo-950/40 px-3.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
            >
              <Compass className="size-4 text-indigo-600 dark:text-indigo-400" />
              <span>Skill Mapping & Career Guidance</span>
            </Link>
            <SkillQuizModal />
          </div>
        }
      />

      {/* Industry-Authored Screening Challenges Section */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3 border-b border-border-muted pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Building2 className="size-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Industry Partner Screening Challenges ({companyAssessments.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluations authored directly by enterprise partners for role-specific placement and internship screening.
              </p>
            </div>
          </div>
          {isIndustry && <IndustryAssessmentBuilder />}
        </div>

        {companyAssessments.length === 0 ? (
          <div className="py-8 text-center">
            <Building2 className="size-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs text-slate-500">No industry screening challenges active at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {companyAssessments.map((ca) => {
              const mySubmission = ca.submissions?.[0];
              const companyDisplayName = ca.company.profile?.companyName || ca.company.name;
              return (
                <div
                  key={ca.id}
                  className="rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/30 via-white to-purple-50/20 p-4 dark:border-purple-900/40 dark:from-purple-950/20 dark:via-surface dark:to-purple-950/10 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300">
                        <Building2 className="size-3.5" />
                        {companyDisplayName}
                      </span>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
                        {ca.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {ca.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {ca.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-purple-100 dark:border-purple-900/30 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Primary: <strong className="text-slate-900 dark:text-slate-200">{ca.primarySkill}</strong></span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="size-3 text-slate-400" />
                        {ca.durationMinutes} mins • Benchmark: {ca.passingScore}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {mySubmission ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={`inline-flex items-center gap-1 font-bold ${mySubmission.passed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                            {mySubmission.passed ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                            {mySubmission.score}% ({mySubmission.passed ? "Passed" : "Retake Available"})
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not Attempted Yet</span>
                      )}

                      {user.role === "STUDENT" && (
                        <CustomQuizModal
                          assessment={{
                            id: ca.id,
                            title: ca.title,
                            description: ca.description,
                            category: ca.category,
                            primarySkill: ca.primarySkill,
                            durationMinutes: ca.durationMinutes,
                            passingScore: ca.passingScore,
                            questionsJson: ca.questionsJson,
                            companyName: companyDisplayName,
                          }}
                          studentPreviousScore={mySubmission?.score}
                        />
                      )}

                      {isIndustry && (
                        <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                          {ca.submissions.length} Student Submissions
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Student Personal Benchmark Banner */}
      {myAssessments.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
              {avgMyScore}%
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">My Avg Competency</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {avgMyScore >= 80 ? "Top Tier" : avgMyScore >= 60 ? "Industry Ready" : "In Progress"}
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verified Skills</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {myAssessments.filter((a) => a.score >= 70).length} of {myAssessments.length} Skills
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gaps to Upskill</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {myAssessments.filter((a) => a.score < 70).length} Targeted Areas
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Direct Career Guidance Callout Banner */}
      {myAssessments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/40 dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-surface dark:to-indigo-950/20 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
              <Compass className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Personalized Career Guidance & Skill Mapping Available
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Your assessed competencies have been mapped to target industry sectors, high-growth job roles, and specific learning programs.
              </p>
            </div>
          </div>
          <Link
            href="/skills"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-2xs transition"
          >
            <span>View Career Guidance Hub</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Available Assessment Tracks Showcase */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3 border-b border-border-muted pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Standardized Assessment Tracks ({ASSESSMENT_TRACKS.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Targeted questionnaires across technical domains, soft skills, and aptitude reasoning.
            </p>
          </div>
          <SkillQuizModal />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {ASSESSMENT_TRACKS.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-xl border border-border-muted bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5 font-semibold">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    {t.category}
                  </span>
                  <span>{t.questions.length} Questions</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {t.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {t.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-border-muted/60 flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Key: {t.primarySkill}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{t.durationMinutes}m</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Table of all assessments */}
      {assessments.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No assessments completed yet"
          description="Click 'Take Skill Assessment' above to evaluate technical competencies and identify skill gaps."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-border-muted px-5 py-3 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {user.role === "STUDENT" ? "My Recent Evaluations" : "Recent Institutional Skill Evaluations"}
            </h3>
            <span className="text-xs text-slate-400">{assessments.length} Records</span>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-muted bg-slate-50/70 dark:bg-slate-800/40">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Student</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Department</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Skill Track</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Score</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {assessments.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800">
                  <td className="px-5 py-3 text-slate-900 dark:text-slate-100">
                    <span className="font-medium">{a.student.name}</span>
                    <span className="block text-xs text-slate-400 dark:text-slate-500">
                      {a.student.profile?.rollNumber || "ID: " + a.studentId.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                    {a.student.profile?.department || "General"}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {a.skillName}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{a.score}%</span>
                      <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full ${
                            a.score >= 80 ? "bg-emerald-500" : a.score >= 60 ? "bg-indigo-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${a.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={DECAY_TONE[a.decayStatus] ?? "gray"}>{a.decayStatus}</Badge>
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