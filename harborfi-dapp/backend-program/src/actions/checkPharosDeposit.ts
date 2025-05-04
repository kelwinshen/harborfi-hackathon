// utils/checkPharosDeposit.ts

import { PrismaClient } from '@prisma/client';
import { checkXenditPaymentStatus } from '../services/xendit';
import { sendPharosToken } from '../services/pharos';

const prisma = new PrismaClient();

export async function checkPharosDepositStatusAndProcess() {
  // 1. CHECK XENDIT STATUS → Set to PAID
  const waitingDeposits = await prisma.transaction.findMany({
    where: { type: 'DEPOSIT', status: 'WAITING', xenditId: { not: null } },
  });

  for (const tx of waitingDeposits) {
    try {
      const status = await checkXenditPaymentStatus(tx.xenditId!);
      if (status === 'PAID') {
        await prisma.transaction.update({
          where: { id: tx.id },
          data: { status: 'PAID' },
        });
        console.log(`✅ TX ${tx.id} marked as PAID`);
      }
    } catch (err) {
      console.error(`❌ Error checking Xendit payment for TX ${tx.id}`, err);
    }
  }

  // 2. SEND TOKEN TRANSFER FROM PROGRAM → Set to COMPLETED
  const paidDeposits = await prisma.transaction.findMany({
    where: { type: 'DEPOSIT', status: 'PAID' },
  });


  for (const tx of paidDeposits) {
    try {

      const txHash = await sendPharosToken(
        tx.tokenType == 'HIDR' ?  "0x459ed4f0f9398608db761cec80efc2528ba81699" :  tx.tokenType == 'HTHB' ? "0x9343850dbdd5aafac57084f6be7777c736815df5" : "0x8242b1f5b6a067d1eadf3ad5093636188bdfcbc6",   // token address
        tx.userWallet,            
        tx.tokenAmount!.toString() 
      );

      // Mark as COMPLETED with simulated hash
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: 'COMPLETED',
          onChainTxHash: txHash,
        },
      });

      console.log(`✅ TX ${tx.id} completed with tx hash: ${txHash}`);
    } catch (err) {
      console.error(`❌ Error processing token transfer for TX ${tx.id}`, err);
    }
  }
}
