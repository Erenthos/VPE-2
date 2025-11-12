import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const { vendorId, evaluatorId, segment, score, comment } = await req.json();

    if (!vendorId || !evaluatorId || !segment)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const evaluation = await prisma.evaluation.upsert({
      where: { vendorId_segment_evaluatorId: { vendorId, segment, evaluatorId } },
      update: { score, comment },
      create: { vendorId, evaluatorId, segment, score, comment },
    });

    // 🔹 Recalculate weighted score
    const segments = await prisma.segment.findMany();
    const vendorEvals = await prisma.evaluation.findMany({ where: { vendorId } });

    if (segments.length > 0 && vendorEvals.length > 0) {
      let weightedSum = 0;
      let totalWeight = 0;

      for (const seg of segments) {
        const evalForSeg = vendorEvals.find((e) => e.segment === seg.name);
        if (evalForSeg) {
          weightedSum += evalForSeg.score * seg.weight;
          totalWeight += seg.weight;
        }
      }

      const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;

      await prisma.vendor.update({
        where: { id: vendorId },
        data: { overallScore: weightedAverage },
      });
    }

    return NextResponse.json({
      message: "Evaluation saved and weighted score updated",
      evaluation,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error saving evaluation" },
      { status: 500 }
    );
  }
}

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
