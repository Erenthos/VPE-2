import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const vendors = await prisma.vendor.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } }
      ]
    },
    orderBy: { name: "asc" },
    take: 50   // LIMIT results for safety
  });

  return NextResponse.json(vendors);
}

export async function POST(req: Request) {
  const { name, company, email } = await req.json();
  const newVendor = await prisma.vendor.create({
    data: { name, company, email }
  });

  return NextResponse.json(newVendor);
}
