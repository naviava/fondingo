-- CreateTable
CREATE TABLE "ConfirmEmailToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ConfirmEmailToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmEmailToken_token_key" ON "ConfirmEmailToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmEmailToken_userId_key" ON "ConfirmEmailToken"("userId");

-- AddForeignKey
ALTER TABLE "ConfirmEmailToken" ADD CONSTRAINT "ConfirmEmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
