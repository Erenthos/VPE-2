import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — fetch existing evaluations for vendor + evaluator
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vendorId = Number(searchParams.get("vendorId"));
  const evaluatorId = Number(searchParams.get("evaluatorId"));

  if (!vendorId || !evaluatorId) {
    return NextResponse.json([], { status: 200 });
  }

  const evaluations = await prisma.evaluation.findMany({
    where: {
      vendorId,
      evaluatorId
    }
  });

  return NextResponse.json(evaluations);
}

// POST — create or update evaluation
export async function POST(req: Request) {
  const data = await req.json();

  const { vendorId, evaluatorId, segment, score, comment } = data;

  // Upsert: create if not exist, update if exist
  const saved = await prisma.evaluation.upsert({
    where: {
      vendorId_segment_evaluatorId: {
        vendorId,
        segment,
        evaluatorId
      }
    },
    update: {
      score,
      comment
    },
    create: {
      vendorId,
      evaluatorId,
      segment,
      score,
      comment
    }
  });

  return NextResponse.json(saved);
}
