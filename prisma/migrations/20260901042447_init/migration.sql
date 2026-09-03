-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "department" TEXT,
    "companyName" TEXT,
    "designation" TEXT,
    "skills" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "year" INTEGER,
    "rollNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "syllabi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "topicsJson" TEXT NOT NULL,
    "obsolescenceScore" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "projectType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "domain" TEXT,
    "techStack" TEXT,
    "objectives" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "proofs_of_work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "artifactUrl" TEXT,
    "description" TEXT,
    "facultySignOff" TEXT NOT NULL DEFAULT 'PENDING',
    "industrySignOff" TEXT NOT NULL DEFAULT 'PENDING',
    "badgeQrCode" TEXT,
    "issuedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "proofs_of_work_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "proofs_of_work_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "skill_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "verifiedAt" DATETIME,
    "decayStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastAssessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "skill_assessments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "token_ledgers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "token_ledgers_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "token_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ledgerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "token_transactions_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "token_ledgers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mentor_slots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "industryId" TEXT NOT NULL,
    "studentId" TEXT,
    "timeSlot" DATETIME NOT NULL,
    "durationMins" INTEGER NOT NULL DEFAULT 30,
    "topic" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "mentor_slots_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mentor_slots_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "job_pitches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "industryId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "priScore" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PITCHED',
    "stipend" INTEGER,
    "roleDetails" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "job_pitches_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "job_pitches_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "proofs_of_work_studentId_idx" ON "proofs_of_work"("studentId");

-- CreateIndex
CREATE INDEX "proofs_of_work_projectId_idx" ON "proofs_of_work"("projectId");

-- CreateIndex
CREATE INDEX "skill_assessments_studentId_idx" ON "skill_assessments"("studentId");

-- CreateIndex
CREATE INDEX "mentor_slots_industryId_idx" ON "mentor_slots"("industryId");

-- CreateIndex
CREATE INDEX "mentor_slots_studentId_idx" ON "mentor_slots"("studentId");

-- CreateIndex
CREATE INDEX "job_pitches_industryId_idx" ON "job_pitches"("industryId");

-- CreateIndex
CREATE INDEX "job_pitches_studentId_idx" ON "job_pitches"("studentId");
