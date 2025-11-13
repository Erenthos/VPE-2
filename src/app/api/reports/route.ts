import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

// Utility: Convert PDF to Response
function streamToResponse(doc: PDFDocument, filename: string) {
  const stream = doc.pipe(Readable.from([]));

  const chunks: any[] = [];
  return new Promise((resolve) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);

      resolve(
        new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        })
      );
    });
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
    }

    const vendorIdNum = Number(vendorId);

    // Load vendor
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

    // ──────────────────────────────────────────────
    //  Weighted Score Calculation
    // ──────────────────────────────────────────────

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

    // ──────────────────────────────────────────────
    //  PDF GENERATION
    // ──────────────────────────────────────────────

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    doc.fontSize(20).text("Vendor Performance Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Vendor Name: ${vendor.name}`);
    doc.text(`Company: ${vendor.company || "-"}`);
    doc.text(`Email: ${vendor.email || "-"}`);
    doc.moveDown(1.5);

    doc.fontSize(14).text("Evaluations:", { underline: true });
    doc.moveDown();

    // Table Header
    doc.fontSize(12);
    doc.text("Question", 50, doc.y, { continued: true });
    doc.text("Score", 250, doc.y, { continued: true });
    doc.text("Comment", 310, doc.y, { continued: true });
    doc.text("Evaluator", 450, doc.y);
    doc.moveDown();

    // Evaluations per question
    for (const seg of segments) {
      const qs = seg.questions;

      for (const q of qs) {
        const ev = evaluations.find((e) => e.segment === `Q-${q.id}`);
        doc.text(q.text, 50, doc.y, { continued: true });

        doc.text(ev ? ev.score.toString() : "-", 250, doc.y, {
          continued: true,
        });

        doc.text(ev ? ev.comment || "-" : "-", 310, doc.y, { continued: true });

        doc.text(
          ev ? `${ev.evaluator.name} (${ev.evaluator.role})` : "-",
          450,
          doc.y
        );

        doc.moveDown();
      }
    }

    doc.moveDown(2);

    // Overall Weighted Score
    doc.fontSize(14).text(
      `Overall Weighted Score: ${finalScore.toFixed(2)} / 10`,
      { align: "left" }
    );

    doc.end();

    return await streamToResponse(doc, `Vendor_Report_${vendor.name}.pdf`);
  } catch (error) {
    console.error("Report Error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
