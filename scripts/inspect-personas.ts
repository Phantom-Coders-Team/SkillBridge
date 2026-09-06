import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const aarav = await prisma.user.findUnique({
    where: { email: "aarav.sharma@student.edu" },
    include: {
      profile: true,
      assessments: true,
      proofsOfWork: true,
      applications: true,
      studentPitches: true,
      studentSlots: true,
    },
  });

  const rajesh = await prisma.user.findUnique({
    where: { email: "rajesh.kumar@faculty.edu" },
    include: {
      profile: true,
      labUnitsLed: true,
      facultyProgramApplications: true,
    },
  });

  const infosys = await prisma.user.findUnique({
    where: { email: "recruit@infosys.com" },
    include: {
      profile: true,
      challenges: true,
      learningPrograms: true,
      mentorSlots: true,
      jobPitches: true,
      customAssessments: true,
    },
  });

  const tpo = await prisma.user.findUnique({
    where: { email: "tpo@university.edu" },
    include: {
      profile: true,
    },
  });

  console.log("=== PERSONA CHECKS ===");
  console.log("Aarav Sharma:", {
    id: aarav?.id,
    assessmentsCount: aarav?.assessments.length,
    proofsCount: aarav?.proofsOfWork.length,
    applicationsCount: aarav?.applications.length,
    pitchesCount: aarav?.studentPitches.length,
    slotsCount: aarav?.studentSlots.length,
  });

  console.log("Dr. Rajesh Kumar:", {
    id: rajesh?.id,
    labUnitsCount: rajesh?.labUnitsLed.length,
    facultyApplicationsCount: rajesh?.facultyProgramApplications.length,
  });

  console.log("Infosys:", {
    id: infosys?.id,
    challengesCount: infosys?.challenges.length,
    learningProgramsCount: infosys?.learningPrograms.length,
    mentorSlotsCount: infosys?.mentorSlots.length,
    jobPitchesCount: infosys?.jobPitches.length,
    customAssessmentsCount: infosys?.customAssessments.length,
  });

  console.log("TPO Lakshmi Narayanan:", {
    id: tpo?.id,
    collegeName: tpo?.profile?.collegeName,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
