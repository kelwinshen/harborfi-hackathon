
import { checkPharosQR } from "../actions/checkPharosQR";






export function startResponsiveProcessor(intervalMs = 30000) {
  console.log(`🔁 Responsive Processor will run every ${intervalMs / 1000}s...`);
  setInterval(async () => {
    try {

      console.log('🔍 Checking for Pharos QR');
      await checkPharosQR();
      
      
    } catch (err) {
      console.error('❌ Error in processor:', err);
    }
  }, intervalMs);
}
