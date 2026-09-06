import "dotenv/config";
import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting PRI and Reverse Placement Data Enrichment...");

  // 1. Normalize existing JobPitch records so priScore is on a 0..1000 scale
  const pitches = await prisma.jobPitch.findMany();
  console.log(`Found ${pitches.length} job pitches.`);
  for (const p of pitches) {
    if (p.priScore > 0 && p.priScore <= 1.0) {
      const normalized = Math.round(p.priScore * 1000);
      await prisma.jobPitch.update({
        where: { id: p.id },
        data: { priScore: normalized },
      });
      console.log(`Normalized pitch ${p.id} priScore from ${p.priScore} to ${normalized}`);
    }
  }

  // 2. Fetch primary students
  const primaryEmails = [
    "aarav.sharma@student.edu",
    "priya.patel@student.edu",
    "rohan.verma@student.edu",
    "sneha.iyer@student.edu",
    "vikram.singh@student.edu",
    "ananya.rao@student.edu",
    "karthik.nair@student.edu",
    "meera.krishnan@student.edu",
  ];

  const primaryStudents = await prisma.user.findMany({
    where: { email: { in: primaryEmails } },
    include: { profile: true, assessments: true, projects: true, proofsOfWork: true },
  });
  console.log(`Found ${primaryStudents.length} primary students.`);

  // Ensure high quality skills & projects for primary students so they unlock reverse placement
  for (const s of primaryStudents) {
    // Add additional skill assessments if student has < 4
    if (s.assessments.length < 4) {
      const skillSets: Record<string, Array<[string, number]>> = {
        "aarav.sharma@student.edu": [
          ["Full-Stack Architecture", 94],
          ["Cloud Systems", 90],
          ["Next.js & TypeScript", 96],
        ],
        "priya.patel@student.edu": [
          ["Spring Cloud Microservices", 91],
          ["PostgreSQL Optimization", 88],
          ["Docker & Kubernetes", 89],
        ],
        "rohan.verma@student.edu": [
          ["Control Systems & MATLAB", 89],
          ["Embedded Firmware", 87],
          ["IoT Protocols", 85],
        ],
        "sneha.iyer@student.edu": [
          ["Finite Element Analysis", 90],
          ["SolidWorks & CAD", 92],
          ["Thermal Simulations", 88],
        ],
        "vikram.singh@student.edu": [
          ["Cross-Platform Flutter", 93],
          ["UI Design Systems", 90],
          ["Firebase Realtime Sync", 89],
        ],
        "ananya.rao@student.edu": [
          ["Data Pipelines & PySpark", 88],
          ["Predictive Modeling", 86],
          ["Advanced SQL", 92],
        ],
        "karthik.nair@student.edu": [
          ["Digital VLSI Design", 91],
          ["Verilog Synthesis", 90],
          ["FPGA Prototyping", 87],
        ],
        "meera.krishnan@student.edu": [
          ["Golang Distributed Microservices", 95],
          ["gRPC & Protocol Buffers", 94],
          ["Kubernetes Operator SDK", 92],
        ],
      };

      const needed = skillSets[s.email] || [["Core Engineering", 88]];
      for (const [skillName, score] of needed) {
        const exists = s.assessments.some(a => a.skillName === skillName);
        if (!exists) {
          await prisma.skillAssessment.create({
            data: {
              studentId: s.id,
              skillName,
              score,
              decayStatus: "ACTIVE",
              verifiedAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 86400000),
              lastAssessedAt: new Date(),
            },
          });
          console.log(`Added assessment ${skillName} (${score}) for ${s.name}`);
        }
      }
    }

    // Ensure at least 3-4 projects for each primary student
    if (s.projects.length < 3) {
      const projectsToCreate = [
        {
          title: `${s.profile?.department || "Software"} Capstone: Scalable Distributed Core`,
          description: "High-throughput production grade system with automated CI/CD and rigorous unit testing.",
          projectType: "CAPSTONE",
          status: "COMPLETED",
          domain: s.profile?.department || "Computer Science",
          techStack: s.profile?.skills || "TypeScript, Python, Docker",
        },
        {
          title: "Micro-Consultancy: Low-Latency Service Refactor",
          description: "Optimized response latency and database pooling for industry benchmark requirements.",
          projectType: "MICRO_CONSULTANCY",
          status: "COMPLETED",
          domain: "Systems Engineering",
          techStack: "PostgreSQL, Redis, Docker",
        },
        {
          title: "Enterprise Innovation Sprint",
          description: "Dual-evaluated corporate challenge prototype delivered under corporate partner guidance.",
          projectType: "CAPSTONE",
          status: "IN_PROGRESS",
          domain: "Enterprise Systems",
          techStack: "Cloud Architecture, Git, Linux",
        },
      ];

      for (let i = s.projects.length; i < 3; i++) {
        const pDef = projectsToCreate[i];
        if (pDef) {
          const newProj = await prisma.project.create({
            data: {
              title: pDef.title,
              description: pDef.description,
              projectType: pDef.projectType,
              status: pDef.status,
              domain: pDef.domain,
              techStack: pDef.techStack,
              ownerId: s.id,
            },
          });

          // Also create a verified proof of work for completed projects
          if (pDef.status === "COMPLETED") {
            await prisma.proofOfWork.create({
              data: {
                studentId: s.id,
                projectId: newProj.id,
                description: `Verified cryptographic proof of work for ${pDef.title}. Code quality and unit tests certified.`,
                facultySignOff: "APPROVED",
                industrySignOff: "APPROVED",
                artifactUrl: "https://github.com/skillbridge/verified-capstone",
              },
            });
          }
        }
      }
      console.log(`Ensured projects and proofs for ${s.name}`);
    }
  }

  // 3. Now let's enrich a batch of 25 other students across departments with realistic activity
  const otherStudents = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      email: { notIn: primaryEmails },
      profile: { isNot: null },
    },
    include: { profile: true, assessments: true, projects: true },
    take: 25,
    orderBy: { name: "asc" },
  });

  console.log(`Enriching ${otherStudents.length} cohort students with realistic skill assessments and projects...`);

  const departmentSkills: Record<string, string[]> = {
    "Computer Science": ["React", "Python", "Node.js", "Docker", "Algorithms", "System Design"],
    "Information Technology": ["Cloud Computing", "SQL", "Cybersecurity", "REST APIs", "Data Pipelines"],
    "Electronics & Communication": ["VLSI Design", "Verilog", "Embedded Systems", "Signal Processing", "IoT"],
    "Electrical Engineering": ["Power Systems", "Circuit Design", "MATLAB", "Microcontrollers", "Automation"],
    "Mechanical Engineering": ["CAD/CAM", "Thermodynamics", "ANSYS", "Robotics", "Mechatronics"],
  };

  let enrichedCount = 0;
  for (const s of otherStudents) {
    const dept = s.profile?.department || "Computer Science";
    const possibleSkills = departmentSkills[dept] || departmentSkills["Computer Science"];

    if (s.assessments.length === 0) {
      // Create 2-4 realistic assessments with scores between 72 and 94
      const count = 2 + (enrichedCount % 3);
      for (let i = 0; i < count; i++) {
        const skillName = possibleSkills[i % possibleSkills.length];
        const baseScore = 75 + ((enrichedCount * 7 + i * 11) % 20);
        await prisma.skillAssessment.create({
          data: {
            studentId: s.id,
            skillName,
            score: Math.min(95, baseScore),
            decayStatus: i === 0 ? "ACTIVE" : "RECERTIFIED",
            verifiedAt: new Date(Date.now() - (i + 1) * 7 * 86400000),
            lastAssessedAt: new Date(),
          },
        });
      }
    }

    if (s.projects.length === 0) {
      const projCount = 1 + (enrichedCount % 3);
      for (let i = 0; i < projCount; i++) {
        const newProj = await prisma.project.create({
          data: {
            title: `${dept} Applied Innovation: Module ${i + 1}`,
            description: `Industry-aligned project deliverable in ${dept} with code repository and faculty review.`,
            projectType: "CAPSTONE",
            status: i === 0 ? "COMPLETED" : "IN_PROGRESS",
            domain: dept,
            techStack: s.profile?.skills || possibleSkills.slice(0, 3).join(", "),
            ownerId: s.id,
          },
        });

        if (i === 0 && (enrichedCount % 2 === 0)) {
          await prisma.proofOfWork.create({
            data: {
              studentId: s.id,
              projectId: newProj.id,
              description: `Verified capstone submission for ${s.name} in ${dept}.`,
              facultySignOff: "APPROVED",
              industrySignOff: enrichedCount % 4 === 0 ? "APPROVED" : "PENDING",
            },
          });
        }
      }
    }
    enrichedCount++;
  }

  console.log(`Enrichment finished successfully. Enriched ${enrichedCount} students.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
