import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json(
        { error: "Missing vendorId" },
        { status: 400 }
      );
    }

    const vendorIdNum = Number(vendorId);

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorIdNum },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    const segments = await prisma.segment.findMany({
      include: { questions: true },
    });

    const evaluations = await prisma.evaluation.findMany({
      where: { vendorId: vendorIdNum },
      include: { evaluator: true },
    });

    // Weighted scoring
    let totalWeighted = 0;
    let totalSegmentWeights = 0;

    for (const seg of segments) {
      const qs = seg.questions;
      if (qs.length === 0) continue;

      let qWeightedSum = 0;
      let qWeightTotal = 0;

      for (const q of qs) {
        const ev = evaluations.find((e) => e.segment === `Q-${q.id}`);
        const score = ev ? ev.score : 0;

        qWeightedSum += score * q.weight;
        qWeightTotal += q.weight;
      }

      const segmentScore = qWeightedSum / qWeightTotal;
      totalWeighted += segmentScore * seg.weight;
      totalSegmentWeights += seg.weight;
    }

    const finalScore =
      totalSegmentWeights === 0
        ? 0
        : totalWeighted / totalSegmentWeights;

    // Create PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage();
    const { width, height } = page.getSize();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    let y = height - 50;
    const lineHeight = 18;

    function write(text: string, size = 12) {
      page.drawText(text, {
        x: 50,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }

    // Header
    write("Vendor Performance Report", 20);
    y -= 10;

    // Vendor info
    write(`Vendor Name: ${vendor.name}`);
    write(`Company: ${vendor.company || "-"}`);
    write(`Email: ${vendor.email || "-"}`);
    y -= 10;

    write("Evaluations:", 16);
    y -= 10;

    // Table header
    write("Question                    Score    Comment                 Evaluator", 12);

    // Rows
    for (const seg of segments) {
      for (const q of seg.questions) {
        const ev = evaluations.find((e) => e.segment === `Q-${q.id}`);

        write(
          `${q.text.substring(0, 25).padEnd(28)}  ${
            ev ? ev.score : "-"
          }        ${(ev ? ev.comment || "-" : "-").substring(0, 20).padEnd(
            22
          )} ${ev ? ev.evaluator.name : "-"}`
        );
      }
    }

    y -= 20;

    write(`Overall Weighted Score: ${finalScore.toFixed(2)} / 10`, 14);

    // Output PDF
    const pdfBytes = await pdf.save();

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Vendor_Report_${vendor.name}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF Report Error:", err);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
