import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Shared evaluations across all evaluators
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vendorId = Number(searchParams.get("vendorId"));

  if (!vendorId) return NextResponse.json([]);

  // Fetch latest evaluator's evaluations
  const evaluations = await prisma.evaluation.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" }
  });

  // Convert into a map: latest record per segment
  const latestMap: any = {};
  evaluations.forEach(ev => {
    latestMap[ev.segment] = ev;
  });

  return NextResponse.json(Object.values(latestMap));
}

// POST: Overwrite shared evaluation regardless of evaluator
export async function POST(req: Request) {
  const { vendorId, evaluatorId, segment, score, comment } = await req.json();

  // Use a fixed evaluatorId to maintain single-record logic
  const fixedEvaluatorId = 1; // << force shared evaluation

  const saved = await prisma.evaluation.upsert({
    where: {
      vendorId_segment_evaluatorId: {
        vendorId,
        segment,
        evaluatorId: fixedEvaluatorId
      }
    },
    update: { score, comment },
    create: {
      vendorId,
      segment,
      evaluatorId: fixedEvaluatorId,
      score,
      comment
    }
  });

  return NextResponse.json(saved);
}
