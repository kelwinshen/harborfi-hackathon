import express from 'express';
import cors from 'cors';
import txRouter from './routes/tx';
import { startResponsiveProcessor } from './jobs/responsiveProcessor';
import { startTransactionProcessor } from './jobs/processor';

const app = express();

// ✅ CORS first!
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.options('*', cors()); // Preflight

// ✅ Then JSON and routes
app.use(express.json());
app.use('/api', txRouter);


app.listen(4001, () => {
  console.log('🚀 Server running on http://localhost:4001');
  startTransactionProcessor();
  startResponsiveProcessor();
});
