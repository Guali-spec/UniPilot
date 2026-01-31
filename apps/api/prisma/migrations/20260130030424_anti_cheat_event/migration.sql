-- CreateTable
CREATE TABLE "AntiCheatEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AntiCheatEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AntiCheatEvent_sessionId_createdAt_idx" ON "AntiCheatEvent"("sessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "AntiCheatEvent" ADD CONSTRAINT "AntiCheatEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
