const { amountInWords, numberToWords } = require("../lib/amountInWords");

describe("numberToWords (Indian system)", () => {
  it.each([
    [0, "Zero"],
    [7, "Seven"],
    [15, "Fifteen"],
    [80, "Eighty"],
    [99, "Ninety Nine"],
    [100, "One Hundred"],
    [305, "Three Hundred Five"],
    [1000, "One Thousand"],
    [45000, "Forty Five Thousand"],
    [100000, "One Lakh"],
    [125000, "One Lakh Twenty Five Thousand"],
    [10000000, "One Crore"],
    [123456789, "Twelve Crore Thirty Four Lakh Fifty Six Thousand Seven Hundred Eighty Nine"],
  ])("%i → %s", (input, expected) => {
    expect(numberToWords(input)).toBe(expected);
  });
});

describe("amountInWords", () => {
  it("wraps a whole amount as Rupees … only", () => {
    expect(amountInWords(45000)).toBe("Rupees Forty Five Thousand only");
  });

  it("includes paise when the amount has a fractional part", () => {
    expect(amountInWords(1200.5)).toBe("Rupees One Thousand Two Hundred and Fifty Paise only");
  });

  it("rounds to two decimal places", () => {
    expect(amountInWords(99.999)).toBe("Rupees One Hundred only");
  });

  it("never returns an empty string for zero", () => {
    expect(amountInWords(0)).toBe("Rupees Zero only");
  });
});
