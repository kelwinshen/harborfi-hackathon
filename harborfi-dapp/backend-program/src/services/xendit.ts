import { CreatePayoutRequest, GetPayouts200ResponseDataInner } from 'xendit-node/payout/models'
import { PaymentRequestParameters, VirtualAccountChannelCode } from 'xendit-node/payment_request/models'
import { Json, Xendit } from 'xendit-node'


const xendit = new Xendit({ secretKey: process.env.XENDIT_API_KEY! })
const { Payout, PaymentRequest } = xendit

/**
 * Create a payment request using QRIS or Virtual Account
 */


export async function createXenditPaymentRequest(
  amount: number,
  method: 'QR' | 'VA',
  referenceId: string,
  channelCode: VirtualAccountChannelCode,
  walletAddress: string,
  fiatCurrency: 'IDR' | 'THB' | 'PHP' 
  
) {
  const data: PaymentRequestParameters =
  method === 'QR'
    ? {
        amount: fiatCurrency == "IDR" ?  Math.floor(amount) : Math.floor(amount * 500),
        currency:  'IDR' , // must be use the params of fiatCurrency but the QR for other currency need activated from Xendit, we just represent it use QRIS that need use IDR Currency 
        referenceId,
        paymentMethod: {
          type: 'QR_CODE',
          reusability: 'ONE_TIME_USE',
          qrCode: {
            channelCode: 'QRIS'
            //Need to be activated by Xendit Support for use QRPH And Promptpay, currently just mock all the QR use QRIS (The activated one)
              // fiatCurrency === 'IDR'
              //   ? 'QRIS'
              //   : fiatCurrency === 'PHP'
              //   ? 'QRPH'
              //   : 'PROMPTPAY',
          },
        },
      }
    : { 
        amount: channelCode == "UNKNOWN_ENUM_VALUE" ? Math.floor(amount * 500)*(1.02): Math.floor(amount*1.02), //need to adjusted for minimum needed for mock the PH and TH payment currency to Indonesia Local Bank
        currency: "IDR", //the unkown like philipines need to further cooperation with local bank, mock it use Thailand Bank 
        referenceId,
        paymentMethod: {
          type: 'VIRTUAL_ACCOUNT',
          reusability: 'ONE_TIME_USE',
          virtualAccount: {
            channelCode: channelCode == "UNKNOWN_ENUM_VALUE" ? "BCA" :  channelCode, //the unkown like philipines need to further cooperation with Philipines bank
            channelProperties: {
              customerName: walletAddress,
              expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
          },
        },
      }
  const response = await PaymentRequest.createPaymentRequest({ data })
  return response
}

/**
 * Check payment status
 */
export async function checkXenditPaymentStatus(
  paymentRequestId: string
): Promise<'PAID' | 'WAITING'> {
  const response = await PaymentRequest.getPaymentRequestByID({ paymentRequestId })
  return response.status === 'SUCCEEDED' ? 'PAID' : 'WAITING'
}


/**
 * Send payout
 */
export async function sendXenditPayout(amount: number, paymentDetails: Json, currency: 'IDR' | 'THB' | 'PHP' ) {

  const data: CreatePayoutRequest = {
    referenceId: 'DISB-' + Date.now(),
    currency: currency,
    amount,
    channelCode: paymentDetails.code ? paymentDetails.code : paymentDetails.method,
    channelProperties: {
      accountHolderName: paymentDetails.accountHolderName,
      accountNumber: paymentDetails.accountNumber, // Replace later with user input
    },
    description: 'Harbor withdrawal',
  }

  const response: GetPayouts200ResponseDataInner = await Payout.createPayout({
    idempotencyKey: 'payout_' + Date.now(),
    data,
  })

  return { xenditTxId: response.id }
}


export async function checkXenditPayoutStatus(
  payoutId: string
): Promise<'COMPLETED' | 'WAITING' | 'FAILED'> {
  try {
    const response: GetPayouts200ResponseDataInner = await Payout.getPayoutById({ id: payoutId })

    const statusMap: Record<string, 'COMPLETED' | 'WAITING' | 'FAILED'> = {
      SUCCEEDED: 'COMPLETED',
      FAILED: 'FAILED',
      REJECTED: 'FAILED',
      CANCELLED: 'FAILED',
    }

    return statusMap[response.status] || 'WAITING'
  } catch (err: any) {
    console.error('Error fetching payout status:', err?.response?.data || err.message)
    return 'FAILED'
  }
}



