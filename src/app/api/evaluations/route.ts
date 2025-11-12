import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// 📍 POST – save evaluation (score + comment)
export async function POST(req: Request) {
  try {
    const { vendorId, evaluatorId, segment, score, comment } = await req.json();

    if (!vendorId || !evaluatorId || !segment)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const evaluation = await prisma.evaluation.upsert({
      where: {
        // ensure one evaluator per segment per vendor
        vendorId_segment_evaluatorId: {
          vendorId,
          segment,
          evaluatorId,
        },
      },
      update: { score, comment },
      create: { vendorId, evaluatorId, segment, score, comment },
    });

    return NextResponse.json({ message: "Evaluation saved", evaluation });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error saving evaluation" }, { status: 500 });
  }
}

// 📍 GET – get evaluations for a vendor
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    if (!vendorId)
      return NextResponse.json({ error: "vendorId required" }, { status: 400 });

    const evaluations = await prisma.evaluation.findMany({
      where: { vendorId: Number(vendorId) },
      include: { evaluator: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching evaluations" }, { status: 500 });
  }
}

