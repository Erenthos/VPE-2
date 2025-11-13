import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = Number(searchParams.get("vendorId"));

    if (!vendorId) {
      return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const evaluations = await prisma.evaluation.findMany({
      where: { vendorId },
      orderBy: { segment: "asc" },
    });

    // Calculate overall score
    const total = evaluations.reduce((sum, e) => sum + e.score, 0);
    const max = evaluations.length * 10;
    const overallScore = evaluations.length ? (total / max) * 10 : 0;

    // -------------------------------------------------------------
    // Modern, clean HTML PDF
    // -------------------------------------------------------------
    const html = `
      <html>
      <head>
        <meta charset="UTF-8" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', sans-serif;
            padding: 40px;
            color: #1f2937;
            background: #ffffff;
          }

          /* Header */
          .header {
            background: linear-gradient(to right, #1e40af, #3b82f6);
            color: white;
            text-align: center;
            padding: 25px 0;
            margin-bottom: 35px;
            border-radius: 12px;
          }
          .header h1 {
            font-size: 26px;
            margin: 0;
            font-weight: 600;
          }

          /* Vendor Card */
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .card p {
            font-size: 14px;
            margin: 6px 0;
          }
          .card strong {
            color: #111827;
          }

          /* Table */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 13px;
          }
          th {
            background: #1e40af;
            color: white;
            padding: 10px;
            text-align: left;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) td {
            background: #f1f5f9;
          }

          /* Score Box */
          .score-box {
            background: #facc15;
            border-left: 8px solid #ca8a04;
            padding: 15px;
            border-radius: 8px;
            margin-top: 25px;
            font-size: 18px;
            font-weight: 600;
          }

          /* Footer */
          footer {
            position: fixed;
            bottom: 15px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>

        <div class="header">
          <h1>Vendor Performance Report</h1>
        </div>

        <div class="card">
          <p><strong>Vendor Name:</strong> ${vendor.name}</p>
          <p><strong>Company:</strong> ${vendor.company || "-"}</p>
          <p><strong>Email:</strong> ${vendor.email || "-"}</p>
        </div>

        <h2>Evaluations</h2>

        <table>
          <tr>
            <th>Segment</th>
            <th>Score</th>
            <th>Comment</th>
            <th>Evaluator</th>
          </tr>

          ${evaluations
            .map(
              (e) => `
            <tr>
              <td>${e.segment}</td>
              <td>${e.score}</td>
              <td>${e.comment || "-"}</td>
              <td>Eval ${e.evaluatorId}</td>
            </tr>
          `
            )
            .join("")}
        </table>

        <div class="score-box">
          Overall Score: ${overallScore.toFixed(2)} / 10
        </div>

        <footer>Generated automatically by VPE-2</footer>
      </body>
      </html>
    `;

    // -------------------------------------------------------------
    // Puppeteer PDF Generation (Vercel Compatible)
    // -------------------------------------------------------------
    const browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm"
      }
    });

    await browser.close();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=vendor_${vendor.id}_report.pdf"
      }
    });

  } catch (err) {
    console.error("PDF ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
