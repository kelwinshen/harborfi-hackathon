-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userWallet" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "tokenAmount" REAL,
    "fiatCurrency" TEXT NOT NULL,
    "fiatAmount" INTEGER,
    "paymentDetails" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "xenditId" TEXT,
    "onChainTxHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
