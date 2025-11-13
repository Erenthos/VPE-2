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

    const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
    const maxScore = evaluations.length * 10;
    const weightedScore = evaluations.length ? (totalScore / maxScore) * 10 : 0;

    /* IMPORTANT FIX:
       Create doc, then IMMEDIATELY set a safe font
    */
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {});

    // FIX: set font BEFORE writing anything
    doc.font("Times-Roman");

    /* HEADER */
    doc.rect(0, 0, doc.page.width, 80).fill("#3B82F6");

    doc.fillColor("#FFFFFF")
      .font("Times-Bold") // safe font
      .fontSize(24)
      .text("Vendor Performance Report", 40, 25);

    doc.moveDown(2);

    /* VENDOR DETAILS */
    doc.fillColor("#000000")
      .font("Times-Roman")
      .fontSize(14);

    doc.text(`Vendor Name: `, { continued: true })
      .font("Times-Bold").text(vendor.name);

    doc.font("Times-Roman").text(`Company: `, { continued: true })
      .font("Times-Bold").text(vendor.company || "-");

    doc.font("Times-Roman").text(`Email: `, { continued: true })
      .font("Times-Bold").text(vendor.email || "-");

    doc.moveDown(1.5);

    /* TABLE HEADER */
    const tableTop = doc.y + 10;

    doc.rect(40, tableTop, doc.page.width - 80, 30)
      .fill("#1E293B");

    doc.fillColor("#FFFFFF")
      .font("Times-Bold")
      .fontSize(12)
      .text("Question", 50, tableTop + 8)
      .text("Score", 260, tableTop + 8)
      .text("Comment", 330, tableTop + 8)
      .text("Evaluator", 500, tableTop + 8);

    /* TABLE ROWS */
    let y = tableTop + 30;

    evaluations.forEach((ev, i) => {
      const bg = i % 2 === 0 ? "#F1F5F9" : "#E2E8F0";

      doc.rect(40, y, doc.page.width - 80, 26).fill(bg);

      doc.fillColor("#000000")
        .font("Times-Roman")
        .fontSize(11);

      doc.text(ev.segment, 50, y + 6);
      doc.text(ev.score.toString(), 260, y + 6);
      doc.text(ev.comment || "-", 330, y + 6);
      doc.text(`eval ${ev.evaluatorId}`, 500, y + 6);

      y += 26;

      if (y > 740) {
        doc.addPage();
        doc.font("Times-Roman"); // reset font after page break
        y = 40;
      }
    });

    /* SCORE BOX */
    doc.rect(40, y + 20, doc.page.width - 80, 70)
      .fill("#FACC15");

    doc.fillColor("#000000")
      .font("Times-Bold")
      .fontSize(20)
      .text("Overall Score:", 60, y + 40);

    doc.font("Times-Bold")
      .fontSize(18)
      .text(`${weightedScore.toFixed(2)} / 10`, 260, y + 42);

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
