export interface PlacedStudentData {
  id: string;
  studentName: string;
  rollNumber: string;
  department: string;
  companyName: string;
  role: string;
  packageLpa: number;
  academicYear: string;
  tier: "Super Dream" | "Dream" | "Mass / IT Services" | "Core / R&D";
  cgpa: number;
  placementDate: string;
  offerType: "Full-Time (Direct)" | "PPO (Pre-Placement Offer)" | "Intern + FTE";
  status: "Verified" | "Offer Accepted";
  initials?: string;
  location?: string;
}

export interface CompanyPlacementRecord {
  companyName: string;
  initials: string;
  category: "Super Dream" | "Dream" | "Mass / IT Services" | "Core / R&D";
  placedCount: number;
  roles: string[];
  ctcRange: string;
  avgCtcLpa: number;
  location: string;
  isCorporatePartner?: boolean;
  students?: PlacedStudentData[];
}

export interface YearlyPlacementData {
  year: string;
  academicYear: string;
  eligibleStudents: number;
  placedStudents: number;
  placementRate: number; // in %
  avgCtcLpa: number;
  highestCtcLpa: number;
  companiesVisited: number;
  companies: CompanyPlacementRecord[];
}

export const ACCREDITED_CORPORATE_PARTNERS = [
  "Google India",
  "Microsoft India",
  "Amazon AWS",
  "NVIDIA India",
  "Intel India",
  "Cisco Systems",
  "IBM India Research",
  "Qualcomm India",
  "Adobe Systems",
  "Infosys",
  "TCS",
  "Wipro",
  "Zoho",
  "HCLTech",
  "L&T Technology Services",
  "Samsung R&D Institute",
  "Tata Motors",
  "Reliance Jio Platforms",
  "All India Institute of Ayurveda (AIIA)",
] as const;

export function matchCorporatePartner(companyName: string): string | null {
  if (!companyName) return null;
  const norm = companyName.toLowerCase().trim();
  for (const partner of ACCREDITED_CORPORATE_PARTNERS) {
    const pNorm = partner.toLowerCase();
    if (norm === pNorm) return partner;
    if (norm.startsWith(pNorm) || pNorm.startsWith(norm)) return partner;
    if (pNorm === "tcs" && (norm === "tcs" || norm.startsWith("tcs "))) return partner;
    if (pNorm === "infosys" && (norm === "infosys" || norm.startsWith("infosys "))) return partner;
    if (pNorm === "zoho" && (norm === "zoho" || norm.startsWith("zoho "))) return partner;
    if (pNorm === "hcltech" && (norm.includes("hcl") || norm.includes("hcltech"))) return partner;
    if (pNorm.includes("l&t") && norm.includes("l&t")) return partner;
  }
  return null;
}

const SAMPLE_STUDENT_NAMES = [
  "Aarav Sharma",
  "Priya Patel",
  "Vikram Singh",
  "Meera Krishnan",
  "Ananya Reddy",
  "Rohan Verma",
  "Sneha Nair",
  "Aditya Joshi",
  "Ishaan Malhotra",
  "Tanvi Choudhury",
  "Rhea Sundaram",
  "Kavya Iyer",
  "Siddharth Rao",
  "Arjun Gupta",
  "Divya Menon",
  "Kabir Sen",
  "Nandini Ghosh",
  "Varun Bhat",
  "Karthik Rajan",
  "Pooja Hegde",
  "Dhruv Kapoor",
  "Tara Pillai",
  "Manish Saxena",
  "Shreya Deshmukh",
  "Nikhil Prasad",
  "Anika Mehra",
  "Suresh Kumar",
  "Deepika Nambiar",
  "Rahul Bose",
  "Neha Agarwal",
];

const DEPARTMENTS = [
  { name: "Computer Science & Engineering", code: "CS" },
  { name: "Information Technology", code: "IT" },
  { name: "Electronics & Communication", code: "EC" },
  { name: "Artificial Intelligence & Data Science", code: "AI" },
  { name: "Electrical Engineering", code: "EE" },
  { name: "Mechanical Engineering", code: "ME" },
];

