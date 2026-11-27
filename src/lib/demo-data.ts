/**
 * Consistent Demo & Seed Data for HireGate Multi-Role Portals.
 * Used for interactive client previews where live database records are not yet seeded.
 */

export type PlacementTier = "TIER_1" | "TIER_2" | "TIER_3";
export type DriveStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  | "REJECTED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface DemoStudent {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  branch: "CSE" | "ECE" | "IT" | "MECH";
  batch: number;
  cgpa: number;
  tenthPct: number;
  twelfthPct: number;
  activeBacklogs: number;
  totalBacklogs: number;
  gender: "Male" | "Female" | "Other";
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  placedTier?: PlacementTier;
  placedCompany?: string;
  placedCtc?: string;
  resumeName: string;
}

export interface DemoDrive {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoText: string;
  companyBrandColor: string;
  title: string;
  roleType: "Full Time" | "Internship" | "Full Time + 6M Intern";
  tier: PlacementTier;
  tierLabel: string;
  ctcLpa: number;
  ctcFormatted: string;
  location: string;
  deadlineLabel: string;
  timeLeftLabel: string;
  status: DriveStatus;
  criteria: {
    branches: string[];
    minCgpa: number;
    maxBacklogs: number;
    minTenth?: number;
  };
  rounds: string[];
  applicantCount: number;
  shortlistedCount: number;
  description: string;
}

export interface DemoApplication {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  branch: string;
  cgpa: number;
  driveId: string;
  companyName: string;
  roleTitle: string;
  tierLabel: string;
  ctcFormatted: string;
  appliedOn: string;
  currentRound: string;
  status: ApplicationStatus;
  resumeName: string;
}

export interface DemoAttendance {
  id: string;
  driveId: string;
  roundName: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  branch: string;
  attendance: AttendanceStatus;
  remarks: string;
  result: "PENDING" | "PASSED" | "FAILED";
}

export interface DemoAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: "STUDENT" | "ADMIN" | "RECRUITER" | "COORDINATOR";
  action: string;
  target: string;
  details: string;
}

export const DEMO_STUDENTS: DemoStudent[] = [
  {
    id: "stu-ayush",
    name: "Ayush Mahapatro",
    rollNo: "2022CS045",
    email: "ayush@college.edu",
    branch: "CSE",
    batch: 2026,
    cgpa: 8.74,
    tenthPct: 94.2,
    twelfthPct: 91.8,
    activeBacklogs: 0,
    totalBacklogs: 0,
    gender: "Male",
    isVerified: true,
    verifiedBy: "Dr. Priya Sharma",
    verifiedAt: "12 Aug 2025",
    resumeName: "Ayush_Mahapatro_SWE_2026.pdf",
  },
  {
    id: "stu-aarav",
    name: "Aarav Sharma",
    rollNo: "2022CS048",
    email: "aarav.sharma@college.edu",
    branch: "CSE",
    batch: 2026,
    cgpa: 8.7,
    tenthPct: 92.5,
    twelfthPct: 90.0,
    activeBacklogs: 0,
    totalBacklogs: 0,
    gender: "Male",
    isVerified: true,
    verifiedBy: "Dr. Priya Sharma",
    verifiedAt: "12 Aug 2025",
    resumeName: "Aarav_Sharma_Resume.pdf",
  },
  {
    id: "stu-ishita",
    name: "Ishita Verma",
    rollNo: "2022EC032",
    email: "ishita.verma@college.edu",
    branch: "ECE",
    batch: 2026,
    cgpa: 8.5,
    tenthPct: 91.0,
    twelfthPct: 88.5,
    activeBacklogs: 0,
    totalBacklogs: 0,
    gender: "Female",
    isVerified: true,
    verifiedBy: "Dr. Priya Sharma",
    verifiedAt: "14 Aug 2025",
    resumeName: "Ishita_Verma_ECE.pdf",
  },
  {
    id: "stu-rohan",
    name: "Rohan Patel",
    rollNo: "2022CS118",
    email: "rohan.patel@college.edu",
    branch: "CSE",
    batch: 2026,
    cgpa: 8.9,
    tenthPct: 95.0,
    twelfthPct: 93.4,
    activeBacklogs: 0,
    totalBacklogs: 0,
    gender: "Male",
    isVerified: true,
    verifiedBy: "Dr. Priya Sharma",
    verifiedAt: "13 Aug 2025",
    resumeName: "Rohan_Patel_CV.pdf",
  },
  {
    id: "stu-sneha",
    name: "Sneha Iyer",
    rollNo: "2022IT076",
    email: "sneha.iyer@college.edu",
    branch: "IT",
    batch: 2026,
    cgpa: 8.4,
    tenthPct: 89.4,
    twelfthPct: 87.2,
    activeBacklogs: 0,
    totalBacklogs: 1,
    gender: "Female",
    isVerified: false,
    resumeName: "Sneha_Iyer_Resume.pdf",
  },
  {
    id: "stu-karan",
    name: "Karan Mehta",
    rollNo: "2022CS201",
    email: "karan.mehta@college.edu",
    branch: "CSE",
    batch: 2026,
    cgpa: 8.6,
    tenthPct: 90.2,
    twelfthPct: 88.0,
    activeBacklogs: 0,
    totalBacklogs: 0,
    gender: "Male",
    isVerified: false,
    resumeName: "Karan_Mehta_SWE.pdf",
  },
  {
    id: "stu-vikram",
    name: "Vikram Singh",
    rollNo: "2022ME019",
    email: "vikram.singh@college.edu",
    branch: "MECH",
    batch: 2026,
    cgpa: 7.45,
    tenthPct: 84.0,
    twelfthPct: 81.5,
    activeBacklogs: 1,
    totalBacklogs: 2,
    gender: "Male",
    isVerified: false,
    resumeName: "Vikram_Singh_Core.pdf",
  },
];

