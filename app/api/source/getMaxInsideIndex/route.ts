// Use dynamic API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tvId = parseInt(searchParams.get("tvId") || "0");
    const panel = parseInt(searchParams.get("panel") || "0");

    if (isNaN(tvId) || isNaN(panel)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const result = await prisma.form.aggregate({
      _max: {
        insideIndex: true,
      },
      where: {
        tvId,
        panel,
      },
    });

    return NextResponse.json({
      maxInsideIndex: result._max.insideIndex || 0,
    });
  } catch (error) {
    console.error("Error fetching max insideIndex:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
