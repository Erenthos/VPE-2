import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// 📍 GET — list all segments
export async function GET() {
  try {
    const segments = await prisma.segment.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(segments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching segments" }, { status: 500 });
  }
}

// 📍 POST — add new segment
export async function POST(req: Request) {
  try {
    const { name, weight } = await req.json();
    if (!name) return NextResponse.json({ error: "Segment name required" }, { status: 400 });

    const segment = await prisma.segment.create({
      data: { name, weight: weight ? Number(weight) : 10 },
    });

    return NextResponse.json({ message: "Segment added", segment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error adding segment" }, { status: 500 });
  }
}

// 📍 PUT — update existing segment weight
export async function PUT(req: Request) {
  try {
    const { id, weight } = await req.json();
    if (!id) return NextResponse.json({ error: "Segment ID required" }, { status: 400 });

    const updated = await prisma.segment.update({
      where: { id: Number(id) },
      data: { weight: Number(weight) },
    });

    return NextResponse.json({ message: "Segment updated", updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating segment" }, { status: 500 });
  }
}