export const DEMO_DRIVES: DemoDrive[] = [
  {
    id: "drive-google",
    companyId: "comp-google",
    companyName: "Google",
    companyLogoText: "G",
    companyBrandColor: "text-blue-600 bg-blue-50 border-blue-200",
    title: "Software Engineer",
    roleType: "Full Time",
    tier: "TIER_1",
    tierLabel: "Tier 1",
    ctcLpa: 45,
    ctcFormatted: "₹ 45 LPA",
    location: "Bengaluru / Hyderabad",
    deadlineLabel: "25 Aug 2025, 11:59 PM",
    timeLeftLabel: "2d 14h 32m",
    status: "PUBLISHED",
    criteria: {
      branches: ["CSE", "ECE"],
      minCgpa: 8.5,
      maxBacklogs: 0,
      minTenth: 80,
    },
    rounds: [
      "Online Assessment",
      "Technical Interview 1",
      "System Design & DSA",
      "Googleyness & HR",
    ],
    applicantCount: 142,
    shortlistedCount: 48,
    description:
      "Design, develop, test, deploy, maintain, and enhance large-scale distributed software solutions across Google Cloud and Core Search infrastructure.",
  },
  {
    id: "drive-microsoft",
    companyId: "comp-microsoft",
    companyName: "Microsoft",
    companyLogoText: "MS",
    companyBrandColor: "text-sky-600 bg-sky-50 border-sky-200",
    title: "SDE Intern",
    roleType: "Internship",
    tier: "TIER_1",
    tierLabel: "Tier 1",
    ctcLpa: 30,
    ctcFormatted: "₹ 30 LPA",
    location: "Hyderabad / Noida",
    deadlineLabel: "25 Aug 2025, 11:59 PM",
    timeLeftLabel: "2d 14h 32m",
    status: "PUBLISHED",
    criteria: {
      branches: ["CSE", "IT"],
      minCgpa: 8.0,
      maxBacklogs: 0,
    },
    rounds: ["Online Coding Test", "Technical Interview 1", "AA Final Round"],
    applicantCount: 186,
    shortlistedCount: 54,
    description:
      "6-month internship with PPO opportunity building cloud-native services on Azure and Microsoft 365.",
  },
  {
    id: "drive-amazon",
    companyId: "comp-amazon",
    companyName: "Amazon",
    companyLogoText: "A",
    companyBrandColor: "text-amber-700 bg-amber-50 border-amber-200",
    title: "Software Development Engineer",
    roleType: "Full Time",
    tier: "TIER_1",
    tierLabel: "Tier 1",
    ctcLpa: 45,
    ctcFormatted: "₹ 45 LPA",
    location: "Bengaluru / Chennai",
    deadlineLabel: "30 Aug 2025, 11:59 PM",
    timeLeftLabel: "7d 14h 32m",
    status: "PUBLISHED",
    criteria: {
      branches: ["CSE", "ECE", "IT"],
      minCgpa: 7.5,
      maxBacklogs: 0,
    },
    rounds: [
      "Online Assessment",
      "Technical Interview 1",
      "Technical Interview 2",
      "Bar Raiser",
    ],
    applicantCount: 215,
    shortlistedCount: 62,
    description:
      "Build scalable e-commerce fulfillment and AWS microservices handling millions of requests per minute.",
  },
  {
    id: "drive-adobe",
    companyId: "comp-adobe",
    companyName: "Adobe",
    companyLogoText: "Ad",
    companyBrandColor: "text-rose-700 bg-rose-50 border-rose-200",
    title: "Product Intern",
    roleType: "Internship",
    tier: "TIER_2",
    tierLabel: "Tier 2",
    ctcLpa: 22,
    ctcFormatted: "₹ 22 LPA",
    location: "Noida / Bengaluru",
    deadlineLabel: "05 Sep 2025, 11:59 PM",
    timeLeftLabel: "13d left",
    status: "PUBLISHED",
    criteria: {
      branches: ["CSE", "IT"],
      minCgpa: 7.5,
      maxBacklogs: 0,
    },
    rounds: ["Online Assessment", "Technical Round", "HR Round"],
    applicantCount: 98,
    shortlistedCount: 28,
    description:
      "Work on Creative Cloud web experiences and AI-assisted document workflows.",
  },
  {
    id: "drive-uber",
    companyId: "comp-uber",
    companyName: "Uber",
    companyLogoText: "U",
    companyBrandColor: "text-slate-900 bg-slate-100 border-slate-300",
    title: "Backend Engineer",
    roleType: "Full Time",
    tier: "TIER_1",
    tierLabel: "Tier 1",
    ctcLpa: 52,
    ctcFormatted: "₹ 52 LPA",
    location: "Bengaluru",
    deadlineLabel: "28 Aug 2025, 11:59 PM",
    timeLeftLabel: "5d 08h 12m",
    status: "PUBLISHED",
    criteria: {
      branches: ["CSE"],
      minCgpa: 9.0,
      maxBacklogs: 0,
    },
    rounds: [
      "CodeSignal Assessment",
      "Algorithms & Concurrency",
      "Architecture Round",
      "Hiring Manager",
    ],
    applicantCount: 64,
    shortlistedCount: 16,
    description:
      "High-throughput real-time dispatch and pricing systems in Go and Java.",
  },
];

