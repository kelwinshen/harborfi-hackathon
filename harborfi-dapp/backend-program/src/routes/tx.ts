import { PrismaClient } from '@prisma/client';
import { createXenditPaymentRequest } from '../services/xendit';
import express from 'express';
import { Xendit } from 'xendit-node';

const xendit = new Xendit({ secretKey: process.env.XENDIT_API_KEY! });

const { PaymentRequest, PaymentMethod } = xendit;

const txRouter = express.Router();
const prisma = new PrismaClient();

const HARBORWALLET = process.env.HARBORWALLET_ADDRESS!;


txRouter.post('/transaction', async (req, res) => {
    const {
        userWallet,
        type,
        fiatCurrency,
        fiatAmount,
        tokenType,
        paymentDetails,
        tokenAmount
    } = req.body;

    if (!type || !userWallet  ) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (!['DEPOSIT', 'WITHDRAWAL', 'QR'].includes(type)) {
        res.status(400).json({ error: 'Invalid transaction type' });
        return;
      }


      try {
       
    
        // 🚀 DEPOSIT flow
        if (type === 'DEPOSIT') {
          if (!fiatAmount || !paymentDetails?.method) {
            res.status(400).json({ error: 'Missing idrAmount or payment method in paymentDetails' });
            return;
          }

          const tx = await prisma.transaction.create({
            data: {
              userWallet,
              type,
              tokenType,
              fiatCurrency,
              fiatAmount,
              tokenAmount: fiatAmount,
              paymentDetails,
            },
          });

    
          const xenditPayment = await createXenditPaymentRequest(
            fiatAmount,
           
            paymentDetails.method,
            tx.id,
            paymentDetails.channelCode,
            userWallet,
            fiatCurrency
          );

    
          let instruction = {};

          if(paymentDetails.method == "QR"){
    
            await prisma.transaction.update({
              where: { id: tx.id },
              data: { 
                xenditId: xenditPayment.id, paymentDetails:
                 { method:  paymentDetails.method,
                   channelCode: paymentDetails.channelCode, 
                    qrString: xenditPayment.paymentMethod?.qrCode?.channelProperties?.qrString} },
            });
    
            instruction =  {
              payWith: paymentDetails.method,
              amountIDR: xenditPayment.amount,
              expiresAt: xenditPayment.paymentMethod?.qrCode?.channelProperties?.expiresAt ?? null,
              qrString: xenditPayment.paymentMethod?.qrCode?.channelProperties?.qrString,
              note: 'Complete the payment before expiration',
            }
          } else{
    
            await prisma.transaction.update({
              where: { id: tx.id },
              data: { xenditId: xenditPayment.id, 
                paymentDetails: {
                   method:  paymentDetails.method, 
                   channelCode: paymentDetails.channelCode,  
                    vaNumber: xenditPayment.paymentMethod?.virtualAccount?.channelProperties?.virtualAccountNumber} },
            });

            instruction =  {
              payWith: paymentDetails.method,
              amountIDR: xenditPayment.amount,
              expiresAt: xenditPayment.paymentMethod?.virtualAccount?.channelProperties?.expiresAt ?? null,
              vaNumber: xenditPayment.paymentMethod?.virtualAccount?.channelProperties?.virtualAccountNumber,
              note: 'Complete the payment before expiration',
            }
          }
    
         res.status(201).json({
         success: true,
         tx: tx,
        instruction
});
          return;
        }
    
        // 🚀 WITHDRAWAL flow
        if (type === 'WITHDRAWAL') {
    
    
          if (!tokenAmount || !paymentDetails?.method || !paymentDetails?.accountNumber || !paymentDetails?.accountHolderName) {
            res.status(400).json({ error: 'Missing withdrawal amount or payment details for withdrawal' });
            return;
          }
    
          if(userWallet == HARBORWALLET){
            res.status(400).json({ error: 'Harbor wallet cannot be withdrawal transaction!'});
            return;
           }
    
    
          const tx = await prisma.transaction.create({
            data: {
              type,
              userWallet,
              tokenAmount,
              fiatCurrency,
              tokenType,
              fiatAmount: tokenAmount,
              paymentDetails: {
               method: paymentDetails?.method,
               code: paymentDetails?.method,
               accountNumber: paymentDetails?.accountNumber,
               accountHolderName: paymentDetails?.accountHolderName,
               harborAddress: HARBORWALLET
              },
            },
          });
    
    
    
          res.status(201).json({
            success: true,
            tx,
            instruction: {
              sendTo: HARBORWALLET,
              tokenType: tokenType,
              amountToken: tokenAmount,
            },
          });
          return;
        }


        // 🚀 QR flow
        if (type === 'QR') {
            const qrContent = paymentDetails?.qrString;

            if (qrContent == ('qrHarbor-IDR-100000') || 'qrHarbor-THB-500' || 'qrHarbor-PHP-800') {
            
           
                const tokenAmountFromQR = qrContent.split("-")[2];
                const fiatCurrencyFromQR = qrContent.split("-")[1];

           
            const tx = await prisma.transaction.create({
              data: {
                type,
                userWallet,
                tokenAmount : parseFloat(tokenAmountFromQR),
                fiatAmount: parseFloat(tokenAmountFromQR),
                fiatCurrency: fiatCurrencyFromQR,
                tokenType: fiatCurrencyFromQR == "IDR" ? "HIDR" : fiatCurrencyFromQR == "THB" ? "HTHB" : "HTHB",
                paymentDetails: {
                    qrContent : qrContent,
                code: fiatCurrencyFromQR == "IDR" ? "ID_BCA" : fiatCurrencyFromQR == "THB" ? "TH_BT" : "PH_MAYA", //mock the bank destination
                 accountNumber: "0123456789", //mock the bank account number of the marchant QR receivement
                 accountHolderName: fiatCurrencyFromQR == "IDR" ? "McDonalds Indonesia" : fiatCurrencyFromQR == "THB" ? "Starbucks Thailand" : "Jollibee Philipines", //mock the merchant based on the currency
                },
              },
            });
      
      
            res.status(201).json({
              success: true,
              tx,
              instruction: {
                qrContent: qrContent,
                tokenType: tokenType,
                amountToken: tokenAmount,
              },
            });
            return;
          } else{
                res.status(400).json({ error: 'QR Invalid' });
                return;

          }
        }
        
      } catch (error) {
        console.error('❌ DB error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });



    txRouter.get('/transaction/:id', async (req, res) => {
        const { id } = req.params;
      
        if (!id) {
         res.status(400).json({ error: "Missing transaction ID" });
         return;
        }
      
        try {
          const tx = await prisma.transaction.findUnique({
            where: { id },
          });
      
          if (!tx) {
        res.status(404).json({ error: "Transaction not found" });
        return;
          }
      
          res.status(200).json({ success: true, tx });
        } catch (err) {
          console.error("❌ Error fetching transaction by ID:", err);
          res.status(500).json({ error: "Internal server error" });
        }
      });
      
// GET /transaction/address/:userWallet → Get all transactions for an address
txRouter.get('/transaction/address/:userWallet', (req, res) => {
    const { userWallet } = req.params;
  
    prisma.transaction.findMany({
      where: { userWallet },
      orderBy: { createdAt: 'desc' },
    })
    .then((txs: any) => {
      return res.status(200).json({
        success: true,
        transactions: txs,
      });
    })
    .catch((error: any) => {
      console.error('❌ Error fetching transactions by address:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    });
  });




  txRouter.post('/settle/:id', async (req, res) => {
    const { id } = req.params;
  
    if (!id) {
       res.status(400).json({ error: "Missing transaction ID" });
       return
    }
  
    try {
      const tx = await prisma.transaction.findUnique({ where: { id } });
  
      if (!tx || !tx.xenditId) {
         res.status(404).json({ error: "Transaction not found or missing xenditId" });
         return
      }
  
      // Get latest payment info
      const xendit = new Xendit({ secretKey: process.env.XENDIT_API_KEY! });
      const { PaymentRequest, PaymentMethod } = xendit;
  
      const paymentRequest = await PaymentRequest.getPaymentRequestByID({
        paymentRequestId: tx.xenditId,
      });
  
      const paymentMethodId = paymentRequest?.paymentMethod?.id;
      const amount = paymentRequest?.amount;
  
      if (!paymentMethodId || !amount) {
         res.status(400).json({ error: "PaymentMethod ID or amount not found" });
         return
      }
  
      const simulate = await PaymentMethod.simulatePayment({
        paymentMethodId,
        data: { amount },
      });
  
       res.status(200).json({ success: true, simulate });
       return
    } catch (err) {
      console.error("[SETTLE ERROR]", err);
       res.status(500).json({ error: "Internal server error" });
       return
    }
  });
  





export default txRouter;
