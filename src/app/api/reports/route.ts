import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
    }

    const vendorIdNum = Number(vendorId);

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorIdNum },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Load segments + questions
    const segments = await prisma.segment.findMany({
      include: { questions: true },
    });

    // Load evaluations
    const evaluations = await prisma.evaluation.findMany({
      where: { vendorId: vendorIdNum },
      include: { evaluator: true },
    });

    // Weighted score calculation
    let totalWeighted = 0;
    let totalSegmentWeights = 0;

    for (const seg of segments) {
      const qs = seg.questions;
      if (qs.length === 0) continue;

      let qWeightedSum = 0;
      let qWeightTotal = 0;

      for (const q of qs) {
        const ev = evaluations.find(e => e.segment === `Q-${q.id}`);
        const score = ev ? ev.score : 0;

        qWeightedSum += score * q.weight;
        qWeightTotal += q.weight;
      }

      const segmentScore = qWeightedSum / qWeightTotal;
      totalWeighted += segmentScore * seg.weight;
      totalSegmentWeights += seg.weight;
    }

    const finalScore =
      totalSegmentWeights === 0 ? 0 : totalWeighted / totalSegmentWeights;

    // ──────────────────────────────────────────────
    // Generate PDF into a buffer (NO STREAMS)
    // ──────────────────────────────────────────────

    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {});

    // PDF contents
    doc.fontSize(20).text("Vendor Performance Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Vendor Name: ${vendor.name}`);
    doc.text(`Company: ${vendor.company || "-"}`);
    doc.text(`Email: ${vendor.email || "-"}`);
    doc.moveDown(1.5);

    doc.fontSize(14).text("Evaluations:", { underline: true });
    doc.moveDown();

    doc.fontSize(12);
    doc.text("Question", 50, doc.y, { continued: true });
    doc.text("Score", 250, doc.y, { continued: true });
    doc.text("Comment", 310, doc.y, { continued: true });
    doc.text("Evaluator", 450, doc.y);
    doc.moveDown();

    for (const seg of segments) {
      for (const q of seg.questions) {
        const ev = evaluations.find(e => e.segment === `Q-${q.id}`);

        doc.text(q.text, 50, doc.y, { continued: true });
        doc.text(ev ? ev.score.toString() : "-", 250, doc.y, { continued: true });
        doc.text(ev ? ev.comment || "-" : "-", 310, doc.y, { continued: true });
        doc.text(
          ev ? `${ev.evaluator.name} (${ev.evaluator.role})` : "-",
          450, doc.y
        );

        doc.moveDown();
      }
    }

    doc.moveDown(2);

    doc.fontSize(14).text(
      `Overall Weighted Score: ${finalScore.toFixed(2)} / 10`,
      { align: "left" }
    );

    doc.end();

    // Final buffer
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Vendor_Report_${vendor.name}.pdf"`
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