export function getStudentsForCompany(
  company: CompanyPlacementRecord,
  academicYear: string
): PlacedStudentData[] {
  if (company.students && company.students.length > 0) {
    return company.students;
  }

  const batchYearNum = parseInt(academicYear.slice(0, 4)) || 2025;
  const rollPrefix = (batchYearNum - 3).toString().slice(-2);
  const count = Math.min(company.placedCount, 25);

  return Array.from({ length: count }, (_, idx) => {
    const rawName = SAMPLE_STUDENT_NAMES[idx % SAMPLE_STUDENT_NAMES.length];
    const cycle = Math.floor(idx / SAMPLE_STUDENT_NAMES.length);
    const studentName = cycle > 0 ? `${rawName} (${cycle + 1})` : rawName;
    const initials =
      studentName
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "ST";

    const dept = DEPARTMENTS[idx % DEPARTMENTS.length];
    const rollNumber = `${rollPrefix}${dept.code}${String(101 + idx).padStart(3, "0")}`;
    const role = company.roles[idx % Math.max(1, company.roles.length)] || "Software Engineer";
    const cgpa = Number((8.2 + ((idx * 3.7) % 1.7)).toFixed(2));
    const offerType: PlacedStudentData["offerType"] =
      company.category === "Super Dream"
        ? idx % 2 === 0
          ? "PPO (Pre-Placement Offer)"
          : "Full-Time (Direct)"
        : idx % 3 === 0
        ? "Intern + FTE"
        : "Full-Time (Direct)";

    return {
      id: `pl-${company.companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${academicYear}-${idx + 1}`,
      studentName,
      rollNumber,
      department: dept.name,
      companyName: company.companyName,
      role,
      packageLpa: company.avgCtcLpa,
      academicYear,
      tier: company.category,
      cgpa,
      placementDate: `Batch ${academicYear}`,
      offerType,
      status: "Verified",
      initials,
      location: company.location,
    };
  });
}

export function getAllPlacedStudents(yearlyData: YearlyPlacementData[]): PlacedStudentData[] {
  const all: PlacedStudentData[] = [];
  yearlyData.forEach((yd) => {
    yd.companies.forEach((comp) => {
      all.push(...getStudentsForCompany(comp, yd.year));
    });
  });
  return all;
}

