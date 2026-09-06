import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const counts = {
    users: await prisma.user.count(),
    projects: await prisma.project.count(),
    proofs: await prisma.proofOfWork.count(),
    assessments: await prisma.skillAssessment.count(),
    challenges: await prisma.industryChallenge.count(),
    labUnits: await prisma.labUnit.count(),
    syllabi: await prisma.syllabus.count(),
    learningPrograms: await prisma.learningProgram.count(),
    internshipApplications: await prisma.internshipApplication.count(),
    jobPitches: await prisma.jobPitch.count(),
    mentorSlots: await prisma.mentorSlot.count(),
    benchmarks: await prisma.hiringBenchmark.count(),
    customAssessments: await prisma.customAssessment.count(),
    submissions: await prisma.assessmentSubmission.count(),
    facultyPrograms: await prisma.facultyProgramListing.count(),
    facultyApplications: await prisma.facultyProgramApplication.count(),
  };

  console.log("Database Counts:", JSON.stringify(counts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
