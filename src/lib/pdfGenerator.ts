import html_to_pdf from "html-pdf-node";

export async function generatePDF(html: string, filename: string) {
  const file = { content: html };
  const pdfBuffer = await html_to_pdf.generatePdf(file, { format: "A4" });
  return pdfBuffer;
}

