import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import html_to_pdf from "html-pdf-node";

function generateHTML(vendor: any, evaluations: any[], totalScore: number) {
  const rows = evaluations
    .map(
      (e) => `
        <tr>
          <td>${e.segment}</td>
          <td>${e.score}</td>
          <td>${e.comment || "-"}</td>
          <td>${e.evaluator.name} (${e.evaluator.role})</td>
        </tr>`
    )
    .join("");

  return `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        h1 { text-align: center; color: #4f46e5; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #eef2ff; }
        .total { margin-top: 30px; font-size: 18px; font-weight: bold; text-align: right; color: #111827; }
      </style>
    </head>
    <body>
      <h1>Vendor Performance Report</h1>
      <h3>Vendor: ${vendor.name}</h3>
      <p>Company: ${vendor.company || "-"}<br>Email: ${vendor.email || "-"}</p>
      <table>
        <thead>
          <tr><th>Segment</th><th>Score</th><th>Comments</th><th>Evaluator</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="total">Overall Weighted Score: ${totalScore.toFixed(2)} / 10</p>
    </body>
  </html>`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    if (!vendorId)
      return NextResponse.json({ error: "vendorId required" }, { status: 400 });

    const vendor = await prisma.vendor.findUnique({
      where: { id: Number(vendorId) },
    });
    if (!vendor)
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const evaluations = await prisma.evaluation.findMany({
      where: { vendorId: Number(vendorId) },
      include: { evaluator: { select: { name: true, role: true } } },
    });

    const html = generateHTML(vendor, evaluations, vendor.overallScore || 0);
    const pdfBuffer = await html_to_pdf.generatePdf({ content: html }, { format: "A4" });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${vendor.name}_Report.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error generating report" }, { status: 500 });
  }
}
