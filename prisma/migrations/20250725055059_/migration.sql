/*
  Warnings:

  - You are about to drop the column `customDomain` on the `App` table. All the data in the column will be lost.
  - You are about to drop the `EssentialComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EssentialLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AppMembers` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `subdomain` on table `App` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "EssentialComment" DROP CONSTRAINT "EssentialComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "EssentialComment" DROP CONSTRAINT "EssentialComment_essentialId_fkey";

-- DropForeignKey
ALTER TABLE "EssentialLike" DROP CONSTRAINT "EssentialLike_essentialId_fkey";

-- DropForeignKey
ALTER TABLE "EssentialLike" DROP CONSTRAINT "EssentialLike_userId_fkey";

-- DropForeignKey
ALTER TABLE "_AppMembers" DROP CONSTRAINT "_AppMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_AppMembers" DROP CONSTRAINT "_AppMembers_B_fkey";

-- DropIndex
DROP INDEX "App_customDomain_key";

-- AlterTable
ALTER TABLE "App" DROP COLUMN "customDomain",
ALTER COLUMN "subdomain" SET NOT NULL;

-- DropTable
DROP TABLE "EssentialComment";

-- DropTable
DROP TABLE "EssentialLike";

-- DropTable
DROP TABLE "_AppMembers";

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "inviterId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Membership_appId_userId_key" ON "Membership"("appId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_appId_email_key" ON "Invitation"("appId", "email");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
