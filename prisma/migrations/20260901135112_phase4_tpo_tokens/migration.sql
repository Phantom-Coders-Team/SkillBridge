-- CreateTable
CREATE TABLE "hiring_benchmarks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "department" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "skillName" TEXT NOT NULL,
    "requiredScore" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sabbatical_listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "domain" TEXT,
    "duration" TEXT,
    "location" TEXT,
    "compensation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sabbatical_listings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "hiring_benchmarks_department_idx" ON "hiring_benchmarks"("department");

-- CreateIndex
CREATE UNIQUE INDEX "hiring_benchmarks_department_year_skillName_key" ON "hiring_benchmarks"("department", "year", "skillName");

-- CreateIndex
CREATE INDEX "sabbatical_listings_companyId_idx" ON "sabbatical_listings"("companyId");
