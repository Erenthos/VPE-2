import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chromium } from "playwright-core";

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

    // Calculate score
    const total = evaluations.reduce((s, e) => s + e.score, 0);
    const max = evaluations.length * 10;
    const overallScore = evaluations.length ? (total / max) * 10 : 0;

    // HTML
    const html = `
      <html>
      <head>
      <style>
        body { font-family: sans-serif; padding: 40px; }
        .header {
          background: #1e40af; color: white; padding: 20px; text-align: center;
          border-radius: 8px; margin-bottom: 25px;
        }
        table {
          width: 100%; border-collapse: collapse; margin-top: 20px;
        }
        th {
          background: #1e40af; color: white; padding: 10px; text-align: left;
        }
        td {
          padding: 8px; border-bottom: 1px solid #ccc;
        }
      </style>
      </head>
      <body>
        <div class="header"><h1>Vendor Performance Report</h1></div>

        <p><strong>Name:</strong> ${vendor.name}</p>
        <p><strong>Company:</strong> ${vendor.company || "-"}</p>
        <p><strong>Email:</strong> ${vendor.email || "-"}</p>

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
              <td>${e.evaluatorId}</td>
            </tr>`
            )
            .join("")}
        </table>

        <h3 style="margin-top: 30px;">
          Overall Score: ${overallScore.toFixed(2)} / 10
        </h3>
      </body>
      </html>
    `;

    // Launch Playwright Browser
    const browser = await chromium.launch({
      args: ["--no-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=vendor_report.pdf",
      },
    });
  } catch (err) {
    console.error("PDF ERROR:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
