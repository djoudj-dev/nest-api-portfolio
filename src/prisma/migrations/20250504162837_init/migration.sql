-- CreateTable
CREATE TABLE "BadgeStatus" (
    "id" TEXT NOT NULL,
    "status" TEXT[],
    "available_from" TIMESTAMP(3),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BadgeStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractType" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StatusToContractTypes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StatusToContractTypes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StatusToContractTypes_B_index" ON "_StatusToContractTypes"("B");

-- AddForeignKey
ALTER TABLE "_StatusToContractTypes" ADD CONSTRAINT "_StatusToContractTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "BadgeStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StatusToContractTypes" ADD CONSTRAINT "_StatusToContractTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "ContractType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
