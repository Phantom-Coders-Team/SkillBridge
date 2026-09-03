-- AlterTable
ALTER TABLE "proofs_of_work" ADD COLUMN "publicToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "proofs_of_work_publicToken_key" ON "proofs_of_work"("publicToken");

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "industryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "challengeType" TEXT NOT NULL,
    "domain" TEXT,
    "techStack" TEXT,
    "objectives" TEXT,
    "stipend" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "deadline" DATETIME,
    "rndOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "challenges_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "challenge_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "labUnitId" TEXT NOT NULL,
    "proposal" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "challenge_applications_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "challenge_applications_labUnitId_fkey" FOREIGN KEY ("labUnitId") REFERENCES "lab_units" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lab_units" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "challengeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'FORMING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lab_units_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lab_units_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lab_unit_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "labUnitId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lab_unit_members_labUnitId_fkey" FOREIGN KEY ("labUnitId") REFERENCES "lab_units" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lab_unit_members_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dual_gradings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "labUnitId" TEXT NOT NULL,
    "academicMarks" INTEGER,
    "jobReadinessScore" INTEGER,
    "facultyRemarks" TEXT,
    "industryRemarks" TEXT,
    "gradedByFacultyId" TEXT,
    "gradedByIndustryId" TEXT,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dual_gradings_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dual_gradings_labUnitId_fkey" FOREIGN KEY ("labUnitId") REFERENCES "lab_units" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dual_gradings_gradedByFacultyId_fkey" FOREIGN KEY ("gradedByFacultyId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "dual_gradings_gradedByIndustryId_fkey" FOREIGN KEY ("gradedByIndustryId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "challenge_applications_challengeId_labUnitId_key" ON "challenge_applications"("challengeId", "labUnitId");

-- CreateIndex
CREATE INDEX "challenges_industryId_idx" ON "challenges"("industryId");

-- CreateIndex
CREATE INDEX "lab_units_facultyId_idx" ON "lab_units"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "lab_unit_members_labUnitId_studentId_key" ON "lab_unit_members"("labUnitId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "dual_gradings_challengeId_labUnitId_key" ON "dual_gradings"("challengeId", "labUnitId");
