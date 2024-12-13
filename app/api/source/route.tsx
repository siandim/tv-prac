//api/source/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { createSchema, updateSchema, partialUpdateSchema } from "./schema";
import prisma from "@/prisma/client";

export async function GET() {
  const form = await prisma.form.findMany();
  return NextResponse.json({ sources: form });
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the incoming data
    const data = await request.json();
    const parsedData = createSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.errors }, { status: 400 });
    }

    const { name, source, panel, tvId } = parsedData.data;

    // Determine the next insideIndex for the given tvId and panel
    const maxInsideIndex = await prisma.form.aggregate({
      _max: {
        insideIndex: true,
      },
      where: {
        tvId,
        panel,
      },
    });

    const newInsideIndex = (maxInsideIndex._max.insideIndex || 0) + 1;

    // Create the new Form entry
    const newForm = await prisma.form.create({
      data: {
        name,
        source,
        panel,
        tvId,
        insideIndex: newInsideIndex,
      },
    });

    return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const parsedData = updateSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.errors }, { status: 400 });
    }

    const { id, name, source, panel, tvId } = parsedData.data;

    // Update the form entry
    const updatedForm = await prisma.form.update({
      where: { id },
      data: { name, source, panel, tvId },
    });

    return NextResponse.json(updatedForm, { status: 200 });
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const parsedData = updateSchema.partial().safeParse(data); // Allow partial updates

    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.errors }, { status: 400 });
    }

    const { id, ...fieldsToUpdate } = parsedData.data;

    // Update only the fields provided in the request body
    const updatedEntry = await prisma.form.update({
      where: { id },
      data: fieldsToUpdate,
    });

    return NextResponse.json(updatedEntry, { status: 200 });
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Form ID not provided" }, { status: 400 });
    }

    // Delete the form entry
    await prisma.form.delete({ where: { id } });

    // Renumber remaining entries in the same panel and tvId
    const formToDelete = await prisma.form.findUnique({ where: { id } });

    if (formToDelete) {
      const { tvId, panel } = formToDelete;

      const remainingForms = await prisma.form.findMany({
        where: { tvId, panel },
        orderBy: { insideIndex: 'asc' },
      });

      for (let i = 0; i < remainingForms.length; i++) {
        await prisma.form.update({
          where: { id: remainingForms[i].id },
          data: { insideIndex: i + 1 },
        });
      }
    }

    return NextResponse.json({ message: "Form deleted and insideIndex updated" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
