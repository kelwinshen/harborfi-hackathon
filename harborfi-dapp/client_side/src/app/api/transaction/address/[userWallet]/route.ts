import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL; 

export async function GET(
    req: NextRequest,
    { params }: {  params: Promise<{ userWallet: string }>}
  ) {

  const { userWallet } = await params;

  if (!userWallet) {
    return NextResponse.json({ success: false, error: "Missing wallet address" }, { status: 400 });
  }
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/transaction/address/${userWallet}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[ERROR] GET /api/transaction/address/:userWallet", err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
