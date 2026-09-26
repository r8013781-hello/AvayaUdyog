import { jsPDF } from "jspdf";
import { loadImageAsDataUrl, drawPhoneIcon, drawMailIcon, drawGlobeIcon, drawRupeeGlyph } from "./pdfLetterhead";

/* Rebuilt to match the real printed money receipt pad this business uses —
   see public/money-reciept-template.jpeg. That form is a landscape card at a
   3:2 ratio (1536x1024px), not A4, so the PDF page matches that ratio
   (612x408pt) rather than the portrait A4 used for quotations. */

function rupee(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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

export function buildReceiptFilename(receipt) {
  return `AvayaUdyog-${slug(receipt.customerName)}-${slug(receipt.receiptNo)}-Receipt.pdf`;
}

const RED = [179, 33, 34];
const RED_TINT = [253, 238, 238];
const INK = [30, 30, 30];
const INK_MUTED = [95, 95, 95];
const LINE = [190, 190, 190];
const BOX_FILL = [246, 246, 246];
const BOX_LINE = [220, 220, 220];

const ADDRESS_LINE = "Kolkata, West Bengal, India";
const GSTIN = "GSTIN : 19ANBPA4084G1Z8";
const PHONE_1 = "+91 7980640714";
const PHONE_2 = "+91 9830478820";
const EMAIL = "info.avayaudyog@gmail.com";
const WEBSITE = "www.avayaudyog.com";

/* The printed pad's checkbox row (Cash / UPI / Cheque / NEFT-RTGS / Other)
   predates — and doesn't 1:1 match — the CRM's payment mode list (which also
   has "Bank Transfer" and "Card"). Map each stored value onto the closest
   printed box rather than adding boxes the real form doesn't have. */
const PAYMENT_BOXES = ["Cash", "UPI", "Cheque", "NEFT / RTGS", "Other"];
function paymentBoxIndex(mode) {
  switch (mode) {
    case "Cash":
      return 0;
    case "UPI":
      return 1;
    case "Cheque":
      return 2;
    case "Bank Transfer":
      return 3;
    case "Card":
    case "Other":
      return 4;
    default:
      return -1;
  }
}

/* Label, colon, and the value sitting on a ruled line — the "____" fields
   filled by hand on the physical pad. */
function inlineField(doc, { label, value, x, y, labelWidth, lineEnd }) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(label, x, y);
  doc.text(":", x + labelWidth, y);
  const valueX = x + labelWidth + 14;
  if (value) {
    doc.setFont("helvetica", "bold");
    doc.text(String(value), valueX, y - 2);
  }
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.6);
  doc.line(valueX - 6, y + 4, lineEnd, y + 4);
}

