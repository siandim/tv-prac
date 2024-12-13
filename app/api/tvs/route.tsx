import { NextRequest, NextResponse } from "next/server";
import schema from "./schema";
import prisma from "@/prisma/client";

export async function GET() {
  const tv = await prisma.tV.findMany();
  return NextResponse.json({"TV names": tv});
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = schema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const newSource = await prisma.tV.create({
    data: {
      name: body.name,
    },
  });
  return NextResponse.json(newSource, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "TV ID is required" }, { status: 400 });
    }

    await prisma.tV.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    return NextResponse.json({ message: "TV deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting TV:", error);
    return NextResponse.json({ error: "Failed to delete TV" }, { status: 500 });
  }
}
