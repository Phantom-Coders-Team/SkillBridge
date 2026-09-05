import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function retry<T>(fn: () => Promise<T>, retries = 5, delayMs = 1500): Promise<T> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt <= retries) {
        console.warn(`[Seed Retry] attempt ${attempt}/${retries} after error: ${err?.message || err}`);
        await new Promise((res) => setTimeout(res, delayMs * attempt));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Failed after retries");
}

async function main() {
  console.log("Seeding Academia-Industry Collaboration Portal...");

  const tables = [
    () => prisma.blockchainTransaction.deleteMany(),
    () => prisma.erupiVoucher.deleteMany(),
    () => prisma.jobPitch.deleteMany(),
    () => prisma.dualGrading.deleteMany(),
    () => prisma.challengeApplication.deleteMany(),
    () => prisma.labUnitMember.deleteMany(),
    () => prisma.labUnit.deleteMany(),
    () => prisma.industryChallenge.deleteMany(),
    () => prisma.mentorSlot.deleteMany(),
    () => prisma.tokenTransaction.deleteMany(),
    () => prisma.tokenLedger.deleteMany(),
    () => prisma.skillAssessment.deleteMany(),
    () => prisma.proofOfWork.deleteMany(),
    () => prisma.project.deleteMany(),
    () => prisma.syllabus.deleteMany(),
    () => prisma.profile.deleteMany(),
    () => prisma.user.deleteMany(),
    () => prisma.hiringBenchmark.deleteMany(),
    () => prisma.sabbaticalListing.deleteMany(),
    () => prisma.userDocument.deleteMany(),
    () => prisma.portfolioItem.deleteMany(),
    () => prisma.facultyProgramApplication.deleteMany(),
    () => prisma.facultyProgramListing.deleteMany(),
    () => prisma.internshipApplication.deleteMany(),
    () => prisma.learningProgram.deleteMany(),
  ];

  for (const del of tables) {
    await retry(del);
  }
  console.log("Existing records cleared.");

  console.log("Hashing default credentials...");
  const passwordHash = await bcrypt.hash("Password@123", 10);

  // ----- STUDENTS -----
  const students: Array<[string, string, string, { year: number; rollNumber: string; department: string; skills: string }]> = [
    ["Aarav Sharma", "aarav.sharma@student.edu", "CS21B001", { year: 4, rollNumber: "CS21B001", department: "Computer Science", skills: "React,Node.js,Python,Machine Learning" }],
    ["Priya Patel", "priya.patel@student.edu", "CS22B014", { year: 3, rollNumber: "CS22B014", department: "Computer Science", skills: "Java,Spring,SQL,Docker" }],
    ["Rohan Verma", "rohan.verma@student.edu", "EE21B007", { year: 4, rollNumber: "EE21B007", department: "Electrical Engineering", skills: "MATLAB,Circuit Design,Embedded C" }],
    ["Sneha Iyer", "sneha.iyer@student.edu", "ME22B019", { year: 3, rollNumber: "ME22B019", department: "Mechanical Engineering", skills: "CAD,Simulation,GD&T" }],
    ["Vikram Singh", "vikram.singh@student.edu", "CS21B023", { year: 4, rollNumber: "CS21B023", department: "Computer Science", skills: "Flutter,Firebase,UI/UX" }],
    ["Ananya Rao", "ananya.rao@student.edu", "IT23B005", { year: 2, rollNumber: "IT23B005", department: "Information Technology", skills: "Python,Data Analysis,SQL" }],
    ["Karthik Nair", "karthik.nair@student.edu", "EC22B011", { year: 3, rollNumber: "EC22B011", department: "Electronics & Communication", skills: "VLSI,Verilog,Signal Processing" }],
    ["Meera Krishnan", "meera.krishnan@student.edu", "CS21B031", { year: 4, rollNumber: "CS21B031", department: "Computer Science", skills: "Go,Microservices,Kubernetes" }],
  ];

  console.log("Seeding student accounts...");
  const studentUserIds: string[] = [];
  for (const [name, email, roll, details] of students) {
    const user = await retry(() =>
      prisma.user.create({
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
      })
    );
    studentUserIds.push(user.id);
  }
  console.log(`Created ${studentUserIds.length} student accounts.`);

  // ----- ACADEMICIANS -----
  const faculty: Array<[string, string, string, string]> = [
    ["Dr. Rajesh Kumar", "rajesh.kumar@faculty.edu", "Professor", "Computer Science"],
    ["Dr. Sunita Rao", "sunita.rao@faculty.edu", "Associate Professor", "Electrical Engineering"],
    ["Prof. Amit Deshpande", "amit.deshpande@faculty.edu", "Assistant Professor", "Mechanical Engineering"],
    ["Dr. Kavitha Menon", "kavitha.menon@faculty.edu", "Professor", "Information Technology"],
  ];

  console.log("Seeding faculty accounts...");
  const facultyIds: string[] = [];
  for (const [name, email, designation, dept] of faculty) {
    const user = await retry(() =>
      prisma.user.create({
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
      })
    );
    facultyIds.push(user.id);
  }
  console.log(`Created ${facultyIds.length} faculty accounts.`);

  // ----- INDUSTRIES (19 Corporate & Enterprise Partners) -----
  const industry: Array<{
    company: string;
    email: string;
    designation: string;
    dept: string;
    loc: string;
    skills: string;
    websiteUrl: string;
    bio: string;
  }> = [
    {
      company: "Infosys",
      email: "recruit@infosys.com",
      designation: "Senior Hiring Manager",
      dept: "Talent Acquisition & Innovation Labs",
      loc: "Infosys Limited, Bengaluru",
      skills: "Enterprise IT, Cloud Transformation, GenAI, Full-Stack",
      websiteUrl: "https://www.infosys.com",
      bio: "Global leader in next-generation digital services, enterprise cloud consulting, and student innovation labs.",
    },
    {
      company: "TCS",
      email: "campus@tcs.com",
      designation: "Campus Recruitment Lead",
      dept: "Cognitive Business Operations",
      loc: "Tata Consultancy Services, Pune",
      skills: "BFSI, Cloud Architecture, Automation, Data Analytics",
      websiteUrl: "https://www.tcs.com",
      bio: "Pioneering IT services and business consulting giant driving global industrial digital transformation.",
    },
    {
      company: "Wipro",
      email: "talent@wipro.com",
      designation: "Technical Recruiter",
      dept: "Digital Operations & Cyber Resilience",
      loc: "Wipro Limited, Bengaluru",
      skills: "Cybersecurity, DevOps, Cloud Infrastructure, IoT",
      websiteUrl: "https://www.wipro.com",
      bio: "Leading technology services and consulting company focused on building innovative solutions across cybersecurity and cloud.",
    },
    {
      company: "Zoho",
      email: "campus@zohocorp.com",
      designation: "Engineering Manager",
      dept: "Platform Engineering",
      loc: "Zoho Corporation, Chennai",
      skills: "SaaS Infrastructure, Low-Code, Microservices, Full-Stack",
      websiteUrl: "https://www.zoho.com",
      bio: "Unique bootstrapped SaaS ecosystem powering over 100M users with high-performance web applications.",
    },
    {
      company: "HCLTech",
      email: "careers@hcltech.com",
      designation: "Program Manager",
      dept: "Engineering and R&D Services",
      loc: "HCL Technologies, Noida",
      skills: "Product Engineering, Embedded Systems, IoT, Edge AI",
      websiteUrl: "https://www.hcltech.com",
      bio: "Global technology company supercharging digital enterprise and engineering R&D across semiconductors and smart devices.",
    },
    {
      company: "All India Institute of Ayurveda (AIIA)",
      email: "research@aiia.gov.in",
      designation: "Head of Digital Health & Innovation",
      dept: "Ayush Bio-Informatics",
      loc: "All India Institute of Ayurveda, New Delhi",
      skills: "Ayush Informatics, Botanical Vision AI, Medical Analytics",
      websiteUrl: "https://aiia.gov.in",
      bio: "Apex institute for Ayurveda under the Ministry of Ayush advancing evidence-based botanical computing and clinical research.",
    },
    {
      company: "Google India",
      email: "university-india@google.com",
      designation: "University Relations Lead",
      dept: "Google Cloud & Applied AI",
      loc: "Google India, Bengaluru",
      skills: "Distributed Systems, TensorFlow, Cloud Architecture, Android Core",
      websiteUrl: "https://about.google",
      bio: "Pioneering AI research, hyper-scale cloud platforms, and mobile operating system ecosystems worldwide.",
    },
    {
      company: "Microsoft India",
      email: "india-recruitment@microsoft.com",
      designation: "Campus Talent Director",
      dept: "Azure Systems & Applied Research",
      loc: "Microsoft India R&D, Hyderabad",
      skills: "Azure Cloud, Generative AI, Copilot Ecosystem, Windows Core",
      websiteUrl: "https://www.microsoft.com",
      bio: "Empowering every person and organization to achieve more through world-class enterprise cloud and applied AI.",
    },
    {
      company: "Amazon AWS",
      email: "aws-university@amazon.com",
      designation: "Academic Partnership Lead",
      dept: "AWS Cloud Systems Architecture",
      loc: "Amazon Development Centre, Bengaluru",
      skills: "Distributed Storage, Serverless, Cloud Security, HPC",
      websiteUrl: "https://aws.amazon.com",
      bio: "The world's most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services.",
    },
    {
      company: "NVIDIA India",
      email: "developer-edu@nvidia.com",
      designation: "Director of Education Programs",
      dept: "Deep Learning & Accelerated Computing",
      loc: "NVIDIA Graphics Pvt Ltd, Pune",
      skills: "CUDA, GPU Computing, TensorRT, LLM Acceleration, Robotics",
      websiteUrl: "https://www.nvidia.com",
      bio: "Global leader in GPU accelerated computing, neural network architectures, and industrial metaverse solutions.",
    },
    {
      company: "Intel India",
      email: "labs-fellowship@intel.com",
      designation: "Staff Research Engineer",
      dept: "Intel Labs & Silicon Design",
      loc: "Intel Technology India, Bengaluru",
      skills: "VLSI Design, Edge AI, RISC-V, OpenVINO, Computer Architecture",
      websiteUrl: "https://www.intel.com",
      bio: "Shaping the future of compute with silicon breakthroughs, open edge AI inference, and advanced semiconductor packaging.",
    },
    {
      company: "Cisco Systems",
      email: "networking-academy@cisco.com",
      designation: "Technical Lead & Talent Architect",
      dept: "Enterprise Networking & Security",
      loc: "Cisco Systems India, Bengaluru",
      skills: "Software Defined Networking, Zero-Trust, SD-WAN, Cloud Security",
      websiteUrl: "https://www.cisco.com",
      bio: "Powering an inclusive future for all by connecting people, security infrastructure, and mission-critical cloud networks.",
    },
    {
      company: "IBM India Research",
      email: "research-collaborations@ibm.com",
      designation: "Principal Research Scientist",
      dept: "Hybrid Cloud & Quantum Systems",
      loc: "IBM India Research Laboratory, Bengaluru",
      skills: "Quantum Computing, Red Hat OpenShift, Enterprise AI, Watsonx",
      websiteUrl: "https://www.ibm.com",
      bio: "Leading hybrid cloud and enterprise AI provider accelerating fundamental research in quantum and trustworthy AI.",
    },
    {
      company: "Qualcomm India",
      email: "campus-relations@qualcomm.com",
      designation: "Senior Director of Engineering",
      dept: "Wireless Systems & Modem Tech",
      loc: "Qualcomm India, Hyderabad",
      skills: "5G/6G Modems, RF Systems, Snapdragon Edge AI, Low-Power Embedded",
      websiteUrl: "https://www.qualcomm.com",
      bio: "World-leading wireless technology innovator and the driving force behind the development, launch, and expansion of 5G.",
    },
    {
      company: "Adobe Systems",
      email: "adobe-labs@adobe.com",
      designation: "Engineering Director",
      dept: "Digital Media & Experience Platform",
      loc: "Adobe Systems India, Noida",
      skills: "Creative Cloud, Computer Vision, Digital Experience, GenAI Firefly",
      websiteUrl: "https://www.adobe.com",
      bio: "Changing the world through digital experiences, creative expression algorithms, and enterprise content intelligence.",
    },
    {
      company: "L&T Technology Services",
      email: "careers@ltts.com",
      designation: "Head of Industry-Academia Co-Innovation",
      dept: "Smart Manufacturing & Mobility",
      loc: "LTTS Innovation Centre, Vadodara",
      skills: "Industry 4.0, Digital Twins, Industrial Automation, Smart Cities",
      websiteUrl: "https://www.ltts.com",
      bio: "Global engineering R&D services company delivering sustainable, disruptive engineering and manufacturing solutions.",
    },
    {
      company: "Samsung R&D Institute",
      email: "sri.collaborate@samsung.com",
      designation: "Lead Research Architect",
      dept: "Advanced Technology & Mobile Solutions",
      loc: "Samsung R&D Institute India, Bengaluru",
      skills: "Vision AI, Mobile OS, Knox Security, On-Device Intelligence",
      websiteUrl: "https://research.samsung.com",
      bio: "Premier research centre driving camera algorithms, multi-modal generative AI, and next-gen mobile communications.",
    },
    {
      company: "Tata Motors",
      email: "ev-innovation@tatamotors.com",
      designation: "Principal Systems Architect",
      dept: "Electric Mobility & Connected Vehicles",
      loc: "Tata Motors Engineering Research Centre, Pune",
      skills: "EV Battery Management, CAN Bus, Autonomous Telematics, Embedded Control",
      websiteUrl: "https://www.tatamotors.com",
      bio: "India's largest automotive manufacturer pioneering electric vehicle powertrain innovation and autonomous telematics.",
    },
    {
      company: "Reliance Jio Platforms",
      email: "jio-innovations@ril.com",
      designation: "VP of Technology Programs",
      dept: "5G Telecom & Cloud Platforms",
      loc: "Reliance Corporate Park, Navi Mumbai",
      skills: "5G Standalone Core, Cloud Native Telecom, Edge CDN, Indigenous AI",
      websiteUrl: "https://www.jio.com",
      bio: "Transforming India's digital ecosystem with indigenously engineered 5G networks, cloud services, and AI platforms.",
    },
  ];

  console.log(`Seeding ${industry.length} industry partner accounts...`);
  const industryUserIds: string[] = [];
  for (const item of industry) {
    const user = await retry(() =>
      prisma.user.create({
        data: {
          name: item.company,
          email: item.email,
          passwordHash,
          role: "INDUSTRY",
          profile: {
            create: {
              companyName: item.company,
              designation: item.designation,
              department: item.dept,
              bio: item.bio,
              location: item.loc,
              skills: item.skills,
              websiteUrl: item.websiteUrl,
            },
          },
        },
      })
    );
    industryUserIds.push(user.id);
  }
  console.log(`Created ${industryUserIds.length} industry partner accounts.`);

  // ----- INSTITUTIONS -----
  const institutions: Array<[string, string, string]> = [
    ["Dr. Lakshmi Narayanan", "tpo@university.edu", "Training & Placement Officer"],
    ["Mr. Suresh Babu", "tpo.assist@university.edu", "Assistant TPO"],
  ];

  console.log("Seeding institution accounts...");
  for (const [name, email, designation] of institutions) {
    await retry(() =>
      prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "INSTITUTION",
          profile: {
            create: {
              designation,
              department: "Training & Placement Cell",
              bio: `${designation} overseeing industry partnerships, placements, and internship facilitation.`,
              location: "University Campus",
            },
          },
        },
      })
    );
  }
  console.log(`Created ${institutions.length} institution accounts.`);

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
    [industryUserIds[1], studentUserIds[4], 5, "Resume review & portfolio guidance"],
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
    {
      ind: 6, title: "Distributed RAG on Google Cloud", type: "R_AND_D",
      desc: "Implement a low-latency enterprise document retrieval and knowledge generation pipeline using Google Vertex AI and vector search.",
      domain: "AI / Cloud Systems", tech: "Python, Google Cloud, Vertex AI, BigQuery", objs: "Vector embeddings, multi-hop RAG, prompt grounding",
      stipend: 25000, rnd: true, status: "OPEN", deadlineOffset: 28,
    },
    {
      ind: 7, title: "Copilot Semantic Plugin for Clinical Records", type: "CAPSTONE",
      desc: "Develop an intelligent semantic assistant plugin that synthesizes patient lab records and alerts practitioners to contraindicated prescriptions.",
      domain: "Healthcare / Generative AI", tech: "Azure OpenAI, TypeScript, C#, FHIR", objs: "Semantic kernel orchestration, privacy-preserving LLM inference",
      stipend: 22000, rnd: false, status: "OPEN", deadlineOffset: 22,
    },
    {
      ind: 8, title: "High-Throughput Serverless Telemetry Pipeline", type: "CAPSTONE",
      desc: "Design and benchmark a serverless streaming telemetry pipeline handling 100k events/sec with sub-second ingestion latency.",
      domain: "Cloud Infrastructure", tech: "AWS Lambda, Kinesis, DynamoDB, CDK", objs: "Streaming ingestion, auto-partitioning, disaster recovery",
      stipend: 20000, rnd: false, status: "OPEN", deadlineOffset: 33,
    },
    {
      ind: 9, title: "Real-Time Object Tracking with TensorRT & DeepStream", type: "R_AND_D",
      desc: "Accelerate multi-camera vision pipeline with sub-10ms latency using NVIDIA TensorRT and CUDA optimizations for autonomous factory robots.",
      domain: "Edge AI / Accelerated Computing", tech: "CUDA, TensorRT, C++, OpenCV, DeepStream", objs: "Kernel optimization, FP16 quantization, video streaming",
      stipend: 30000, rnd: true, status: "OPEN", deadlineOffset: 45,
    },
    {
      ind: 10, title: "Low-Power Computer Vision with Intel OpenVINO", type: "R_AND_D",
      desc: "Optimize deep neural network inference on Intel hybrid CPU/NPU architectures for automated optical inspection in semiconductor manufacturing.",
      domain: "Semiconductor / AI Inference", tech: "Intel OpenVINO, C++, Python, ONNX", objs: "Model compression, INT8 calibration, NPU acceleration",
      stipend: 22000, rnd: true, status: "OPEN", deadlineOffset: 26,
    },
    {
      ind: 11, title: "Zero-Trust Microsegmentation Controller", type: "CAPSTONE",
      desc: "Architect a network access controller utilizing eBPF packet inspection and zero-trust identity policies for hybrid cloud environments.",
      domain: "Cybersecurity / Networking", tech: "Python, Docker, eBPF, Linux, Go", objs: "Policy enforcement, real-time packet inspection, threat telemetry",
      stipend: 18000, rnd: false, status: "OPEN", deadlineOffset: 20,
    },
    {
      ind: 17, title: "Battery Thermal Runaway Prediction in EV Fleets", type: "R_AND_D",
      desc: "Formulate an electrochemical thermal estimation model predicting battery cell degradation and abnormal heat dissipation in commercial EV fleets.",
      domain: "Automotive / Clean Energy", tech: "MATLAB, Python, CAN Bus, IoT Telematics", objs: "Cell temperature forecasting, early fault warning, CAN bus parsing",
      stipend: 24000, rnd: true, status: "OPEN", deadlineOffset: 38,
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

  const labUnit4 = await prisma.labUnit.create({
    data: {
      name: "GreenTech Carbon Squad",
      facultyId: facultyIds[0],
      challengeId: createdChallenges[1],
      status: "ACTIVE",
      members: {
        create: [
          { studentId: studentUserIds[3] },
          { studentId: studentUserIds[4] },
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
  await prisma.challengeApplication.create({
    data: {
      challengeId: createdChallenges[1],
      labUnitId: labUnit4.id,
      proposal: "Corporate Scope 1-3 carbon emissions calculator with automated ESG disclosure generator.",
      status: "SELECTED",
    },
  });

  // ----- DUAL GRADINGS (Faculty academic marks + Industry job readiness) -----
  // 1. Completed Dual Grading (Both Academic + Industry)
  await prisma.dualGrading.create({
    data: {
      challengeId: createdChallenges[3],
      labUnitId: labUnit3.id,
      academicMarks: 88,
      jobReadinessScore: 84,
      facultyRemarks: "Strong algorithmic depth; excellent edge quantization benchmarks.",
      industryRemarks: "Production latency <45ms achieved on test harness. Ready for interview fast-track.",
      gradedByFacultyId: facultyIds[1],
      gradedByIndustryId: industryUserIds[3],
      submittedAt: new Date(now - 3 * day),
    },
  });

  // 2. Awaiting Industry Job Readiness (Faculty graded, awaiting Infosys)
  await prisma.dualGrading.create({
    data: {
      challengeId: createdChallenges[0],
      labUnitId: labUnit1.id,
      academicMarks: 91,
      facultyRemarks: "Outstanding vector retrieval grounding and thorough architectural documentation.",
      gradedByFacultyId: facultyIds[0],
      submittedAt: new Date(now - 1 * day),
    },
  });

  // 3. Awaiting Faculty Academic Evaluation (Industry graded, awaiting Faculty)
  await prisma.dualGrading.create({
    data: {
      challengeId: createdChallenges[2],
      labUnitId: labUnit2.id,
      jobReadinessScore: 87,
      industryRemarks: "Feature engineering matches enterprise CRM standards; good test coverage on prediction pipeline.",
      gradedByIndustryId: industryUserIds[2],
      submittedAt: new Date(now - 2 * day),
    },
  });

  // 4. Pending Both Evaluators (Recently initiated challenge-lab unit pairing)
  await prisma.dualGrading.create({
    data: {
      challengeId: createdChallenges[1],
      labUnitId: labUnit4.id,
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
    { ind: 6, title: "Cloud Systems & Vertex AI Engineering Fellowship", type: "INTERNSHIP", skills: "Google Cloud,Python,Vertex AI,BigQuery", desc: "6-month immersive engineering fellowship with Google Cloud applied research teams.", duration: "6 months", mode: "Hybrid (Bengaluru)", cert: true },
    { ind: 7, title: "Applied AI Solutions Engineer - Entry Level", type: "ENTRY_JOB", skills: "Azure,C#,TypeScript,GenAI", desc: "Full-time entry-level solutions engineer role developing enterprise Copilot systems.", duration: "Full-time", mode: "Hybrid (Hyderabad)", cert: false },
    { ind: 9, title: "CUDA Accelerated Computing Academy", type: "CERTIFICATION", skills: "CUDA,C++,GPU Optimization,TensorRT", desc: "Intensive 8-week certification track on parallel computing and high-performance neural acceleration.", duration: "8 weeks", mode: "Online", cert: true },
    { ind: 10, title: "Silicon Architecture & Edge AI Internship", type: "INTERNSHIP", skills: "OpenVINO,VLSI,Embedded Systems,C++", desc: "Benchmarking and optimizing silicon firmware pipelines on hybrid Intel CPU/NPU architectures.", duration: "6 months", mode: "On-site (Bengaluru)", cert: true },
    { ind: 17, title: "EV Powertrain & Telematics Graduate Engineer Trainee", type: "ENTRY_JOB", skills: "CAN Bus,Embedded C,MATLAB,Battery Tech", desc: "Graduate trainee program at Tata Motors ERC engineering next-gen electric mobility solutions.", duration: "Full-time", mode: "On-site (Pune)", cert: false },
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
  console.log(`  Users: ${8 + 4 + industry.length + 2}`);
  console.log(`  Students: 8, Faculty: 4, Industry: ${industry.length}, Institutions: 2`);
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