export async function generateReceiptPdf(receipt) {
  const doc = new jsPDF({ unit: "pt", format: [612, 408], orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 24;
  const rightEdge = pageWidth - margin;

  /* ---------- Header: logo lockup + business info block ---------- */
  const logo = await loadImageAsDataUrl("/pdf-logo-lockup.jpeg");
  if (logo) {
    const logoWidth = 190;
    const logoHeight = logoWidth / logo.aspect;
    doc.addImage(logo.dataUrl, "JPEG", margin, 12, logoWidth, logoHeight);
  }

  const dividerX = margin + 358;
  doc.setDrawColor(...RED);
  doc.setLineWidth(1);
  doc.line(dividerX, 10, dividerX, 52);

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(ADDRESS_LINE, dividerX + 14, 24);
  doc.text(GSTIN, dividerX + 14, 38);

  doc.setDrawColor(...RED);
  doc.setLineWidth(1.6);
  doc.line(0, 58, pageWidth, 58);

  /* ---------- Title ---------- */
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  const title = "MONEY  RECEIPT";
  doc.text(title, pageWidth / 2, 84, { align: "center" });
  const titleWidth = doc.getTextWidth(title);
  doc.setDrawColor(...RED);
  doc.setLineWidth(1.6);
  doc.line(pageWidth / 2 - titleWidth / 8, 91, pageWidth / 2 + titleWidth / 8, 91);

  if (receipt.status === "Cancelled") {
    doc.setTextColor(200, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(46);
    doc.text("CANCELLED", pageWidth / 2, pageHeight / 2, { align: "center", angle: 22 });
  }

  /* ---------- Receipt No. / Date ---------- */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(`Receipt No. : ${receipt.receiptNo || "—"}`, margin, 112);
  doc.text(`Date :   ${formatDateSlash(receipt.receivedOn)}`, rightEdge, 112, { align: "right" });

  /* ---------- Received from / Amount ---------- */
  inlineField(doc, {
    label: "Received with thanks from",
    value: receipt.customerName,
    x: margin,
    y: 146,
    labelWidth: 150,
    lineEnd: rightEdge,
  });
  inlineField(doc, {
    label: "A sum of Rupees",
    value: rupee(receipt.amount),
    x: margin,
    y: 172,
    labelWidth: 150,
    lineEnd: rightEdge,
  });

  /* ---------- Amount in words ---------- */
  const wordsBoxY = 188;
  const wordsBoxH = 32;
  doc.setFillColor(...BOX_FILL);
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.7);
  doc.roundedRect(margin, wordsBoxY, rightEdge - margin, wordsBoxH, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MUTED);
  doc.text("(IN WORDS)", margin + 10, wordsBoxY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const wordLines = doc.splitTextToSize(receipt.amountInWords || "—", rightEdge - margin - 20);
  doc.text(wordLines.slice(0, 2), margin + 10, wordsBoxY + 25);

  /* ---------- Towards ---------- */
  inlineField(doc, {
    label: "Towards",
    value: receipt.towards,
    x: margin,
    y: 240,
    labelWidth: 150,
    lineEnd: rightEdge,
  });

  /* ---------- Amount box (red, matches the printed ₹ field) + payment mode ---------- */
  const rowY = 256;
  const amountBoxW = 168;
  const amountBoxH = 42;
  doc.setFillColor(...RED_TINT);
  doc.setDrawColor(...RED);
  doc.setLineWidth(1.2);
  doc.roundedRect(margin, rowY, amountBoxW, amountBoxH, 5, 5, "FD");
  drawRupeeGlyph(doc, margin + 12, rowY + 12, 18, RED);
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.7);
  doc.line(margin + 42, rowY + 31, margin + amountBoxW - 10, rowY + 31);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(Number(receipt.amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 }), margin + 48, rowY + 25);

  const modeX = margin + amountBoxW + 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text("Payment Mode  :", modeX, rowY + 18);

  const selectedIndex = paymentBoxIndex(receipt.paymentMode);
  let bx = modeX + 82;
  doc.setFontSize(9);
  PAYMENT_BOXES.forEach((label, i) => {
    const checked = i === selectedIndex;
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.8);
    doc.rect(bx, rowY + 8, 10, 10);
    if (checked) {
      doc.setFillColor(...RED);
      doc.rect(bx + 1.5, rowY + 9.5, 7, 7, "F");
    }
    doc.setFont("helvetica", checked ? "bold" : "normal");
    doc.setTextColor(...INK);
    doc.text(label, bx + 15, rowY + 17);
    bx += 15 + doc.getTextWidth(label) + 16;
  });

  /* ---------- Remarks + signature ---------- */
  const sigWidth = 160;
  inlineField(doc, {
    label: "Remarks",
    value: receipt.notes,
    x: margin,
    y: 322,
    labelWidth: 70,
    lineEnd: rightEdge - sigWidth - 20,
  });

  doc.setDrawColor(...INK_MUTED);
  doc.setLineWidth(0.7);
  doc.line(rightEdge - sigWidth, 340, rightEdge, 340);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text("Authorised Signatory", rightEdge, 353, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(...INK_MUTED);
  doc.text("A V A Y A   U D Y O G", rightEdge, 365, { align: "right" });
  if (receipt.createdBy) {
    doc.setFontSize(7.5);
    doc.text(`Issued by ${receipt.createdBy}`, margin, 365);
  }

  /* ---------- Footer: red rule + phone/mail/globe icon row ---------- */
  doc.setDrawColor(...RED);
  doc.setLineWidth(1.6);
  doc.line(0, pageHeight - 34, pageWidth, pageHeight - 34);

  const fy = pageHeight - 14;
  let fx = margin;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);

  drawPhoneIcon(doc, fx, fy - 7, 8, RED);
  fx += 11;
  doc.text(PHONE_1, fx, fy);
  fx += doc.getTextWidth(PHONE_1) + 6;
  doc.setTextColor(...LINE);
  doc.text("|", fx, fy);
  fx += 8;
  doc.setTextColor(...INK);
  doc.text(PHONE_2, fx, fy);
  fx += doc.getTextWidth(PHONE_2) + 8;
  doc.setTextColor(...LINE);
  doc.text("|", fx, fy);
  fx += 8;

  drawMailIcon(doc, fx, fy - 7, 8, RED);
  fx += 11;
  doc.setTextColor(...INK);
  doc.text(EMAIL, fx, fy);
  fx += doc.getTextWidth(EMAIL) + 6;
  doc.setTextColor(...LINE);
  doc.text("|", fx, fy);
  fx += 8;

  drawGlobeIcon(doc, fx, fy - 7, 8, RED);
  fx += 11;
  doc.setTextColor(...INK);
  doc.text(WEBSITE, fx, fy);

  return doc;
}
