import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = Number(searchParams.get("vendorId"));

    if (!vendorId) {
      return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const evaluations = await prisma.evaluation.findMany({
      where: { vendorId },
      orderBy: { segment: "asc" }
    });

    const total = evaluations.reduce((s, e) => s + e.score, 0);
    const max = evaluations.length * 10;
    const overallScore = evaluations.length ? (total / max) * 10 : 0;

    // -------------------------------------------------------------------
    // BEAUTIFUL MODERN HTML REPORT
    // -------------------------------------------------------------------
    const html = `
      <html>
      <head>
        <meta charset="UTF-8" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

        <style>
          body {
            font-family: 'Inter', sans-serif;
            padding: 40px;
            color: #1f2937;
          }

          /* HEADER */
          .header {
            background: linear-gradient(to right, #1e3a8a, #2563eb);
            color: white;
            padding: 25px;
            text-align: center;
            border-radius: 10px;
            margin-bottom: 35px;
          }
          .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 600;
          }

          /* VENDOR CARD */
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
          }

          .card p {
            margin: 6px 0;
            font-size: 14px;
          }
          .card strong {
            color: #111827;
          }

          /* TABLE */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 13px;
          }
          th {
            background: #1e3a8a;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 13px;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) td {
            background: #f1f5f9;
          }

          /* OVERALL SCORE */
          .score-box {
            margin-top: 30px;
            padding: 15px;
            background: #facc15;
            border-left: 6px solid #ca8a04;
            font-size: 18px;
            font-weight: 600;
            border-radius: 6px;
          }

          /* FOOTER */
          @page {
            margin: 40px;
          }
          footer {
            position: fixed;
            bottom: 10px;
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
              <td>eval ${e.evaluatorId}</td>
            </tr>
          `
            )
            .join("")}
        </table>

        <div class="score-box">
          Overall Score: ${overallScore.toFixed(2)} / 10
        </div>

        <footer>
          Page 1
        </footer>

      </body>
      </html>
    `;

    // Launch Chrome in serverless mode
    const executablePath = await chromium.executablePath;

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "a4",
      printBackground: true,
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
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
