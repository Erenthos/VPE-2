import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = Number(searchParams.get("vendorId"));

    if (!vendorId) return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    const evaluations = await prisma.evaluation.findMany({ where: { vendorId } });

    const total = evaluations.reduce((s, e) => s + e.score, 0);
    const max = evaluations.length * 10;
    const overall = evaluations.length ? (total / max) * 10 : 0;

    const html = `<html> ... your styled HTML ... </html>`;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "a4",
      printBackground: true
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
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
