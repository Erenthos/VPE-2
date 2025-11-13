import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json(
        { error: "vendorId is required" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: Number(vendorId) },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    const evaluations = await prisma.evaluation.findMany({
      where: { vendorId: Number(vendorId) },
      include: {
        evaluator: {
          select: { name: true, role: true },
        },
      },
      orderBy: { segment: "asc" },
    });

    // ---------- PDF GENERATION START ----------
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();     // ❗ let — allows reassignment
    const { width } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 12;

    let y = 780;

    // Title
    page.drawText("Vendor Performance Report", {
      x: 50,
      y,
      size: 20,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.6),
    });
    y -= 40;

    // Vendor Info
    page.drawText(`Vendor Name: ${vendor.name}`, {
      x: 50,
      y,
      size: fontSize,
      font,
    });
    y -= 20;

    page.drawText(`Company: ${vendor.company || "-"}`, {
      x: 50,
      y,
      size: fontSize,
      font,
    });
    y -= 20;

    page.drawText(`Email: ${vendor.email || "-"}`, {
      x: 50,
      y,
      size: fontSize,
      font,
    });
    y -= 30;

    page.drawText("Evaluations:", {
      x: 50,
      y,
      size: fontSize + 2,
      font: fontBold,
    });
    y -= 20;

    // Table Header
    const headers = ["Segment", "Score", "Comment", "Evaluator"];
    const colWidths = [120, 50, 200, 120];
    let x = 50;

    headers.forEach((header, i) => {
      page.drawText(header, {
        x,
        y,
        size: fontSize,
        font: fontBold,
      });
      x += colWidths[i];
    });

    y -= 20;

    // Table Rows
    for (const e of evaluations) {
      x = 50;

      const row = [
        e.segment,
        String(e.score),
        e.comment || "-",
        `${e.evaluator.name} (${e.evaluator.role})`,
      ];

      row.forEach((cell, i) => {
        page.drawText(cell, {
          x,
          y,
          size: fontSize,
          font,
        });
        x += colWidths[i];
      });

      y -= 20;

      // Add new page if needed
      if (y < 50) {
        page = pdfDoc.addPage();   // ← Now works because page is LET
        y = 780;
      }
    }

    y -= 30;

    // Weighted Final Score
    page.drawText(
      `Overall Weighted Score: ${(vendor.overallScore || 0).toFixed(2)} / 10`,
      {
        x: 50,
        y,
        size: fontSize + 2,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.4),
      }
    );

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${vendor.name}_Report.pdf"`,
      },
    });

    // ---------- PDF GENERATION END ----------

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
