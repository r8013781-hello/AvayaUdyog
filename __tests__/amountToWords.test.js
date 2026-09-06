import { describe, it, expect } from "vitest";
import { amountToWords, numberToWords } from "../lib/crm/amountToWords";

describe("numberToWords (Indian system)", () => {
  const cases = [
    [0, "Zero"],
    [9, "Nine"],
    [19, "Nineteen"],
    [73, "Seventy Three"],
    [200, "Two Hundred"],
    [1947, "One Thousand Nine Hundred Forty Seven"],
    [50000, "Fifty Thousand"],
    [100000, "One Lakh"],
    [2500000, "Twenty Five Lakh"],
    [10000000, "One Crore"],
    [10101010, "One Crore One Lakh One Thousand Ten"],
  ];
  it.each(cases)("%i → %s", (input, expected) => {
    expect(numberToWords(input)).toBe(expected);
  });
});

describe("amountToWords — receipt preview line", () => {
  it("formats a whole rupee amount", () => {
    expect(amountToWords(45000)).toBe("Rupees Forty Five Thousand only");
  });

  it("adds paise when present", () => {
    expect(amountToWords(105.25)).toBe("Rupees One Hundred Five and Twenty Five Paise only");
  });

  it("carries a rounded-up paise into the rupee", () => {
    expect(amountToWords(99.999)).toBe("Rupees One Hundred only");
  });

  it("handles a blank / non-numeric input without throwing", () => {
    expect(amountToWords("")).toBe("Rupees Zero only");
    expect(amountToWords(undefined)).toBe("Rupees Zero only");
  });

  it("matches the backend spelling for a large amount", () => {
    // Mirrors backend/__tests__/amountInWords.test.js so the preview and the
    // stored value can't silently diverge.
    expect(amountToWords(123456789)).toBe(
      "Rupees Twelve Crore Thirty Four Lakh Fifty Six Thousand Seven Hundred Eighty Nine only",
    );
  });
});
