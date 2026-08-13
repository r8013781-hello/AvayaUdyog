import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { groupQuotationItems } from "./quotationGrouping";

/* jsPDF's core fonts don't ship the ₹ glyph, so amounts are rendered with a
   plain "Rs." prefix rather than the rupee symbol turning into a tofu box. */
function rupee(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
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

export function buildQuotationFilename(quotation) {
  return `AvayaUdyog-${slug(quotation.customerName)}-${slug(quotation.projectName)}-${slug(quotation.quotationNo)}-Quotation.pdf`;
}

const SAGE_DARK = [20, 39, 27];
const SAGE = [66, 125, 84];
const SAGE_TINT = [244, 250, 245];
const INK = [21, 34, 25];
const INK_MUTED = [107, 127, 114];
const GOLD = [163, 128, 63];
const LINE = [214, 227, 217];

export function generateQuotationPdf(quotation) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 56;
  let y = 0;

  const ensureSpace = (needed) => {
    if (y + needed > bottomLimit) {
      doc.addPage();
      y = 40;
    }
  };

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
  doc.setFontSize(8.5);
  doc.text("info.avayaudyog@gmail.com   ·   +91 98304 78820   ·   Kolkata, West Bengal", margin, 72);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("QUOTATION", pageWidth - margin, 36, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(quotation.quotationNo || "—", pageWidth - margin, 52, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(210, 224, 214);
  doc.text(`Date: ${formatDate(quotation.createdAt)}`, pageWidth - margin, 66, { align: "right" });
  doc.text(`Valid until: ${quotation.validUntil ? formatDate(quotation.validUntil) : "—"}`, pageWidth - margin, 78, { align: "right" });

  y = 120;

  /* ---------- Bill to / Project ---------- */
  doc.setTextColor(...INK_MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BILL TO", margin, y);
  doc.text("PROJECT", margin + contentWidth / 2, y);

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(quotation.customerName || "—", margin, y + 16);
  doc.text(quotation.projectName || "—", margin + contentWidth / 2, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK_MUTED);
  const addressLines = quotation.projectAddress ? doc.splitTextToSize(quotation.projectAddress, contentWidth / 2 - 16) : ["—"];
  doc.text(addressLines, margin + contentWidth / 2, y + 30);

  y += 66;

  /* ---------- Line items, grouped by room / category ---------- */
  const groups = groupQuotationItems(quotation.items || []);

  groups.forEach((group) => {
    ensureSpace(30);
    doc.setFillColor(...SAGE);
    doc.rect(margin, y, contentWidth, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(group.name.toUpperCase(), margin + 10, y + 15);
    y += 22;

    group.subgroups.forEach((sub) => {
      if (sub.name) {
        ensureSpace(20);
        doc.setTextColor(...GOLD);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(sub.name.toUpperCase(), margin + 10, y + 13);
        y += 18;
      }

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin, bottom: 56 },
        head: [["Item", "Qty", "Unit", "Rate", "Amount"]],
        body: sub.items.map((item) => [
          item.itemName,
          String(item.quantity),
          item.unit,
          rupee(item.unitPrice),
          rupee(item.lineTotal ?? item.quantity * item.unitPrice),
        ]),
        theme: "grid",
        styles: { font: "helvetica", fontSize: 8.5, textColor: INK, lineColor: LINE, lineWidth: 0.5, cellPadding: 5 },
        headStyles: { fillColor: SAGE_TINT, textColor: INK, fontStyle: "bold", fontSize: 8 },
        columnStyles: {
          0: { cellWidth: contentWidth - 40 - 60 - 75 - 85 },
          1: { cellWidth: 40, halign: "right" },
          2: { cellWidth: 60 },
          3: { cellWidth: 75, halign: "right" },
          4: { cellWidth: 85, halign: "right" },
        },
      });
      y = doc.lastAutoTable.finalY + 12;
    });
  });

  /* ---------- Totals ---------- */
  const boxWidth = 220;
  ensureSpace(120);
  const boxX = pageWidth - margin - boxWidth;
  doc.setFillColor(...SAGE_DARK);
  doc.roundedRect(boxX, y, boxWidth, 108, 6, 6, "F");

  const rowsLeft = [
    ["Subtotal", rupee(quotation.subtotal)],
    ["Discount", `- ${rupee(quotation.discount)}`],
    [`GST (${Number(quotation.taxRate || 0)}%)`, rupee(quotation.taxAmount)],
  ];
  let ty = y + 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  rowsLeft.forEach(([label, value]) => {
    doc.setTextColor(200, 216, 204);
    doc.text(label, boxX + 14, ty);
    doc.setTextColor(255, 255, 255);
    doc.text(value, boxX + boxWidth - 14, ty, { align: "right" });
    ty += 18;
  });
  doc.setDrawColor(80, 105, 88);
  doc.line(boxX + 14, ty, boxX + boxWidth - 14, ty);
  ty += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("Total", boxX + 14, ty);
  doc.text(rupee(quotation.grandTotal), boxX + boxWidth - 14, ty, { align: "right" });

  y += 122;

  /* ---------- Terms / notes ---------- */
  if (quotation.notes) {
    ensureSpace(60);
    doc.setTextColor(...INK_MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("MATERIALS & TERMS", margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    const noteLines = doc.splitTextToSize(quotation.notes, contentWidth);
    noteLines.forEach((line) => {
      ensureSpace(13);
      doc.text(line, margin, y);
      y += 13;
    });
  }

  /* ---------- Footer on every page ---------- */
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...LINE);
    doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...INK_MUTED);
    doc.text("Avaya Udyog · Interior Design · This quotation is an estimate and subject to site verification.", margin, pageHeight - 26);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 26, { align: "right" });
  }

  return doc;
}
