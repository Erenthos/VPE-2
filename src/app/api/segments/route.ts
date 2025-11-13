import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const segments = await prisma.segment.findMany({
    orderBy: { id: "asc" }
  });
  return NextResponse.json(segments);
}

export async function POST(req: Request) {
  try {
    const { name, weight } = await req.json();

    const segment = await prisma.segment.create({
      data: { name, weight: Number(weight) }
    });

    return NextResponse.json(segment);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create segment" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, weight } = await req.json();

    const segment = await prisma.segment.update({
      where: { id: Number(id) },
      data: { name, weight: Number(weight) },
    });

    return NextResponse.json(segment);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update segment" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await prisma.segment.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete segment" }, { status: 500 });
  }
}
