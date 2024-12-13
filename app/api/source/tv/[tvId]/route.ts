import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { tvId: string } }) {
  try {
    const tvId = parseInt(params.tvId);  // Extract tvId from params

    if (isNaN(tvId)) {
      return NextResponse.json({ error: "Invalid TV ID" }, { status: 400 });
    }

    // Fetch sources by tvId
    const sources = await prisma.form.findMany({
      where: { tvId },
      select: {
        id: true,
        name: true,
        source: true,
        panel: true,
        tvId: true,
        insideIndex: true,
      },
    });

    return NextResponse.json(sources, { status: 200 });
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
