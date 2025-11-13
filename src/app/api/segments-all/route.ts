import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const segments = await prisma.segment.findMany({
    include: { questions: true }
  });

  return NextResponse.json(segments);
}
