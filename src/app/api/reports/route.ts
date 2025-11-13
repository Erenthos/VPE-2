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
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const evaluations = await prisma.evaluation.findMany({
      where: { vendorId },
      orderBy: { segment: "asc" }
    });

    // Compute overall score — simple average
    const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
    const maxScore = evaluations.length * 10;
    const weightedScore = evaluations.length ? (totalScore / maxScore) * 10 : 0;

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {});

    /* =======================
       HEADER SECTION
    ======================== */
    doc.rect(0, 0, doc.page.width, 90)
      .fill("#3B82F6"); // Blue header

    doc.fillColor("#FFFFFF")
      .fontSize(24)
      .text("Vendor Performance Report", 40, 30);

    doc.moveDown(2);

    /* =======================
       VENDOR DETAILS CARD
    ======================== */
    doc.fillColor("#000000")
      .fontSize(14)
      .text(`Vendor Name: `, { continued: true })
      .font("Helvetica-Bold")
      .text(vendor.name);

    doc.font("Helvetica")
      .text(`Company: `, { continued: true })
      .font("Helvetica-Bold")
      .text(vendor.company || "-");

    doc.font("Helvetica")
      .text(`Email: `, { continued: true })
      .font("Helvetica-Bold")
      .text(vendor.email || "-");

    doc.moveDown(1.5);

    /* =======================
       TABLE HEADER
    ======================== */
    const tableTop = doc.y + 10;

    doc.rect(40, tableTop, doc.page.width - 80, 30)
      .fill("#1E293B"); // Slate header

    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(12);
    doc.text("Question", 50, tableTop + 8);
    doc.text("Score", 260, tableTop + 8);
    doc.text("Comment", 330, tableTop + 8);
    doc.text("Evaluator", 500, tableTop + 8);

    /* =======================
       TABLE ROWS
    ======================== */
    let y = tableTop + 30;

    evaluations.forEach((ev, i) => {
      const bgColor = i % 2 === 0 ? "#F1F5F9" : "#E2E8F0";

      // Row background
      doc.rect(40, y, doc.page.width - 80, 28)
        .fill(bgColor);

      doc.fillColor("#000000")
        .font("Helvetica")
        .fontSize(11);

      doc.text(ev.segment, 50, y + 8);
      doc.text(ev.score.toString(), 260, y + 8);
      doc.text(ev.comment || "-", 330, y + 8);
      doc.text(`eval ${ev.evaluatorId}`, 500, y + 8);

      y += 28;

      if (y > 750) {
        doc.addPage();
        y = 40;
      }
    });

    doc.moveDown(2);

    /* =======================
       OVERALL SCORE BOX
    ======================== */
    doc.rect(40, y + 20, doc.page.width - 80, 80)
      .fill("#FACC15"); // Yellow box

    doc.fillColor("#000000")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("Overall Score", 60, y + 35);

    doc.font("Helvetica")
      .fontSize(16)
      .text(`${weightedScore.toFixed(2)} / 10`, 300, y + 38);

    doc.end();

    const pdfBuffer = Buffer.concat(chunks);
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=vendor_${vendor.id}_report.pdf`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
