import "dotenv/config";
import crypto from "crypto";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== ENRICHING DEMO DATA FOR SIH 2026 PRESENTATION ===");

  // 1. Populate missing publicToken and BlockchainTransaction for all approved Proof of Work
  const approvedProofs = await prisma.proofOfWork.findMany({
    where: {
      facultySignOff: "APPROVED",
      industrySignOff: "APPROVED",
    },
    include: { blockchainTx: true },
  });

  console.log(`Found ${approvedProofs.length} dual-approved proof of work records.`);
  let updatedTokensCount = 0;
  let mintedBlocksCount = 0;

  for (let i = 0; i < approvedProofs.length; i++) {
    const proof = approvedProofs[i];
    let token = proof.publicToken;

    if (!token) {
      token = `pow-${String(i + 1).padStart(3, "0")}-${proof.id.slice(-6)}`;
      await prisma.proofOfWork.update({
        where: { id: proof.id },
        data: { publicToken: token, issuedAt: proof.issuedAt ?? new Date() },
      });
      updatedTokensCount++;
    }

    if (!proof.blockchainTx) {
      const blockIndex = (await prisma.blockchainTransaction.count()) + 1;
      const prevTx = await prisma.blockchainTransaction.findFirst({
        orderBy: { blockIndex: "desc" },
      });
      const prevHash = prevTx?.blockHash ?? "0000000000000000000000000000000000000000000000000000000000000000";
      const dataToHash = `${blockIndex}-${proof.id}-${token}-${prevHash}-${Date.now()}`;
      const blockHash = "0x" + crypto.createHash("sha256").update(dataToHash).digest("hex");
      const merkleRoot = "0x" + crypto.createHash("sha256").update(`${proof.id}-${proof.studentId}`).digest("hex");

      await prisma.blockchainTransaction.create({
        data: {
          proofId: proof.id,
          blockIndex,
          blockHash,
          prevHash,
          merkleRoot,
          consensusState: "COMMITTED",
          nodeSignatures: 4,
          validatorNodes: JSON.stringify([
            "node-primary-institution-dtu",
            "node-industry-partner-infosys",
            "node-aicte-consortium-gateway",
            "node-validator-accreditation",
          ]),
        },
      });
      mintedBlocksCount++;
    }
  }
  console.log(`Updated ${updatedTokensCount} public tokens and minted ${mintedBlocksCount} blockchain blocks.`);

  // 2. Ensure Dr. Rajesh Kumar has active industrial training milestone application
  const rajesh = await prisma.user.findUnique({
    where: { email: "rajesh.kumar@faculty.edu" },
    include: { facultyProgramApplications: true },
  });

  if (rajesh) {
    if (rajesh.facultyProgramApplications.length === 0) {
      // Find a faculty program listing
      let listing = await prisma.facultyProgramListing.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!listing) {
        const industry = await prisma.user.findFirst({
          where: { role: { in: ["INDUSTRY", "INDUSTRIES"] } },
        });
        if (industry) {
          listing = await prisma.facultyProgramListing.create({
            data: {
              companyId: industry.id,
              title: "Enterprise Generative AI Systems & Cloud Immersion",
              description: "Hands-on industrial research sabbatical focusing on enterprise LLM orchestration, GPU inference optimization, and automated CI/CD deployment.",
              programType: "INDUSTRIAL_TRAINING",
              domain: "Artificial Intelligence & Cloud Computing",
              duration: "8 Weeks",
              location: "Bengaluru (Hybrid)",
              compensation: "₹ 75,000 / month research stipend",
              status: "OPEN",
            },
          });
        }
      }

      if (listing) {
        await prisma.facultyProgramApplication.create({
          data: {
            listingId: listing.id,
            facultyId: rajesh.id,
            message: "I am proposing to develop a comprehensive curriculum patch for 4th year distributed systems based on hands-on deployment benchmarks.",
            status: "APPROVED",
            milestoneStage: "IN_PROGRESS",
            workplanUrl: "https://github.com/skillbridge-research/faculty-immersion-workplan",
            mentorRating: 5,
            mentorFeedback: "Dr. Kumar has demonstrated outstanding leadership in bridging distributed computing concepts with real-world enterprise infrastructure. High recommendation for curriculum integration.",
            completionCertificateHash: "0x" + crypto.randomBytes(24).toString("hex"),
          },
        });
        console.log("Seeded active industrial training milestones for Dr. Rajesh Kumar.");
      }
    } else {
      console.log(`Dr. Rajesh Kumar already has ${rajesh.facultyProgramApplications.length} milestone application(s).`);
    }
  }

  // 3. Ensure TPO Lakshmi Narayanan has complete institution profile
  const tpo = await prisma.user.findUnique({
    where: { email: "tpo@university.edu" },
    include: { profile: true },
  });

  if (tpo) {
    await prisma.profile.upsert({
      where: { userId: tpo.id },
      update: {
        collegeName: "Delhi Technological University (DTU)",
        institutionType: "Public State University / Institute of National Importance",
        establishedYear: 1941,
        naacGrade: "A++",
        nbaAccredited: true,
        aicteApproved: true,
        city: "New Delhi",
        state: "Delhi",
        totalStudents: 12400,
        averagePlacementRate: 88.4,
        highestPackage: "₹ 64.0 LPA",
        averagePackage: "₹ 15.2 LPA",
        designation: "Head of Training and Corporate Placements",
        phone: "+91 11 2787 1018",
      },
      create: {
        userId: tpo.id,
        collegeName: "Delhi Technological University (DTU)",
        institutionType: "Public State University / Institute of National Importance",
        establishedYear: 1941,
        naacGrade: "A++",
        nbaAccredited: true,
        aicteApproved: true,
        city: "New Delhi",
        state: "Delhi",
        totalStudents: 12400,
        averagePlacementRate: 88.4,
        highestPackage: "₹ 64.0 LPA",
        averagePackage: "₹ 15.2 LPA",
        designation: "Head of Training and Corporate Placements",
        phone: "+91 11 2787 1018",
      },
    });
    console.log("Updated TPO Lakshmi Narayanan's institution details to Delhi Technological University (DTU).");
  }

  console.log("=== ENRICHMENT COMPLETE ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
