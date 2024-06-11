-- DropIndex
DROP INDEX "GroupMember_groupId_idx";

-- CreateIndex
CREATE INDEX "GroupMember_groupId_email_idx" ON "GroupMember"("groupId", "email");
