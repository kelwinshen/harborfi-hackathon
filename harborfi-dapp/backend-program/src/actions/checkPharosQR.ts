// utils/verifyPendingTransactions.ts

import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { sendXenditPayout } from '../services/xendit';

const prisma = new PrismaClient();
const QR_DEV_WALLET_ADDRESS = process.env.QR_HARBOR_WALLET?.toLowerCase();
const PHAROS_API_BASE = 'https://pharosscan.xyz/api/v2';

export async function checkPharosQR() {
  const TEN_MINUTES_AGO = new Date(Date.now() - 10 * 60 * 1000);

  const pendingTransactions = await prisma.transaction.findMany({
    where: {
      status: 'WAITING',
      type: 'QR',
      createdAt: {
        gte: TEN_MINUTES_AGO,
      },
    },
  });

  const tokenMap: Record<string, string> = {
    HIDR: "0x459ed4f0f9398608db761cec80efc2528ba81699",
    HTHB: "0x9343850dbdd5aafac57084f6be7777c736815df5",
    HPHP: "0x8242b1f5b6a067d1eadf3ad5093636188bdfcbc6",
  };

  for (const tx of pendingTransactions) {
    const userWallet = tx.userWallet.toLowerCase();
    const tokenAddress = tokenMap[tx.tokenType];
    const expectedAmount = tx.tokenAmount;

    try {
      const { data } = await axios.get(`${PHAROS_API_BASE}/addresses/${userWallet}/token-transfers`);

      const transfers = data?.items || [];
      const matchingTransfer = transfers.find((transfer: any) => {
   
        const to = transfer.to?.hash?.toLowerCase();
        const value = parseFloat(transfer.total.value)/10**parseFloat(transfer.total.decimals);
        const timestamp = new Date(transfer.timestamp).getTime();
        const tokenAddressInTx = transfer.token.address.toLowerCase();
        return (
          tokenAddress === tokenAddressInTx &&
          to === QR_DEV_WALLET_ADDRESS?.toLowerCase() &&
          Math.abs(value - expectedAmount!) < 0.0001 &&
          timestamp >= tx.createdAt.getTime() &&
          timestamp <= tx.createdAt.getTime() + 10 * 60 * 1000
        );
      });

      if (matchingTransfer) {
        await prisma.transaction.update({
          where: { id: tx.id },
          data: {
            status: 'PAID',
            onChainTxHash: matchingTransfer.transaction_hash,
          },
        });

        console.log(`✅ Transaction ${tx.id} marked as PAID`);
      }
    } catch (error) {
      console.error(`❌ Error verifying transaction ${tx.id}:`, error);
    }
  }

    const paidTxs = await prisma.transaction.findMany({
    where: {
      status: 'PAID',
      type: 'QR',
    },
  });

  for (const tx of paidTxs) {
    try {
      const { fiatAmount, fiatCurrency, paymentDetails } = tx;

      // 🧾 Step 1: Send payout
      const { xenditTxId } = await sendXenditPayout(
        fiatAmount!,
        paymentDetails,
        fiatCurrency as 'IDR' | 'THB' | 'PHP'
      
      );

      console.log(`✅ Payout created → ${xenditTxId}`);

      // 📦 Step 2: Update to COMPLETED
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: 'COMPLETED',
          xenditId: xenditTxId,
        },
      });

    //   // ⏱ Step 3: Check payout status immediately
    //   const payoutStatus = await checkXenditPayoutStatus(xenditTxId);

    //   if (payoutStatus === 'COMPLETED') {
    //     await prisma.transaction.update({
    //       where: { id: tx.id },
    //       data: {
    //         status: 'COMPLETED',
    //       },
    //     });

    //     console.log(`🎉 Transaction ${tx.id} marked as COMPLETED`);
    //   } else {
    //     console.log(`⏳ Transaction ${tx.id} still pending payout...`);
    //   }
    } catch (err) {
      console.error(`❌ Error processing payout for tx ${tx.id}:`, err);
    }
  }
}