export const YEARLY_PLACEMENT_DATA: YearlyPlacementData[] = [
  {
    year: "2025-26",
    academicYear: "2025 - 2026 (Current)",
    eligibleStudents: 540,
    placedStudents: 508,
    placementRate: 94.1,
    avgCtcLpa: 16.4,
    highestCtcLpa: 54.0,
    companiesVisited: 48,
    companies: [
      {
        companyName: "Google India",
        initials: "GO",
        category: "Super Dream",
        placedCount: 22,
        roles: ["SDE-1", "Google Cloud & Applied AI Engineer", "Android Core"],
        ctcRange: "₹38 - ₹54 LPA",
        avgCtcLpa: 44.5,
        location: "Bengaluru, Karnataka",
        isCorporatePartner: true,
      },
      {
        companyName: "Microsoft India",
        initials: "MS",
        category: "Super Dream",
        placedCount: 30,
        roles: ["Azure Systems Engineer", "Copilot AI Engineer", "SDE"],
        ctcRange: "₹34 - ₹51 LPA",
        avgCtcLpa: 42.0,
        location: "Hyderabad, Telangana",
        isCorporatePartner: true,
      },
      {
        companyName: "NVIDIA India",
        initials: "NV",
        category: "Super Dream",
        placedCount: 16,
        roles: ["CUDA Systems Engineer", "TensorRT Acceleration Specialist", "LLM Inference"],
        ctcRange: "₹36 - ₹52 LPA",
        avgCtcLpa: 43.0,
        location: "Pune, Maharashtra",
        isCorporatePartner: true,
      },
      {
        companyName: "Amazon AWS",
        initials: "AW",
        category: "Super Dream",
        placedCount: 34,
        roles: ["SDE-1", "Cloud Systems Architect", "Distributed Storage Engineer"],
        ctcRange: "₹28 - ₹45 LPA",
        avgCtcLpa: 36.5,
        location: "Bengaluru, Karnataka",
        isCorporatePartner: true,
      },
      {
        companyName: "Adobe Systems",
        initials: "AD",
        category: "Super Dream",
        placedCount: 14,
        roles: ["Computer Vision Research Engineer", "Creative Cloud Architect"],
        ctcRange: "₹28 - ₹44 LPA",
        avgCtcLpa: 35.0,
        location: "Noida, UP",
        isCorporatePartner: true,
      },
      {
        companyName: "Qualcomm India",
        initials: "QC",
        category: "Super Dream",
        placedCount: 20,
        roles: ["5G/6G Modem Firmware Engineer", "Snapdragon Edge AI Systems"],
        ctcRange: "₹26 - ₹38 LPA",
        avgCtcLpa: 31.0,
        location: "Hyderabad, Telangana",
        isCorporatePartner: true,
      },
      {
        companyName: "Cisco Systems",
        initials: "CS",
        category: "Super Dream",
        placedCount: 24,
        roles: ["Zero-Trust Security Architect", "Cloud Networking Engineer"],
        ctcRange: "₹22 - ₹32 LPA",
        avgCtcLpa: 27.5,
        location: "Bengaluru, Karnataka",
        isCorporatePartner: true,
      },
      {
        companyName: "Intel India",
        initials: "IN",
        category: "Super Dream",
        placedCount: 18,
        roles: ["VLSI Silicon Design Engineer", "OpenVINO Edge Inference"],
        ctcRange: "₹24 - ₹36 LPA",
        avgCtcLpa: 29.0,
        location: "Bengaluru, Karnataka",
        isCorporatePartner: true,
      },
      {
        companyName: "IBM India Research",
        initials: "IB",
        category: "Super Dream",
        placedCount: 16,
        roles: ["Quantum Computing Systems", "Enterprise AI & Hybrid Cloud"],
        ctcRange: "₹26 - ₹40 LPA",
        avgCtcLpa: 32.0,
        location: "Bengaluru, Karnataka",
        isCorporatePartner: true,
      },
      {
        companyName: "Samsung R&D Institute",
        initials: "SR",
        category: "Dream",
        placedCount: 26,
        roles: ["Android Native Frameworks", "On-Device Neural Processing"],
        ctcRange: "₹20 - ₹30 LPA",
        avgCtcLpa: 24.5,
        location: "Bengaluru, Karnataka",
        isCorporatePartner: true,
      },
      {
        companyName: "Zoho",
        initials: "ZH",
        category: "Dream",
        placedCount: 42,
        roles: ["Full-Stack SaaS Platform Engineer", "Low-Code Microservices"],
        ctcRange: "₹12 - ₹18 LPA",
        avgCtcLpa: 15.2,
        location: "Chennai, Tamil Nadu",
        isCorporatePartner: true,
      },
      {
        companyName: "Tata Motors",
        initials: "TM",
        category: "Core / R&D",
        placedCount: 20,
        roles: ["EV Powertrain Software Engineer", "CAN Bus Telematics Architect"],
        ctcRange: "₹10 - ₹17 LPA",
        avgCtcLpa: 13.5,
        location: "Pune, Maharashtra",
        isCorporatePartner: true,
      },
      {
        companyName: "Reliance Jio Platforms",
        initials: "RJ",
        category: "Dream",
        placedCount: 26,
        roles: ["Distributed Cloud Platform Engineer", "5G Edge Services"],
        ctcRange: "₹11 - ₹18 LPA",
        avgCtcLpa: 14.0,
        location: "Navi Mumbai, Maharashtra",
        isCorporatePartner: true,
      },
      {
        companyName: "L&T Technology Services",
        initials: "LT",
        category: "Core / R&D",
        placedCount: 20,
        roles: ["Industrial IoT Specialist", "Embedded Edge Intelligence"],
        ctcRange: "₹9 - ₹16 LPA",
        avgCtcLpa: 12.0,
        location: "Vadodara, Gujarat",
        isCorporatePartner: true,
      },
      {
        companyName: "TCS",
        initials: "TC",
        category: "Mass / IT Services",
        placedCount: 58,
        roles: ["Cognitive Cloud Developer", "BFSI FinTech Systems"],
        ctcRange: "₹9 - ₹15 LPA",
        avgCtcLpa: 11.2,
        location: "Pune, Maharashtra",
        isCorporatePartner: true,
      },
      {
        companyName: "Infosys",
        initials: "IF",
        category: "Mass / IT Services",
        placedCount: 48,
        roles: ["Power Programmer", "Cloud Transformation Architect"],
        ctcRange: "₹9.5 - ₹16 LPA",
        avgCtcLpa: 12.0,
        location: "Bengaluru, Karnataka",
        isCorporatePartner: true,
      },
      {
        companyName: "Wipro",
        initials: "WP",
        category: "Mass / IT Services",
        placedCount: 48,
        roles: ["Turbo Cloud Engineer", "Cyber Resilience Specialist"],
        ctcRange: "₹8 - ₹14 LPA",
        avgCtcLpa: 10.5,
        location: "Bengaluru, Karnataka",
        isCorporatePartner: true,
      },
      {
        companyName: "HCLTech",
        initials: "HC",
        category: "Mass / IT Services",
        placedCount: 36,
        roles: ["Digital Foundation Engineer", "Cloud Infrastructure SRE"],
        ctcRange: "₹8 - ₹13.5 LPA",
        avgCtcLpa: 10.0,
        location: "Noida, UP",
        isCorporatePartner: true,
      },
    ],
  },
  {
    year: "2024-25",
    academicYear: "2024 - 2025",
    eligibleStudents: 490,
    placedStudents: 442,
    placementRate: 90.2,
    avgCtcLpa: 14.8,
    highestCtcLpa: 48.5,
    companiesVisited: 42,
    companies: [
      {
        companyName: "Google India",
        initials: "GO",
        category: "Super Dream",
        placedCount: 18,
        roles: ["SDE-1", "Google Cloud Associate"],
        ctcRange: "₹36 - ₹48.5 LPA",
        avgCtcLpa: 41.5,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "Microsoft India",
        initials: "MS",
        category: "Super Dream",
        placedCount: 26,
        roles: ["Azure Systems Engineer", "SDE"],
        ctcRange: "₹32 - ₹47 LPA",
        avgCtcLpa: 39.0,
        location: "Hyderabad, Telangana",
      },
      {
        companyName: "Amazon AWS",
        initials: "AW",
        category: "Super Dream",
        placedCount: 34,
        roles: ["Cloud Support Associate", "SDE"],
        ctcRange: "₹26 - ₹42 LPA",
        avgCtcLpa: 34.0,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "NVIDIA India",
        initials: "NV",
        category: "Super Dream",
        placedCount: 14,
        roles: ["Accelerated Computing Engineer"],
        ctcRange: "₹32 - ₹46 LPA",
        avgCtcLpa: 38.5,
        location: "Pune, Maharashtra",
      },
      {
        companyName: "Cisco Systems",
        initials: "CS",
        category: "Super Dream",
        placedCount: 22,
        roles: ["Network Software Engineer"],
        ctcRange: "₹20 - ₹30 LPA",
        avgCtcLpa: 25.0,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "Qualcomm India",
        initials: "QC",
        category: "Super Dream",
        placedCount: 18,
        roles: ["Modem Embedded Systems"],
        ctcRange: "₹24 - ₹35 LPA",
        avgCtcLpa: 28.5,
        location: "Hyderabad, Telangana",
      },
      {
        companyName: "Intel India",
        initials: "IN",
        category: "Super Dream",
        placedCount: 16,
        roles: ["Silicon Design Intern/Engineer"],
        ctcRange: "₹22 - ₹32 LPA",
        avgCtcLpa: 26.5,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "Zoho Corporation",
        initials: "ZH",
        category: "Dream",
        placedCount: 46,
        roles: ["Platform Engineer", "Full-Stack Developer"],
        ctcRange: "₹10 - ₹16 LPA",
        avgCtcLpa: 13.8,
        location: "Chennai, Tamil Nadu",
      },
      {
        companyName: "Infosys",
        initials: "IF",
        category: "Mass / IT Services",
        placedCount: 82,
        roles: ["Digital Specialist Engineer", "Systems Engineer"],
        ctcRange: "₹7 - ₹14 LPA",
        avgCtcLpa: 9.8,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "TCS",
        initials: "TC",
        category: "Mass / IT Services",
        placedCount: 90,
        roles: ["Digital Software Engineer", "Ninja Developer"],
        ctcRange: "₹7 - ₹12 LPA",
        avgCtcLpa: 9.2,
        location: "Pune, Maharashtra",
      },
      {
        companyName: "Wipro",
        initials: "WP",
        category: "Mass / IT Services",
        placedCount: 76,
        roles: ["Turbo Cloud Engineer", "Elite Developer"],
        ctcRange: "₹6.5 - ₹11 LPA",
        avgCtcLpa: 8.5,
        location: "Bengaluru, Karnataka",
      },
    ],
  },
  {
    year: "2023-24",
    academicYear: "2023 - 2024",
    eligibleStudents: 440,
    placedStudents: 385,
    placementRate: 87.5,
    avgCtcLpa: 13.2,
    highestCtcLpa: 44.0,
    companiesVisited: 38,
    companies: [
      {
        companyName: "Google India",
        initials: "GO",
        category: "Super Dream",
        placedCount: 14,
        roles: ["SDE-1", "Cloud Associate"],
        ctcRange: "₹34 - ₹44 LPA",
        avgCtcLpa: 38.0,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "Microsoft India",
        initials: "MS",
        category: "Super Dream",
        placedCount: 22,
        roles: ["Azure Systems SDE"],
        ctcRange: "₹30 - ₹43 LPA",
        avgCtcLpa: 36.5,
        location: "Hyderabad, Telangana",
      },
      {
        companyName: "Amazon AWS",
        initials: "AW",
        category: "Super Dream",
        placedCount: 28,
        roles: ["Cloud Support Associate", "SDE"],
        ctcRange: "₹24 - ₹38 LPA",
        avgCtcLpa: 31.0,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "NVIDIA India",
        initials: "NV",
        category: "Super Dream",
        placedCount: 10,
        roles: ["GPU Software Engineer"],
        ctcRange: "₹28 - ₹42 LPA",
        avgCtcLpa: 35.0,
        location: "Pune, Maharashtra",
      },
      {
        companyName: "Cisco Systems",
        initials: "CS",
        category: "Super Dream",
        placedCount: 18,
        roles: ["Network Engineer"],
        ctcRange: "₹18 - ₹28 LPA",
        avgCtcLpa: 23.0,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "Zoho Corporation",
        initials: "ZH",
        category: "Dream",
        placedCount: 40,
        roles: ["Web Platform Engineer"],
        ctcRange: "₹9 - ₹15 LPA",
        avgCtcLpa: 12.5,
        location: "Chennai, Tamil Nadu",
      },
      {
        companyName: "Infosys",
        initials: "IF",
        category: "Mass / IT Services",
        placedCount: 78,
        roles: ["Digital Specialist Engineer"],
        ctcRange: "₹6.5 - ₹12 LPA",
        avgCtcLpa: 8.8,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "TCS",
        initials: "TC",
        category: "Mass / IT Services",
        placedCount: 86,
        roles: ["Digital Associate"],
        ctcRange: "₹6.5 - ₹11 LPA",
        avgCtcLpa: 8.4,
        location: "Pune, Maharashtra",
      },
      {
        companyName: "Wipro",
        initials: "WP",
        category: "Mass / IT Services",
        placedCount: 89,
        roles: ["Project Engineer"],
        ctcRange: "₹6 - ₹10 LPA",
        avgCtcLpa: 7.8,
        location: "Bengaluru, Karnataka",
      },
    ],
  },
  {
    year: "2022-23",
    academicYear: "2022 - 2023",
    eligibleStudents: 390,
    placedStudents: 322,
    placementRate: 82.6,
    avgCtcLpa: 11.6,
    highestCtcLpa: 38.0,
    companiesVisited: 34,
    companies: [
      {
        companyName: "Google India",
        initials: "GO",
        category: "Super Dream",
        placedCount: 10,
        roles: ["SDE-1"],
        ctcRange: "₹30 - ₹38 LPA",
        avgCtcLpa: 34.0,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "Microsoft India",
        initials: "MS",
        category: "Super Dream",
        placedCount: 16,
        roles: ["Software Engineer"],
        ctcRange: "₹28 - ₹37 LPA",
        avgCtcLpa: 32.5,
        location: "Hyderabad, Telangana",
      },
      {
        companyName: "Amazon AWS",
        initials: "AW",
        category: "Super Dream",
        placedCount: 22,
        roles: ["SDE"],
        ctcRange: "₹22 - ₹34 LPA",
        avgCtcLpa: 28.0,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "Cisco Systems",
        initials: "CS",
        category: "Super Dream",
        placedCount: 14,
        roles: ["Network Associate"],
        ctcRange: "₹16 - ₹24 LPA",
        avgCtcLpa: 20.0,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "Zoho Corporation",
        initials: "ZH",
        category: "Dream",
        placedCount: 36,
        roles: ["Product Developer"],
        ctcRange: "₹8 - ₹13 LPA",
        avgCtcLpa: 10.8,
        location: "Chennai, Tamil Nadu",
      },
      {
        companyName: "Infosys",
        initials: "IF",
        category: "Mass / IT Services",
        placedCount: 74,
        roles: ["Systems Engineer"],
        ctcRange: "₹6 - ₹10 LPA",
        avgCtcLpa: 7.5,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "TCS",
        initials: "TC",
        category: "Mass / IT Services",
        placedCount: 82,
        roles: ["Assistant System Engineer"],
        ctcRange: "₹6 - ₹9.5 LPA",
        avgCtcLpa: 7.2,
        location: "Pune, Maharashtra",
      },
      {
        companyName: "Wipro",
        initials: "WP",
        category: "Mass / IT Services",
        placedCount: 68,
        roles: ["Project Engineer"],
        ctcRange: "₹5.5 - ₹8.5 LPA",
        avgCtcLpa: 6.8,
        location: "Bengaluru, Karnataka",
      },
    ],
  },
  {
    year: "2021-22",
    academicYear: "2021 - 2022",
    eligibleStudents: 340,
    placedStudents: 264,
    placementRate: 77.6,
    avgCtcLpa: 9.8,
    highestCtcLpa: 32.0,
    companiesVisited: 28,
    companies: [
      {
        companyName: "Microsoft India",
        initials: "MS",
        category: "Super Dream",
        placedCount: 12,
        roles: ["Software Engineer"],
        ctcRange: "₹24 - ₹32 LPA",
        avgCtcLpa: 28.0,
        location: "Hyderabad, Telangana",
      },
      {
        companyName: "Amazon AWS",
        initials: "AW",
        category: "Super Dream",
        placedCount: 16,
        roles: ["SDE"],
        ctcRange: "₹20 - ₹29 LPA",
        avgCtcLpa: 24.5,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "Cisco Systems",
        initials: "CS",
        category: "Super Dream",
        placedCount: 10,
        roles: ["Network Consulting Engineer"],
        ctcRange: "₹14 - ₹22 LPA",
        avgCtcLpa: 18.0,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "Zoho Corporation",
        initials: "ZH",
        category: "Dream",
        placedCount: 30,
        roles: ["Software Developer"],
        ctcRange: "₹7 - ₹11 LPA",
        avgCtcLpa: 9.2,
        location: "Chennai, Tamil Nadu",
      },
      {
        companyName: "Infosys",
        initials: "IF",
        category: "Mass / IT Services",
        placedCount: 68,
        roles: ["Systems Engineer"],
        ctcRange: "₹5 - ₹8.5 LPA",
        avgCtcLpa: 6.5,
        location: "Bengaluru, Karnataka",
      },
      {
        companyName: "TCS",
        initials: "TC",
        category: "Mass / IT Services",
        placedCount: 76,
        roles: ["Assistant System Engineer"],
        ctcRange: "₹5 - ₹8 LPA",
        avgCtcLpa: 6.2,
        location: "Pune, Maharashtra",
      },
      {
        companyName: "Wipro",
        initials: "WP",
        category: "Mass / IT Services",
        placedCount: 52,
        roles: ["Project Engineer"],
        ctcRange: "₹4.5 - ₹7.5 LPA",
        avgCtcLpa: 5.8,
        location: "Bengaluru, Karnataka",
      },
    ],
  },
];
