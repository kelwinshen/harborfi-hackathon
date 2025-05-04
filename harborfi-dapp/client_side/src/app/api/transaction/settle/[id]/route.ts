import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function POST(
  req: NextRequest,
  { params }: {  params: Promise<{ id: string }>}
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/settle/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const contentType = response.headers.get("content-type");

    const data = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: typeof data === "string" ? data : data.error || "Failed to settle transaction" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[ERROR] POST /api/transaction/settle/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
