import { NextRequest, NextResponse } from "next/server";


const BACKEND_URL = process.env.BACKEND_URL;

// GET /api/transaction/[id]
export async function GET(
  req: NextRequest,
  { params }: {  params: Promise<{ id: string }>}
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/transaction/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error || "Failed to fetch transaction" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[ERROR] GET /api/transaction/[id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
