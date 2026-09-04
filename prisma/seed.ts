import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Academia-Industry Collaboration Portal...");

  await prisma.blockchainTransaction.deleteMany();
  await prisma.erupiVoucher.deleteMany();
  await prisma.jobPitch.deleteMany();
  await prisma.dualGrading.deleteMany();
  await prisma.challengeApplication.deleteMany();
  await prisma.labUnitMember.deleteMany();
  await prisma.labUnit.deleteMany();
  await prisma.industryChallenge.deleteMany();
  await prisma.mentorSlot.deleteMany();
  await prisma.tokenTransaction.deleteMany();
  await prisma.tokenLedger.deleteMany();
  await prisma.skillAssessment.deleteMany();
  await prisma.proofOfWork.deleteMany();
  await prisma.project.deleteMany();
  await prisma.syllabus.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hiringBenchmark.deleteMany();
  await prisma.sabbaticalListing.deleteMany();
  await prisma.userDocument.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.facultyProgramApplication.deleteMany();
  await prisma.facultyProgramListing.deleteMany();
  await prisma.internshipApplication.deleteMany();
  await prisma.learningProgram.deleteMany();

  const passwordHash = await bcrypt.hash("Password@123", 10);

  // ----- STUDENTS -----
  const students: Array<[string, string, string, { year: number; rollNumber: string; department: string; skills: string }]> = [
    ["Aarav Sharma", "aarav.sharma@student.edu", "STU001", { year: 4, rollNumber: "CS21B001", department: "Computer Science", skills: "React,Node.js,Python,Machine Learning" }],
    ["Priya Patel", "priya.patel@student.edu", "STU002", { year: 3, rollNumber: "CS22B014", department: "Computer Science", skills: "Java,Spring,SQL,Docker" }],
    ["Rohan Verma", "rohan.verma@student.edu", "STU003", { year: 4, rollNumber: "EE21B007", department: "Electrical Engineering", skills: "MATLAB,Circuit Design,Embedded C" }],
    ["Sneha Iyer", "sneha.iyer@student.edu", "STU004", { year: 3, rollNumber: "ME22B019", department: "Mechanical Engineering", skills: "CAD,Simulation,GD&T" }],
    ["Vikram Singh", "vikram.singh@student.edu", "STU005", { year: 4, rollNumber: "CS21B023", department: "Computer Science", skills: "Flutter,Firebase,UI/UX" }],
    ["Ananya Rao", "ananya.rao@student.edu", "STU006", { year: 2, rollNumber: "IT23B005", department: "Information Technology", skills: "Python,Data Analysis,SQL" }],
    ["Karthik Nair", "karthik.nair@student.edu", "STU007", { year: 3, rollNumber: "EC22B011", department: "Electronics & Communication", skills: "VLSI,Verilog,Signal Processing" }],
    ["Meera Krishnan", "meera.krishnan@student.edu", "STU008", { year: 4, rollNumber: "CS21B031", department: "Computer Science", skills: "Go,Microservices,Kubernetes" }],
  ];

  const studentUserIds: string[] = [];
  for (const [name, email, roll, details] of students) {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "STUDENT",
        profile: {
          create: {
            department: details.department,
            year: details.year,
            rollNumber: roll,
            skills: details.skills,
            bio: `${name} is a ${details.year}th year ${details.department} student passionate about building real-world solutions.`,
            location: "Bengaluru, India",
          },
        },
      },
    });
    studentUserIds.push(user.id);
  }

  // ----- ACADEMICIANS -----
  const faculty: Array<[string, string, string, string]> = [
    ["Dr. Rajesh Kumar", "rajesh.kumar@faculty.edu", "Professor", "Computer Science"],
    ["Dr. Sunita Rao", "sunita.rao@faculty.edu", "Associate Professor", "Electrical Engineering"],
    ["Prof. Amit Deshpande", "amit.deshpande@faculty.edu", "Assistant Professor", "Mechanical Engineering"],
    ["Dr. Kavitha Menon", "kavitha.menon@faculty.edu", "Professor", "Information Technology"],
  ];

  const facultyIds: string[] = [];
  for (const [name, email, designation, dept] of faculty) {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ACADEMICIAN",
        profile: {
          create: {
            department: dept,
            designation,
            bio: `${designation} in the Department of ${dept}. Mentor for capstone and micro-consultancy projects.`,
            location: "VIT Chennai Campus",
          },
        },
      },
    });
    facultyIds.push(user.id);
  }

  // ----- INDUSTRIES -----
  const industry: Array<[string, string, string, string, string]> = [
    ["Infosys", "recruit@infosys.com", "Senior Hiring Manager", "Talent Acquisition", "Infosys Limited, Bengaluru"],
    ["TCS", "campus@tcs.com", "Campus Recruitment Lead", "Campus Hiring", "Tata Consultancy Services, Pune"],
    ["Wipro", "talent@wipro.com", "Technical Recruiter", "Talent Acquisition", "Wipro Limited, Bengaluru"],
    ["Zoho", "campus@zohocorp.com", "Engineering Manager", "Platform Engineering", "Zoho Corporation, Chennai"],
    ["HCLTech", "careers@hcltech.com", "Program Manager", "Innovation Labs", "HCL Technologies, Noida"],
    ["All India Institute of Ayurveda (AIIA)", "research@aiia.gov.in", "Head of Digital Health & Innovation", "Ayush Bio-Informatics", "All India Institute of Ayurveda, New Delhi"],
  ];

  const industryUserIds: string[] = [];
  for (const [company, email, designation, dept, loc] of industry) {
    const user = await prisma.user.create({
      data: {
        name: company,
        email,
        passwordHash,
        role: "INDUSTRIES",
        profile: {
          create: {
            companyName: company,
            designation,
            department: dept,
            bio: `${company} collaborates with academia on skill-based hiring, capstone projects, and micro-consultancy work.`,
            location: loc,
          },
        },
      },
    });
    industryUserIds.push(user.id);
  }

  // ----- INSTITUTIONS -----
  const institutions: Array<[string, string, string]> = [
    ["Dr. Lakshmi Narayanan", "tpo@university.edu", "Training & Placement Officer"],
    ["Mr. Suresh Babu", "tpo.assist@university.edu", "Assistant TPO"],
  ];

  for (const [name, email, designation] of institutions) {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "INSTITUTIONS",
        profile: {
          create: {
            designation,
            department: "Training & Placement Cell",
            bio: `${designation} overseeing industry partnerships, placements, and internship facilitation.`,
            location: "University Campus",
          },
        },
      },
    });
  }

  // ----- SYLLABUS -----
  const syllabi: Array<[string, string, string, number]> = [
    ["Advanced Data Structures", "Computer Science", JSON.stringify(["Trees", "Graphs", "Hashing", "Dynamic Programming", "Tries"]), 0.35],
    ["Machine Learning Fundamentals", "Computer Science", JSON.stringify(["Regression", "Classification", "Clustering", "Neural Networks", "Model Evaluation"]), 0.15],
    ["Power Systems", "Electrical Engineering", JSON.stringify(["AC Circuits", "Transformers", "Transmission Lines", "Load Flow Analysis"]), 0.45],
    ["Thermodynamics", "Mechanical Engineering", JSON.stringify(["Zeroth Law", "First Law", "Second Law", "Entropy", "Power Cycles"]), 0.4],
    ["Database Management Systems", "Information Technology", JSON.stringify(["ER Modeling", "SQL", "Normalization", "Transactions", "NoSQL"]), 0.2],
    ["VLSI Design", "Electronics & Communication", JSON.stringify(["CMOS Logic", "Layout Design", "HDL", "Timing Analysis"]), 0.3],
    ["Operating Systems", "Computer Science", JSON.stringify(["Processes", "Scheduling", "Memory Management", "File Systems", "Concurrency"]), 0.25],
    ["Embedded Systems", "Electronics & Communication", JSON.stringify(["Microcontrollers", "RTOS", "Interfacing", "IoT"]), 0.5],
  ];

  await prisma.syllabus.createMany({
    data: syllabi.map(([title, department, topicsJson, obsolescenceScore]) => ({
      title: title as string,
      department: department as string,
      topicsJson: topicsJson as string,
      obsolescenceScore: obsolescenceScore as number,
      lastReviewedAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000),
    })),
  });

  // ----- PROJECTS -----
  const projectDefs = [
    { title: "AI-Based Crop Disease Detection", description: "Develop a computer vision model to detect crop diseases from leaf images and provide treatment recommendations.", type: "CAPSTONE", status: "IN_PROGRESS", domain: "Agriculture / AI", techStack: "Python, TensorFlow, OpenCV", owner: studentUserIds[0] },
    { title: "Smart Campus Navigation System", description: "Indoor navigation app for the campus with AR wayfinding for students and visitors.", type: "CAPSTONE", status: "APPROVED", domain: "Mobile / IoT", techStack: "Flutter, Bluetooth Beacons", owner: studentUserIds[4] },
    { title: "Micro-Consultancy: API Performance Audit", description: "Analyze and optimize a legacy REST API for a retail client, reducing p95 latency.", type: "MICRO_CONSULTANCY", status: "IN_PROGRESS", domain: "Web Performance", techStack: "Node.js, PostgreSQL, Redis", owner: studentUserIds[7] },
    { title: "EV Battery Thermal Management", description: "Design a battery cooling system for electric vehicles to maintain optimal operating temperature.", type: "CAPSTONE", status: "PROPOSED", domain: "Mechanical / EV", techStack: "MATLAB, ANSYS", owner: studentUserIds[3] },
    { title: "Micro-Consultancy: Hiring Dashboard", description: "Build a data dashboard to visualize campus hiring metrics and skill gaps.", type: "MICRO_CONSULTANCY", status: "COMPLETED", domain: "Data Analytics", techStack: "React, D3.js", owner: studentUserIds[5] },
    { title: "IoT Industrial Monitoring", description: "Deploy an IoT sensor network for predictive maintenance on a manufacturing line.", type: "CAPSTONE", status: "DRAFT", domain: "IoT / Industry 4.0", techStack: "Arduino, MQTT, Grafana", owner: studentUserIds[2] },
  ];

  for (const p of projectDefs) {
    await prisma.project.create({
      data: {
        title: p.title,
        description: p.description,
        projectType: p.type,
        status: p.status,
        domain: p.domain,
        techStack: p.techStack,
        ownerId: p.owner,
      },
    });
  }

  // ----- SKILL ASSESSMENTS -----
  const skillAssessments = [
    [studentUserIds[0], "Machine Learning", 92, "ACTIVE"],
    [studentUserIds[0], "Python", 95, "ACTIVE"],
    [studentUserIds[0], "React", 78, "STALE"],
    [studentUserIds[0], "SQL", 74, "EXPIRED"],
    [studentUserIds[0], "Docker", 84, "RECERTIFIED"],
    [studentUserIds[1], "Java", 88, "STALE"],
    [studentUserIds[1], "Spring Boot", 74, "ACTIVE"],
    [studentUserIds[2], "Embedded C", 90, "ACTIVE"],
    [studentUserIds[3], "CAD Modeling", 85, "STALE"],
    [studentUserIds[4], "Flutter", 91, "ACTIVE"],
    [studentUserIds[5], "Data Analysis", 80, "ACTIVE"],
    [studentUserIds[7], "Go", 87, "ACTIVE"],
  ] as const;

  for (const [sid, skill, score, decay] of skillAssessments) {
    await prisma.skillAssessment.create({
      data: {
        studentId: sid as string,
        skillName: skill as string,
        score: score as number,
        verifiedAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000),
        decayStatus: decay,
        lastAssessedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000),
      },
    });
  }

  // ----- TOKEN LEDGERS + TRANSACTIONS -----
  for (let i = 0; i < studentUserIds.length; i++) {
    const initialBalance = 100 + i * 25;
    const ledger = await prisma.tokenLedger.create({
      data: {
        studentId: studentUserIds[i],
        balance: initialBalance,
        transactions: {
          create: [
            { amount: initialBalance, type: "CREDIT", reason: "Onboarding skill tokens" },
            { amount: -20, type: "DEBIT", reason: "Mentorship session booking" },
            { amount: 35, type: "CREDIT", reason: "Completed micro-consultancy task" },
            { amount: -15, type: "DEBIT", reason: "Resume review request" },
          ],
        },
      },
    });
    // Recompute the correct balance after debits/credits
    const net = initialBalance - 20 + 35 - 15;
    await prisma.tokenLedger.update({
      where: { id: ledger.id },
      data: { balance: net },
    });
  }

  // ----- MENTOR SLOTS -----
  const now = Date.now();
  const day = 86400000;
  const mentorSlotDefs = [
    [industryUserIds[0], studentUserIds[0], 2, "Career guidance & placement prep"],
    [industryUserIds[1], studentUserIds[4], 5, "Resume review & mock interview"],
    [industryUserIds[2], studentUserIds[1], 8, "Tech stack roadmap discussion"],
    [industryUserIds[3], null, 4, "Open office hours - building systems"],
    [industryUserIds[4], studentUserIds[7], 10, "Microservices architecture deep-dive"],
    [industryUserIds[0], null, 1, "Open mentorship - GenAI careers"],
  ] as const;

  for (const [ind, stu, offsetDays, topic] of mentorSlotDefs) {
    const status = stu ? "BOOKED" : "AVAILABLE";
    await prisma.mentorSlot.create({
      data: {
        industryId: ind as string,
        studentId: (stu as string | null) ?? undefined,
        timeSlot: new Date(now + (offsetDays as number) * day),
        durationMins: 30,
        topic: topic as string,
        status: status,
      },
    });
  }

  // ----- JOB PITCHES -----
  const jobPitchDefs = [
    [industryUserIds[0], studentUserIds[0], 0.92, "OFFERED", 25000, "Systems Engineer - GenAI Track"],
    [industryUserIds[1], studentUserIds[1], 0.86, "SHORTLISTED", 30000, "Java Backend Developer"],
    [industryUserIds[2], studentUserIds[4], 0.81, "PITCHED", 22000, "Mobile App Developer"],
    [industryUserIds[3], studentUserIds[7], 0.94, "ACCEPTED", 40000, "Platform Engineer"],
    [industryUserIds[4], studentUserIds[5], 0.76, "PITCHED", 20000, "Data Analyst Intern"],
  ] as const;

  for (const [ind, stu, pri, status, stipend, role] of jobPitchDefs) {
    await prisma.jobPitch.create({
      data: {
        industryId: ind as string,
        studentId: stu as string,
        priScore: pri as number,
        status: status,
        stipend: stipend as number,
        roleDetails: role as string,
      },
    });
  }

  // ----- PROOFS OF WORK -----
  const completedProject = await prisma.project.findFirst({
    where: { status: "COMPLETED" },
  });
  const inProgressProjects = await prisma.project.findMany({
    where: { status: "IN_PROGRESS" },
  });

  if (completedProject) {
    await prisma.proofOfWork.create({
      data: {
        studentId: studentUserIds[5],
        projectId: completedProject.id,
        artifactUrl: "https://github.com/ananya-rao/hiring-dashboard",
        description: "Delivered an interactive hiring analytics dashboard with skill-gap visualization.",
        facultySignOff: "APPROVED",
        industrySignOff: "APPROVED",
        badgeQrCode: `QR-${completedProject.id.slice(0, 8)}-POW-001`,
        publicToken: "a1b2c3-pow-001",
        issuedAt: new Date(Date.now() - 12 * day),
      },
    });

    const firstProof = await prisma.proofOfWork.findUnique({ where: { publicToken: "a1b2c3-pow-001" } });
    if (firstProof) {
      await prisma.blockchainTransaction.create({
        data: {
          proofId: firstProof.id,
          blockIndex: 1,
          blockHash: "0x8f43a968b37f2d4e78a2e1732e98c5321528b188c0a5200c92ec17c46a6f1932",
          prevHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          merkleRoot: "0x3b89f2a9e527f3c42817d23e5900b7498c199214e21a8d0554d3e41b9c782103",
          consensusState: "COMMITTED",
          nodeSignatures: 4,
          validatorNodes: JSON.stringify(["node-vit-chennai", "node-infosys-recruit", "node-aicte-gateway", "node-consortium"]),
        },
      });
    }

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 6);
    await prisma.erupiVoucher.create({
      data: {
        voucherCode: "ERUPI-CERT-7B89",
        industryId: industryUserIds[0],
        studentId: studentUserIds[0],
        amount: 10000,
        purposeCode: "EDTECH_CERTIFICATION",
        status: "ACTIVE",
        expiryDate: expiry,
      },
    });
  }

  for (let i = 0; i < Math.min(2, inProgressProjects.length); i++) {
    await prisma.proofOfWork.create({
      data: {
        studentId: studentUserIds[0],
        projectId: inProgressProjects[i].id,
        artifactUrl: "https://github.com/aarav-sharma/crop-disease",
        description: "Mid-term proof of work with model accuracy of 94.2% on validation set.",
        facultySignOff: i === 0 ? "APPROVED" : "PENDING",
        industrySignOff: i === 0 ? "APPROVED" : "PENDING",
        badgeQrCode: `QR-${inProgressProjects[i].id.slice(0, 8)}-POW-00${i + 2}`,
        publicToken: i === 0 ? "a1b2c3-pow-002" : undefined,
        issuedAt: i === 0 ? new Date(Date.now() - 5 * day) : undefined,
      },
    });
  }

  // ----- INDUSTRY CHALLENGES (Capstone & R&D Marketplace) -----
  const challengeDefs = [
    {
      ind: 0, title: "GenAI Document Intelligence", type: "R_AND_D",
      desc: "Build an enterprise document Q&A system with grounded retrieval for contract analysis.",
      domain: "Generative AI", tech: "Python, LangChain, Vector DB", objs: "LLM integration, RAG pipeline, evaluation",
      stipend: 15000, rnd: true, status: "OPEN", deadlineOffset: 25,
    },
    {
      ind: 1, title: "Sustainability Footprint Dashboard", type: "CAPSTONE",
      desc: "Create a corporate carbon-footprint calculator with ESG reporting for client engagements.",
      domain: "Sustainability / Analytics", tech: "React, Python", objs: "Data modeling, dashboard, ESG standards",
      stipend: 12000, rnd: false, status: "OPEN", deadlineOffset: 18,
    },
    {
      ind: 2, title: "Predictive Attrition Model", type: "R_AND_D",
      desc: "Develop an ML model predicting workforce attrition using employee engagement telemetry.",
      domain: "HR Analytics / ML", tech: "Python, Scikit-learn", objs: "Feature engineering, model training, explainability",
      stipend: 18000, rnd: true, status: "OPEN", deadlineOffset: 30,
    },
    {
      ind: 3, title: "Edge-AI Anomaly Detection", type: "MICRO_CONSULTANCY",
      desc: "Design a lightweight anomaly-detection pipeline that runs on retail edge devices.",
      domain: "Edge Computing", tech: "TensorFlow Lite, C++", objs: "Model quantization, on-device latency",
      stipend: 20000, rnd: true, status: "ASSIGNED", deadlineOffset: 12,
    },
    {
      ind: 4, title: "Digital Twin for Campus Energy", type: "CAPSTONE",
      desc: "Simulate a campus energy grid as a digital twin to optimize power consumption.",
      domain: "IoT / Digital Twin", tech: "Simulation, IoT", objs: "Real-time simulation, optimization algorithms",
      stipend: 10000, rnd: false, status: "OPEN", deadlineOffset: 40,
    },
    {
      ind: 5, title: "AyurVision: AI Botanical Identification & Adulteration Screening", type: "R_AND_D",
      desc: "Develop a computer-vision and deep-learning pipeline to classify medicinal plants and detect commercial adulterants in raw herbal supplies for standard testing.",
      domain: "AI / Ayush Informatics", tech: "PyTorch, OpenCV, FastAPI", objs: "Multi-class herb classification, mobile camera inference",
      stipend: 22000, rnd: true, status: "OPEN", deadlineOffset: 35,
    },
  ] as const;

  const createdChallenges: string[] = [];
  await Promise.all(
    challengeDefs.map(async (c, idx) => {
      const challenge = await prisma.industryChallenge.create({
        data: {
          industryId: industryUserIds[c.ind],
          title: c.title,
          description: c.desc,
          challengeType: c.type,
          domain: c.domain,
          techStack: c.tech,
          objectives: c.objs,
          stipend: c.stipend,
          rndOnly: c.rnd,
          status: c.status,
          deadline: new Date(now + (c.deadlineOffset + idx) * day),
        },
      });
      createdChallenges.push(challenge.id);
      return challenge;
    }),
  );

  // ----- LAB UNITS (Faculty + Student R&D teams) -----
  const labUnit1 = await prisma.labUnit.create({
    data: {
      name: "GenAI Research Lab",
      facultyId: facultyIds[0],
      challengeId: createdChallenges[0],
      status: "ACTIVE",
      members: {
        create: [
          { studentId: studentUserIds[0] },
          { studentId: studentUserIds[7] },
        ],
      },
    },
  });

  const labUnit2 = await prisma.labUnit.create({
    data: {
      name: "Attrition Analytics Squad",
      facultyId: facultyIds[3],
      challengeId: createdChallenges[2],
      status: "ACTIVE",
      members: {
        create: [
          { studentId: studentUserIds[1] },
          { studentId: studentUserIds[5] },
          { studentId: studentUserIds[0] },
        ],
      },
    },
  });

  const labUnit3 = await prisma.labUnit.create({
    data: {
      name: "Edge Intelligence Team",
      facultyId: facultyIds[1],
      challengeId: createdChallenges[3],
      status: "ACTIVE",
      members: {
        create: [
          { studentId: studentUserIds[2] },
          { studentId: studentUserIds[6] },
        ],
      },
    },
  });

  // ----- CHALLENGE APPLICATIONS -----
  await prisma.challengeApplication.create({
    data: {
      challengeId: createdChallenges[0],
      labUnitId: labUnit1.id,
      proposal: "RAG-based architecture with vector embeddings and traced evaluations.",
      status: "SELECTED",
    },
  });
  await prisma.challengeApplication.create({
    data: {
      challengeId: createdChallenges[2],
      labUnitId: labUnit2.id,
      proposal: "Feature importance-driven gradient boosting with SHAP explainability.",
      status: "SELECTED",
    },
  });
  await prisma.challengeApplication.create({
    data: {
      challengeId: createdChallenges[3],
      labUnitId: labUnit3.id,
      proposal: "Quantized TFLite model with sub-50ms on-device inference.",
      status: "SHORTLISTED",
    },
  });

  // ----- DUAL GRADINGS (Faculty academic marks + Industry job readiness) -----
  await prisma.dualGrading.create({
    data: {
      challengeId: createdChallenges[3],
      labUnitId: labUnit3.id,
      academicMarks: 86,
      jobReadinessScore: 82,
      facultyRemarks: "Strong technical depth; add production hardening.",
      industryRemarks: "Edge latency within spec; interview-ready.",
      gradedByFacultyId: facultyIds[1],
      gradedByIndustryId: industryUserIds[3],
      submittedAt: new Date(now - 3 * day),
    },
  });

  await prisma.dualGrading.create({
    data: {
      challengeId: createdChallenges[0],
      labUnitId: labUnit1.id,
      academicMarks: 89,
      facultyRemarks: "Excellent grounding in RAG techniques.",
      gradedByFacultyId: facultyIds[0],
    },
  });

  // ----- HIRING BENCHMARKS (Phase 4: Institution Skill Deficit Heatmap) -----
  // department / year / skill / required benchmark score (0-100) for upcoming campus hiring
  const benchmarkDefs = [
    // CS 4th Year
    ["Computer Science", 4, "Machine Learning", 85],
    ["Computer Science", 4, "Python", 90],
    ["Computer Science", 4, "React", 75],
    ["Computer Science", 4, "SQL", 80],
    ["Computer Science", 4, "Docker", 78],
    ["Computer Science", 4, "System Design", 82],
    // CS 3rd Year
    ["Computer Science", 3, "Java", 70],
    ["Computer Science", 3, "Spring Boot", 65],
    ["Computer Science", 3, "SQL", 60],
    ["Computer Science", 3, "Docker", 62],
    // ECE 3rd Year
    ["Electronics & Communication", 3, "VLSI", 75],
    ["Electronics & Communication", 3, "Verilog", 70],
    ["Electronics & Communication", 3, "Signal Processing", 72],
    ["Electronics & Communication", 3, "Embedded C", 80],
    // ECE 4th Year
    ["Electronics & Communication", 4, "Embedded C", 85],
    ["Electronics & Communication", 4, "IoT", 78],
    ["Electronics & Communication", 4, "RTOS", 76],
    // ME 3rd Year
    ["Mechanical Engineering", 3, "CAD Modeling", 72],
    ["Mechanical Engineering", 3, "Simulation", 68],
    // ME 4th Year
    ["Mechanical Engineering", 4, "MATLAB", 75],
    ["Mechanical Engineering", 4, "ANSYS", 74],
    // IT 2nd Year
    ["Information Technology", 2, "Python", 70],
    ["Information Technology", 2, "Data Analysis", 65],
    ["Information Technology", 2, "SQL", 66],
    ["Information Technology", 3, "Python", 78],
    ["Information Technology", 3, "Data Analysis", 74],
    ["Information Technology", 3, "SQL", 75],
    ["Electrical Engineering", 3, "MATLAB", 76],
    ["Electrical Engineering", 3, "Circuit Design", 74],
    ["Electrical Engineering", 4, "MATLAB", 80],
    ["Electrical Engineering", 4, "Embedded C", 78],
    ["Electrical Engineering", 4, "Circuit Design", 79],
  ] as const;

  await prisma.hiringBenchmark.createMany({
    data: benchmarkDefs.map(([department, year, skillName, requiredScore]) => ({
      department,
      year,
      skillName,
      requiredScore,
    })),
  });

  // ----- SABBATICAL LISTINGS (Phase 4: Faculty Industrial Sabbatical Exchange) -----
  const sabbaticalDefs = [
    {
      company: 0, title: "GenAI Research Engineering Immersion",
      desc: "8-week summer immersion building production RAG systems alongside our applied research team. Faculty will co-design evaluation frameworks and mentor graduate interns.",
      domain: "Generative AI / Information Retrieval",
      duration: "8 weeks (Jun-Aug)", location: "Bengaluru (Hybrid)",
      compensation: "Stipend + accommodation",
    },
    {
      company: 1, title: "Enterprise Data Platforms Fellowship",
      desc: "Summer residency with our cloud data platform group. Contribute to real client data pipelines and share insights back with campus curriculum.",
      domain: "Data Engineering / Cloud",
      duration: "10 weeks (Jun-Aug)", location: "Pune",
      compensation: "Paid fellowship + travel",
    },
    {
      company: 2, title: "Edge AI Applied Research Program",
      desc: "Hands-on program deploying lightweight computer-vision models on retail edge hardware. Ideal for ECE/CS faculty exploring IoT + ML.",
      domain: "Edge Computing / Computer Vision",
      duration: "6 weeks (Jul-Aug)", location: "Bengaluru",
      compensation: "Honorarium",
    },
    {
      company: 3, title: "Platform Engineering Faculty Residency",
      desc: "Embed with our platform engineering org to ship internal developer tooling. Open to CS/IT faculty with systems interest.",
      domain: "Platform Engineering / DevOps",
      duration: "12 weeks (Summer)", location: "Chennai",
      compensation: "Competitive stipend",
    },
    {
      company: 4, title: "Digital Twin & Sustainability Lab",
      desc: "Collaborate on campus energy digital-twin simulation research for one summer. Deliverables include a published technical report.",
      domain: "IoT / Digital Twin / Sustainability",
      duration: "8 weeks (Jun-Jul)", location: "Noida",
      compensation: "Stipend + research budget",
    },
  ] as const;

  for (const s of sabbaticalDefs) {
    await prisma.sabbaticalListing.create({
      data: {
        companyId: industryUserIds[s.company],
        title: s.title,
        description: s.desc,
        domain: s.domain,
        duration: s.duration,
        location: s.location,
        compensation: s.compensation,
        status: "OPEN",
      },
    });
  }

  // ----- LEARNING PROGRAMS (Internships, Jobs & Industry Learning) -----
  const learningProgramDefs = [
    { ind: 0, title: "Systems Engineer Intern - GenAI Track", type: "INTERNSHIP", skills: "Python,Machine Learning,LLM", desc: "6-month paid internship building enterprise GenAI document-intelligence products. Work closely with applied research.", duration: "6 months", mode: "Hybrid", cert: true },
    { ind: 1, title: "Java Backend Developer - Entry", type: "ENTRY_JOB", skills: "Java,Spring Boot,SQL", desc: "Full-time entry-level role on our wealth-management platform team. Strong mentoring culture.", duration: "Full-time", mode: "On-site", cert: false },
    { ind: 2, title: "Data Analyst Apprentice", type: "APPRENTICESHIP", skills: "SQL,Excel,Data Analysis,Power BI", desc: "1-year apprenticeship rotating across business units learning analytics tooling and reporting.", duration: "12 months", mode: "Hybrid", cert: true },
    { ind: 3, title: "Cloud Foundations Training", type: "TRAINING", skills: "AWS,Docker,Linux", desc: "12-week sponsored training program covering cloud fundamentals with a guaranteed project placement.", duration: "12 weeks", mode: "Online", cert: true },
    { ind: 4, title: "Edge AI Professional Certification", type: "CERTIFICATION", skills: "TensorFlow,Computer Vision,C++", desc: "Industry-validated certification on deploying computer-vision models to edge devices.", duration: "8 weeks", mode: "Online", cert: true },
    { ind: 0, title: "Frontend Engineer Intake 2026", type: "ENTRY_JOB", skills: "React,TypeScript,HTML/CSS", desc: "New-grad frontend role crafting design systems and high-traffic customer experiences.", duration: "Full-time", mode: "Hybrid", cert: false },
    { ind: 5, title: "Ayush Bio-Informatics & Quality Standardization Internship", type: "INTERNSHIP", skills: "Botanical AI Identification,Bioinformatics,Python", desc: "Collaborative research internship analyzing digitized herbal databases, pharmacovigilance reports, and clinical analytics under Ministry of Ayush guidelines.", duration: "6 months", mode: "Hybrid (New Delhi)", cert: true },
  ] as const;

  for (const lp of learningProgramDefs) {
    await prisma.learningProgram.create({
      data: {
        companyId: industryUserIds[lp.ind],
        title: lp.title,
        description: lp.desc,
        programType: lp.type,
        skills: lp.skills,
        duration: lp.duration,
        mode: lp.mode,
        certification: lp.cert,
      },
    });
  }

  // ----- FACULTY PROGRAM LISTINGS (Faculty Development Portal) -----
  const facultyProgramDefs = [
    { ind: 0, title: "GenAI Research Engineering Immersion", type: "RESEARCH", domain: "Generative AI", dur: "8 weeks (Jun-Aug)", loc: "Bengaluru (Hybrid)", comp: "Stipend + accommodation", desc: "Co-design RAG evaluation frameworks and mentor graduate interns on applied GenAI." },
    { ind: 1, title: "Summer Faculty Fellowship on Data Platforms", type: "FDP", domain: "Data Engineering / Cloud", dur: "10 weeks (Jun-Aug)", loc: "Pune", comp: "Paid fellowship", desc: "Embed with the cloud data platform group and bring insights back to curriculum." },
    { ind: 2, title: "Edge AI Applied Research Program", type: "INDUSTRIAL_TRAINING", domain: "Edge Computing / CV", dur: "6 weeks (Jul-Aug)", loc: "Bengaluru", comp: "Honorarium", desc: "Deploy lightweight computer-vision models on retail edge hardware with the research team." },
    { ind: 3, title: "Platform Engineering Faculty Residency", type: "CONSULTANCY", domain: "DevOps", dur: "12 weeks (Summer)", loc: "Chennai", comp: "Competitive stipend", desc: "Ship internal developer tooling alongside the platform engineering organization." },
    { ind: 4, title: "Faculty Internship - Sustainability Lab", type: "FACULTY_INTERNSHIP", domain: "IoT / Sustainability", dur: "8 weeks (Jun-Jul)", loc: "Noida", comp: "Stipend + research budget", desc: "Collaborate on campus energy digital-twin simulation research and co-author a report." },
  ] as const;

  for (const fp of facultyProgramDefs) {
    await prisma.facultyProgramListing.create({
      data: {
        companyId: industryUserIds[fp.ind],
        title: fp.title,
        description: fp.desc,
        programType: fp.type,
        domain: fp.domain,
        duration: fp.dur,
        location: fp.loc,
        compensation: fp.comp,
      },
    });
  }

  // ----- PORTFOLIO ITEMS (Student digital portfolio) -----
  const portfolioDefs = [
    [studentUserIds[0], "CERTIFICATION", "AWS Certified Machine Learning - Specialty", "Amazon Web Services", 2024, "Validates ML solution architecture on AWS."],
    [studentUserIds[0], "INTERNSHIP", "Systems Engineering Internship - Infosys", "Infosys", 2024, "Built RAG pipelines for enterprise document intelligence."],
    [studentUserIds[4], "PROJECT", "Smart Campus Navigation App", "VIT Chennai", 2025, "AR wayfinding mobile app with indoor Bluetooth beacons."],
    [studentUserIds[1], "ACHIEVEMENT", "Smart India Hackathon - National Finalist", "SIH 2024", 2024, "Top 30 team for a Java-based logistics optimization solution."],
    [studentUserIds[7], "CERTIFICATION", "Kubernetes Administrator (CKA)", "CNCF", 2025, "Certified on cluster administration and microservices orchestration."],
    [studentUserIds[5], "PUBLICATION", "Hiring Analytics Dashboard Study", "Campus Analytics Review", 2025, "Co-authored case study on skill-gap visualization for placement cell."],
  ] as const;

  for (const [sid, type, title, issuer, year, desc] of portfolioDefs) {
    await prisma.portfolioItem.create({
      data: {
        studentId: sid as string,
        type: type as string,
        title: title as string,
        issuer: issuer as string,
        year: year as number,
        description: desc as string,
        verified: false,
      },
    });
  }

  // ----- USER DOCUMENTS (Resume uploads) -----
  const docDefs = [
    [studentUserIds[0], "Aarav_Resume_2025.pdf", "Resume"],
    [studentUserIds[4], "Vikram_Resume.pdf", "Resume"],
    [studentUserIds[5], "Ananya_Cert_DataAnalytics.pdf", "Certificate"],
    [studentUserIds[7], "Meera_CKA_Certificate.pdf", "Certificate"],
  ] as const;

  // A minimal valid PDF placeholder so downloads render as documents.
  const pdfPlaceholder = "data:application/pdf;base64,JVBERi0xLjUgCjEgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cgL1BhZ2VzIDIgMCBSID4+CmVuZG9iagoyIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNjEyIDc5Ml0gPj4KZW5kb2JqCnhyZWYKMCA0CnRyYWlsZXIgPDwgL1Jvb3QgMSAwIFIgPj4KJUVPRg==";

  for (const [uid, name, type] of docDefs) {
    await prisma.userDocument.create({
      data: {
        userId: uid as string,
        name: name as string,
        type: type as string,
        dataUrl: pdfPlaceholder,
      },
    });
  }

  console.log("Seeding complete!");
  console.log(`  Users: ${8 + 4 + 5 + 2}`);
  console.log(`  Students: 8, Faculty: 4, Industry: 5, Institutions: 2`);
  console.log(`  Syllabi: ${syllabi.length}`);
  console.log(`  Projects: ${projectDefs.length}`);
  console.log(`  Skills: ${skillAssessments.length}`);
  console.log(`  Mentorslots: ${mentorSlotDefs.length}`);
  console.log(`  JobPitches: ${jobPitchDefs.length}`);
  console.log(`  Challenges: ${challengeDefs.length}`);
  console.log(`  LabUnits: 3`);
  console.log(`  Applications: 3`);
  console.log(`  DualGradings: 2`);
  console.log(`  HiringBenchmarks: ${benchmarkDefs.length}`);
  console.log(`  SabbaticalListings: ${sabbaticalDefs.length}`);
  console.log(`  LearningPrograms: ${learningProgramDefs.length}`);
  console.log(`  FacultyProgramListings: ${facultyProgramDefs.length}`);
  console.log(`  PortfolioItems: ${portfolioDefs.length}`);
  console.log(`  UserDocuments: ${docDefs.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