export const DEMO_APPLICATIONS: DemoApplication[] = [
  {
    id: "app-1",
    studentId: "stu-ayush",
    studentName: "Ayush Mahapatro",
    rollNo: "2022CS045",
    branch: "CSE",
    cgpa: 8.74,
    driveId: "drive-adobe",
    companyName: "Adobe",
    roleTitle: "Product Intern",
    tierLabel: "Tier 2",
    ctcFormatted: "₹ 22 LPA",
    appliedOn: "22 Aug 2025",
    currentRound: "Technical Round",
    status: "INTERVIEW",
    resumeName: "Ayush_Mahapatro_SWE_2026.pdf",
  },
  {
    id: "app-2",
    studentId: "stu-rohan",
    studentName: "Rohan Patel",
    rollNo: "2022CS118",
    branch: "CSE",
    cgpa: 8.9,
    driveId: "drive-google",
    companyName: "Google",
    roleTitle: "Software Engineer",
    tierLabel: "Tier 1",
    ctcFormatted: "₹ 45 LPA",
    appliedOn: "24 Aug 2025",
    currentRound: "Online Assessment",
    status: "SHORTLISTED",
    resumeName: "Rohan_Patel_CV.pdf",
  },
  {
    id: "app-3",
    studentId: "stu-ishita",
    studentName: "Ishita Verma",
    rollNo: "2022EC032",
    branch: "ECE",
    cgpa: 8.5,
    driveId: "drive-microsoft",
    companyName: "Microsoft",
    roleTitle: "SDE Intern",
    tierLabel: "Tier 1",
    ctcFormatted: "₹ 30 LPA",
    appliedOn: "24 Aug 2025",
    currentRound: "Application Screening",
    status: "APPLIED",
    resumeName: "Ishita_Verma_ECE.pdf",
  },
  {
    id: "app-4",
    studentId: "stu-aarav",
    studentName: "Aarav Sharma",
    rollNo: "2022CS048",
    branch: "CSE",
    cgpa: 8.7,
    driveId: "drive-google",
    companyName: "Google",
    roleTitle: "Software Engineer",
    tierLabel: "Tier 1",
    ctcFormatted: "₹ 45 LPA",
    appliedOn: "23 Aug 2025",
    currentRound: "Online Assessment",
    status: "SHORTLISTED",
    resumeName: "Aarav_Sharma_Resume.pdf",
  },
  {
    id: "app-5",
    studentId: "stu-sneha",
    studentName: "Sneha Iyer",
    rollNo: "2022IT076",
    branch: "IT",
    cgpa: 8.4,
    driveId: "drive-adobe",
    companyName: "Adobe",
    roleTitle: "Product Intern",
    tierLabel: "Tier 2",
    ctcFormatted: "₹ 22 LPA",
    appliedOn: "22 Aug 2025",
    currentRound: "Technical Round",
    status: "INTERVIEW",
    resumeName: "Sneha_Iyer_Resume.pdf",
  },
];

