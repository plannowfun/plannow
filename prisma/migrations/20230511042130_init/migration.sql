-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phone" BIGINT NOT NULL DEFAULT 0,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "family_id" INTEGER NOT NULL,
    "watching_member" INTEGER NOT NULL,
    "view" TEXT NOT NULL,
    "date" INTEGER NOT NULL,
    "subject_view" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "show_order" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Subject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "view" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Plan_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
