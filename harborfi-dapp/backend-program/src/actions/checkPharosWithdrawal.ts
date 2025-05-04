import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { checkXenditPayoutStatus, sendXenditPayout } from '../services/xendit';

const prisma = new PrismaClient();
const WITHDRAWAL_DEV_WALLET_ADDRESS = process.env.WITHDRAWAL_HARBOR_WALLET?.toLowerCase();
const PHAROS_API_BASE = 'https://pharosscan.xyz/api/v2';

export async function checkPharosWithdrawal() {
  const TEN_MINUTES_AGO = new Date(Date.now() - 10 * 60 * 1000);

  const pendingWithdrawals = await prisma.transaction.findMany({
    where: {
      status: 'WAITING',
      type: 'WITHDRAWAL',
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

  for (const tx of pendingWithdrawals) {
    const userWallet = tx.userWallet.toLowerCase();
    const tokenAddress = tokenMap[tx.tokenType];
    const expectedAmount = tx.tokenAmount;

    try {
      const { data } = await axios.get(`${PHAROS_API_BASE}/addresses/${userWallet}/token-transfers`);

      const transfers = data?.items || [];
      const matchingTransfer = transfers.find((transfer: any) => {
        const to = transfer.to?.hash?.toLowerCase();
        const value = parseFloat(transfer.total.value) / 10 ** parseFloat(transfer.total.decimals);
        const timestamp = new Date(transfer.timestamp).getTime();
        const tokenAddressInTx = transfer.token.address.toLowerCase();
        return (
            tokenAddress == tokenAddressInTx &&
          to == WITHDRAWAL_DEV_WALLET_ADDRESS?.toLowerCase()  &&
          Math.abs(value - expectedAmount!*(1.0)) < 0.0001 &&
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

        console.log(`✅ Withdrawal TX ${tx.id} marked as PAID`);
      }
    } catch (error) {
      console.error(`❌ Error verifying withdrawal ${tx.id}:`, error);
    }
  }


   const paidTxs = await prisma.transaction.findMany({
    where: {
      status: 'PAID',
      type: 'WITHDRAWAL',
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
      if(xenditTxId){
        await prisma.transaction.update({
            where: { id: tx.id },
            data: {
              status: 'COMPLETED',
              xenditId: xenditTxId,
            },
          });
      }

      console.log(`🎉 Transaction ${tx.id} marked as COMPLETED`);
     

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
