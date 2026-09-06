import jsPDF from "jspdf";

/* Same visual language as generateQuotationPdf.js — sage header band, gold
   accents, footer on every page. A money receipt is a one-page document, so
   there is no pagination logic to speak of. */

function rupee(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function slug(text) {
  return (text || "").toString().trim().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "Untitled";
}

export function buildReceiptFilename(receipt) {
  return `AvayaUdyog-${slug(receipt.customerName)}-${slug(receipt.receiptNo)}-Receipt.pdf`;
}

const SAGE_DARK = [20, 39, 27];
const SAGE = [66, 125, 84];
const INK = [21, 34, 25];
const INK_MUTED = [107, 127, 114];
const GOLD = [163, 128, 63];
const LINE = [214, 227, 217];

export function generateReceiptPdf(receipt) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;

  /* ---------- Header band ---------- */
  doc.setFillColor(...SAGE_DARK);
  doc.rect(0, 0, pageWidth, 92, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("Avaya Udyog", margin, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(210, 224, 214);
  doc.text("INTERIOR DESIGN", margin, 52);
  doc.text("info.avayaudyog@gmail.com   ·   +91 79806 40714   ·   Kolkata, West Bengal", margin, 72);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("MONEY RECEIPT", pageWidth - margin, 36, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(receipt.receiptNo || "—", pageWidth - margin, 52, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(210, 224, 214);
  doc.text(`Date: ${formatDate(receipt.receivedOn)}`, pageWidth - margin, 66, { align: "right" });

  let y = 128;

  /* ---------- Cancelled watermark ---------- */
  if (receipt.status === "Cancelled") {
    doc.setTextColor(200, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(48);
    doc.text("CANCELLED", pageWidth / 2, pageHeight / 2, { align: "center", angle: 24 });
  }

  /* ---------- Received from ---------- */
  doc.setTextColor(...INK_MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("RECEIVED WITH THANKS FROM", margin, y);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(receipt.customerName || "—", margin, y + 18);
  if (receipt.projectName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK_MUTED);
    doc.text(`Project: ${receipt.projectName}`, margin, y + 33);
    y += 12;
  }

  y += 52;

  /* ---------- Amount box ---------- */
  doc.setFillColor(...SAGE_DARK);
  doc.roundedRect(margin, y, contentWidth, 62, 6, 6, "F");
  doc.setTextColor(200, 216, 204);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("AMOUNT RECEIVED", margin + 16, y + 22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(rupee(receipt.amount), margin + 16, y + 46);

  y += 82;

  /* ---------- Amount in words ---------- */
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("AMOUNT IN WORDS", margin, y);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const wordLines = doc.splitTextToSize(receipt.amountInWords || "—", contentWidth);
  doc.text(wordLines, margin, y + 15);
  y += 15 + wordLines.length * 13 + 14;

  /* ---------- Payment detail rows ---------- */
  const rows = [
    ["Payment mode", receipt.paymentMode || "—"],
    ["Reference no.", receipt.referenceNo || "—"],
    ["Towards", receipt.towards || "—"],
    ["Received on", formatDate(receipt.receivedOn)],
  ];
  doc.setFontSize(9.5);
  rows.forEach(([label, value]) => {
    doc.setDrawColor(...LINE);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
    doc.setTextColor(...INK_MUTED);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), margin, y);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "normal");
    const valLines = doc.splitTextToSize(String(value), contentWidth - 150);
    doc.text(valLines, margin + 150, y);
    y += Math.max(6, (valLines.length - 1) * 12) + 10;
  });
  doc.setDrawColor(...LINE);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  /* ---------- Notes ---------- */
  if (receipt.notes) {
    doc.setTextColor(...INK_MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("NOTES", margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.splitTextToSize(receipt.notes, contentWidth).forEach((line) => {
      doc.text(line, margin, y);
      y += 13;
    });
    y += 12;
  }

  /* ---------- Signature ---------- */
  const sigY = Math.max(y + 40, pageHeight - 130);
  doc.setDrawColor(...INK_MUTED);
  doc.line(pageWidth - margin - 160, sigY, pageWidth - margin, sigY);
  doc.setTextColor(...INK_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("For Avaya Udyog · Authorised signatory", pageWidth - margin, sigY + 14, { align: "right" });
  if (receipt.createdBy) {
    doc.text(`Issued by ${receipt.createdBy}`, margin, sigY + 14);
  }

  /* ---------- Footer ---------- */
  doc.setDrawColor(...LINE);
  doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_MUTED);
  doc.text(
    "Avaya Udyog · Interior Design · This receipt acknowledges the sum stated above as received.",
    margin,
    pageHeight - 26,
  );

  return doc;
}
