import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const segmentId = searchParams.get("segmentId");

  const questions = await prisma.question.findMany({
    where: segmentId ? { segmentId: Number(segmentId) } : {},
    orderBy: { id: "asc" }
  });

  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  try {
    const { segmentId, text, weight } = await req.json();

    const q = await prisma.question.create({
      data: { segmentId, text, weight }
    });

    return NextResponse.json(q);
  } catch (e) {
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, text, weight } = await req.json();

    const q = await prisma.question.update({
      where: { id },
      data: { text, weight }
    });

    return NextResponse.json(q);
  } catch (e) {
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
