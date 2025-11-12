"use client";

export default function VendorReportCard({ vendorId }: { vendorId: number }) {
  const downloadReport = async () => {
    const res = await fetch(`/api/reports?vendorId=${vendorId}`);
    if (!res.ok) {
      alert("Failed to generate report");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Vendor_Report_${vendorId}.pdf`;
    a.click();
    a.remove();
  };

  return (
    <button
      onClick={downloadReport}
      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-xs"
    >
      Download Report
    </button>
  );
}
