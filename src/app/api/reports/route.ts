import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = Number(searchParams.get("vendorId"));

    if (!vendorId) {
      return NextResponse.json({ error: "Invalid vendorId" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const evaluations = await prisma.evaluation.findMany({
      where: { vendorId },
      orderBy: { segment: "asc" }
    });

    // Compute simple average
    const total = evaluations.reduce((sum, e) => sum + e.score, 0);
    const max = evaluations.length * 10;
    const overall = evaluations.length ? (total / max) * 10 : 0;

    // SIMPLE PDF
    const doc = new PDFDocument({ margin: 40 });

    // Important: set Times-Roman FIRST to prevent Helvetica load
    doc.font("Times-Roman");

    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => {});

    // Title
    doc.fontSize(20).text("Vendor Performance Report\n\n");

    doc.fontSize(12);
    doc.text(`Vendor Name: ${vendor.name}`);
    doc.text(`Company: ${vendor.company || "-"}`);
    doc.text(`Email: ${vendor.email || "-"}`);
    doc.moveDown();

    doc.text("Evaluations:\n");

    evaluations.forEach((e) => {
      doc.text(`Segment: ${e.segment}`);
      doc.text(`Score: ${e.score}`);
      doc.text(`Comment: ${e.comment || "-"}`);
      doc.text(`Evaluator: eval ${e.evaluatorId}`);
      doc.moveDown();
    });

    doc.text(`Overall Weighted Score: ${overall.toFixed(2)} / 10`);

    doc.end();

    const pdf = Buffer.concat(chunks);

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=vendor_${vendor.id}_report.pdf`
      }
    });

  } catch (err) {
    console.error("PDF ERROR:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
