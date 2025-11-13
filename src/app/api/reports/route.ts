import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function GET(req: Request) {
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

    const html = `
      <html>
      <body>
        <h1>Vendor Performance Report</h1>
        <p><strong>Name:</strong> ${vendor.name}</p>
        <p><strong>Company:</strong> ${vendor.company || "-"}</p>
        <p><strong>Email:</strong> ${vendor.email || "-"}</p>

        <table border="1" cellspacing="0" cellpadding="6" width="100%">
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
            </tr>
          `
            )
            .join("")}
        </table>

        <h3>Overall Score: ${overallScore.toFixed(2)} / 10</h3>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=vendor_report.pdf"
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
