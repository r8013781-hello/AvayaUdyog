import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { groupQuotationItems } from "./quotationGrouping";
import { loadImageAsDataUrl, drawPhoneIcon, drawMailIcon, drawGlobeIcon } from "./pdfLetterhead";

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

/* Matches the blank "Date :  /  /" slot printed on the real letterhead. */
function formatDateSlash(value) {
  if (!value) return "  /  /";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "  /  /";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d} / ${m} / ${date.getFullYear()}`;
}

function slug(text) {
  return (text || "").toString().trim().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "Untitled";
}

export function buildQuotationFilename(quotation) {
  return `AvayaUdyog-${slug(quotation.customerName)}-${slug(quotation.projectName)}-${slug(quotation.quotationNo)}-Quotation.pdf`;
}

/* Brand palette lifted straight from the printed letterhead (public/quotation-template.jpeg). */
const RED = [179, 33, 34];
const RED_TINT = [253, 238, 238];
const INK = [30, 30, 30];
const INK_MUTED = [95, 95, 95];
const LINE = [224, 224, 224];

const ADDRESS_LINE = "Kolkata, West Bengal, India";
const GSTIN = "GSTIN : 19ANBPA4084G1Z8";
const PHONE_1 = "+91 7980640714";
const PHONE_2 = "+91 9830478820";
const EMAIL = "info.avayaudyog@gmail.com";
const WEBSITE = "www.avayaudyog.com";

export async function generateQuotationPdf(quotation) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 74;
  let y = 0;

  const ensureSpace = (needed) => {
    if (y + needed > bottomLimit) {
      doc.addPage();
      y = 40;
    }
  };

  /* ---------- Header: logo lockup + business info block ---------- */
  const logo = await loadImageAsDataUrl("/pdf-logo-lockup.jpeg");
  if (logo) {
    const logoWidth = 240;
    const logoHeight = logoWidth / logo.aspect;
    doc.addImage(logo.dataUrl, "JPEG", margin, 22, logoWidth, logoHeight);
  }

  const dividerX = margin + 380;
  doc.setDrawColor(...RED);
  doc.setLineWidth(1.1);
  doc.line(dividerX, 18, dividerX, 68);

  const infoX = dividerX + 16;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(ADDRESS_LINE, infoX, 30);
  doc.text(GSTIN, infoX, 46);
  doc.text(`Date :   ${formatDateSlash(quotation.createdAt)}`, infoX, 62);

  /* Full-bleed red rule under the header, edge to edge like the letterhead. */
  doc.setDrawColor(...RED);
  doc.setLineWidth(1.6);
  doc.line(0, 82, pageWidth, 82);

  /* ---------- Ref. No. / Quotation No. line ---------- */
  y = 106;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(`Ref. No. : ${quotation.quotationNo || "—"}`, margin, y);
  doc.setTextColor(...INK_MUTED);
  doc.setFontSize(9);
  doc.text(`Valid until: ${quotation.validUntil ? formatDate(quotation.validUntil) : "—"}`, pageWidth - margin, y, { align: "right" });

  y += 30;

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
    doc.setFillColor(...RED);
    doc.rect(margin, y, contentWidth, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(group.name.toUpperCase(), margin + 10, y + 15);
    y += 22;

    group.subgroups.forEach((sub) => {
      if (sub.name) {
        ensureSpace(20);
        doc.setTextColor(...RED);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(sub.name.toUpperCase(), margin + 10, y + 13);
        y += 18;
      }

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin, bottom: 70 },
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
        headStyles: { fillColor: RED_TINT, textColor: INK, fontStyle: "bold", fontSize: 8 },
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

  /* ---------- Totals — same red-bordered box treatment as the receipt's amount field ---------- */
  const boxWidth = 220;
  ensureSpace(130);
  const boxX = pageWidth - margin - boxWidth;
  doc.setFillColor(...RED_TINT);
  doc.setDrawColor(...RED);
  doc.setLineWidth(1.2);
  doc.roundedRect(boxX, y, boxWidth, 108, 6, 6, "FD");

  const rowsLeft = [
    ["Subtotal", rupee(quotation.subtotal)],
    ["Discount", `- ${rupee(quotation.discount)}`],
    [`GST (${Number(quotation.taxRate || 0)}%)`, rupee(quotation.taxAmount)],
  ];
  let ty = y + 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  rowsLeft.forEach(([label, value]) => {
    doc.setTextColor(...INK_MUTED);
    doc.text(label, boxX + 14, ty);
    doc.setTextColor(...INK);
    doc.text(value, boxX + boxWidth - 14, ty, { align: "right" });
    ty += 18;
  });
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.8);
  doc.line(boxX + 14, ty, boxX + boxWidth - 14, ty);
  ty += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...RED);
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

  /* ---------- Footer on every page — red rule + phone/mail/globe icon row ---------- */
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...RED);
    doc.setLineWidth(1.6);
    doc.line(0, pageHeight - 46, pageWidth, pageHeight - 46);

    const fy = pageHeight - 26;
    let fx = margin;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);

    drawPhoneIcon(doc, fx, fy - 8, 9, RED);
    fx += 13;
    doc.text(PHONE_1, fx, fy);
    fx += doc.getTextWidth(PHONE_1) + 8;
    doc.setTextColor(...LINE);
    doc.text("|", fx, fy);
    fx += 10;
    doc.setTextColor(...INK);
    doc.text(PHONE_2, fx, fy);
    fx += doc.getTextWidth(PHONE_2) + 10;
    doc.setTextColor(...LINE);
    doc.text("|", fx, fy);
    fx += 10;

    drawMailIcon(doc, fx, fy - 8, 9, RED);
    fx += 13;
    doc.setTextColor(...INK);
    doc.text(EMAIL, fx, fy);
    fx += doc.getTextWidth(EMAIL) + 8;
    doc.setTextColor(...LINE);
    doc.text("|", fx, fy);
    fx += 10;

    drawGlobeIcon(doc, fx, fy - 8, 9, RED);
    fx += 13;
    doc.setTextColor(...INK);
    doc.text(WEBSITE, fx, fy);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...INK_MUTED);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, fy, { align: "right" });
  }

  return doc;
}
