import { checkPharosDepositStatusAndProcess } from "../actions/checkPharosDeposit";
import { checkPharosWithdrawal } from "../actions/checkPharosWithdrawal";
import { expireOldTransactions } from "../actions/expireOldTransaction";

export function startTransactionProcessor(intervalMs = 10000) {
  console.log(`🔁 Transaction Processor will run every ${intervalMs / 1000}s...`);
  setInterval(async () => {
    console.log('🔍 Expiring for Deposit Status and Process');
    await expireOldTransactions();  
    console.log('🔍 Checking for Deposit Status and Process');
      await checkPharosDepositStatusAndProcess();
      console.log('🔍 Checking for Withdrawal Status and Process');
      await checkPharosWithdrawal();

      
  }, intervalMs);
}