export const DEMO_ATTENDANCE: DemoAttendance[] = [
  {
    id: "att-1",
    driveId: "drive-google",
    roundName: "Round 1: Online Assessment",
    studentId: "stu-aarav",
    studentName: "Aarav Sharma",
    rollNo: "2022CS048",
    branch: "CSE",
    attendance: "PRESENT",
    remarks: "On time",
    result: "PASSED",
  },
  {
    id: "att-2",
    driveId: "drive-google",
    roundName: "Round 1: Online Assessment",
    studentId: "stu-ishita",
    studentName: "Ishita Verma",
    rollNo: "2022EC032",
    branch: "ECE",
    attendance: "PRESENT",
    remarks: "On time",
    result: "PENDING",
  },
  {
    id: "att-3",
    driveId: "drive-google",
    roundName: "Round 1: Online Assessment",
    studentId: "stu-rohan",
    studentName: "Rohan Patel",
    rollNo: "2022CS118",
    branch: "CSE",
    attendance: "ABSENT",
    remarks: "—",
    result: "FAILED",
  },
  {
    id: "att-4",
    driveId: "drive-google",
    roundName: "Round 1: Online Assessment",
    studentId: "stu-sneha",
    studentName: "Sneha Iyer",
    rollNo: "2022IT076",
    branch: "IT",
    attendance: "LATE",
    remarks: "Late by 5 mins",
    result: "PASSED",
  },
  {
    id: "att-5",
    driveId: "drive-google",
    roundName: "Round 1: Online Assessment",
    studentId: "stu-karan",
    studentName: "Karan Mehta",
    rollNo: "2022CS201",
    branch: "CSE",
    attendance: "PRESENT",
    remarks: "On time",
    result: "PENDING",
  },
];

export const DEMO_AUDIT_LOGS: DemoAuditLog[] = [
  {
    id: "log-1",
    timestamp: "24 Aug 2025, 14:22:08 IST",
    actor: "Dr. Priya Sharma",
    actorRole: "ADMIN",
    action: "STUDENT_VERIFIED",
    target: "Ishita Verma (2022EC032)",
    details: "Verified CGPA 8.50, 0 backlogs; Academic Passport locked.",
  },
  {
    id: "log-2",
    timestamp: "24 Aug 2025, 11:05:41 IST",
    actor: "Rajiv Mehta",
    actorRole: "RECRUITER",
    action: "CANDIDATE_SHORTLISTED",
    target: "Rohan Patel (2022CS118)",
    details: "Shortlisted for Google — Software Engineer (Online Assessment).",
  },
  {
    id: "log-3",
    timestamp: "23 Aug 2025, 18:40:12 IST",
    actor: "Dr. Priya Sharma",
    actorRole: "ADMIN",
    action: "DRIVE_PUBLISHED",
    target: "Google — Software Engineer (Tier 1)",
    details: "Published drive with AST rule: CSE/ECE, CGPA >= 8.5, Backlogs == 0.",
  },
  {
    id: "log-4",
    timestamp: "22 Aug 2025, 09:15:33 IST",
    actor: "Sneha Choudhary",
    actorRole: "COORDINATOR",
    action: "ROUND_ATTENDANCE_SYNCED",
    target: "Adobe — Product Intern",
    details: "Marked 42 Present, 3 Absent for Online Assessment.",
  },
];

