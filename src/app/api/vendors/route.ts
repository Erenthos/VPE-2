import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 📍 GET  – fetch all vendors
export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(vendors);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching vendors" }, { status: 500 });
  }
}

// 📍 POST – create new vendor
export async function POST(req: Request) {
  try {
    const { name, company, email } = await req.json();
    if (!name) return NextResponse.json({ error: "Vendor name required" }, { status: 400 });

    const vendor = await prisma.vendor.create({
      data: { name, company, email },
    });

    return NextResponse.json({ message: "Vendor added", vendor });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error adding vendor" }, { status: 500 });
  }
}

