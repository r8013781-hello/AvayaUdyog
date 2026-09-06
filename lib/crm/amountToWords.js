/**
 * Rupee amounts spelled out, Indian numbering (Thousand / Lakh / Crore) — used
 * for the live "in words" line while a money receipt is being filled in. The
 * saved receipt's authoritative words come from the API (backend computes and
 * stores them); this is only the pre-save preview, kept in step with
 * backend/lib/amountInWords.js.
 */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function below100(n) {
  if (n < 20) return ONES[n];
  const r = n % 10;
  return TENS[Math.floor(n / 10)] + (r ? ` ${ONES[r]}` : "");
}

function below1000(n) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return (h ? `${ONES[h]} Hundred${r ? " " : ""}` : "") + (r ? below100(r) : "");
}

export function numberToWords(value) {
  let n = Math.round(value);
  if (n === 0) return "Zero";
  if (n < 0) return `Minus ${numberToWords(-n)}`;

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;

  let out = "";
  if (crore) out += `${numberToWords(crore)} Crore `;
  if (lakh) out += `${below100(lakh)} Lakh `;
  if (thousand) out += `${below100(thousand)} Thousand `;
  if (n) out += below1000(n);
  return out.trim();
}

export function amountToWords(amount) {
  const num = Number(amount) || 0;
  let rupees = Math.floor(num);
  let paise = Math.round((num - rupees) * 100);
  if (paise === 100) {
    rupees += 1;
    paise = 0;
  }
  let text = `Rupees ${numberToWords(rupees)}`;
  if (paise > 0) text += ` and ${below100(paise)} Paise`;
  return `${text} only`;
}
