import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function expireOldTransactions() {
  const TEN_MINUTES_AGO = new Date(Date.now() - 10 * 60 * 1000);

  const expired = await prisma.transaction.updateMany({
    where: {
      status: 'WAITING',
      createdAt: { lt: TEN_MINUTES_AGO },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  if (expired.count > 0) {
    console.log(`⏳ Marked ${expired.count} transaction(s) as EXPIRED`);
  }
}
