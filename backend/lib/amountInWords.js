"use strict";

/**
 * Rupee amounts spelled out in the Indian numbering system (Thousand, Lakh,
 * Crore) — the form printed on a money receipt. Kept dependency-free and
 * pure so it can be unit-tested and reused by the receipts route as the
 * single source of truth for `amount_in_words`.
 */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function below100(n) {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const r = n % 10;
  return TENS[t] + (r ? ` ${ONES[r]}` : "");
}

function below1000(n) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return (h ? `${ONES[h]} Hundred${r ? " " : ""}` : "") + (r ? below100(r) : "");
}

/** Whole number → words. Handles arbitrarily large values via crore recursion. */
function numberToWords(value) {
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

/**
 * "Rupees Forty Five Thousand only" / "Rupees One Lakh Two Hundred and
 * Fifty Paise only". Rounds to 2 dp; never returns an empty string.
 */
function amountInWords(amount) {
  const num = Number(amount) || 0;
  let rupees = Math.floor(num);
  let paise = Math.round((num - rupees) * 100);
  // Rounding can push paise to a full rupee (e.g. 99.999 → 99 r + 100 p).
  if (paise === 100) {
    rupees += 1;
    paise = 0;
  }

  let text = `Rupees ${numberToWords(rupees)}`;
  if (paise > 0) text += ` and ${below100(paise)} Paise`;
  return `${text} only`;
}

module.exports = { amountInWords, numberToWords };
