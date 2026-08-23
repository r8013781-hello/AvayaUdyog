import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FAQ from "../components/FAQ";
import { FAQS } from "../lib/faqs";
import { faqSchema } from "../lib/schema";

describe("FAQ", () => {
  it("renders every question on the page", () => {
    render(<FAQ />);
    FAQS.forEach(({ q }) => {
      expect(screen.getByText(q)).toBeInTheDocument();
    });
  });

  it("renders every answer in the markup, not only once expanded", () => {
    // Native <details> keeps the answer in the DOM while collapsed, which is
    // what makes it indexable. If this section were ever rewritten with
    // JS-mounted panels, the answers would vanish from the static HTML and
    // this test is what should catch it.
    const { container } = render(<FAQ />);
    FAQS.forEach(({ a }) => {
      expect(container.textContent).toContain(a);
    });
  });

  it("keeps the JSON-LD answers identical to the visible ones", () => {
    const schema = faqSchema(FAQS);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(FAQS.length);

    const { container } = render(<FAQ />);
    schema.mainEntity.forEach((entry) => {
      expect(entry["@type"]).toBe("Question");
      expect(entry.acceptedAnswer["@type"]).toBe("Answer");
      // Markup that promises Google an answer the page does not show is the
      // one way FAQ structured data earns a manual action.
      expect(container.textContent).toContain(entry.acceptedAnswer.text);
    });
  });

  it("states no price, duration or project count", () => {
    // These are the four shapes of claim the business has not established.
    // A future edit that slips one in should fail here rather than ship.
    const answers = FAQS.map((f) => f.a).join(" ");
    expect(answers).not.toMatch(/₹|Rs\.?\s*\d|\bper sq\.? ?ft\b/i);
    expect(answers).not.toMatch(/\b\d+\s*(?:-|to)?\s*\d*\s*(?:weeks|months|days)\b/i);
    expect(answers).not.toMatch(/\b\d{2,}\s*(?:projects|homes|clients|spaces)\b/i);
  });

  it("does not claim coverage of specific localities", () => {
    // Kolkata is established across the site; the sub-locality claims in
    // lib/schema.js are not, and must not be restated as fact here.
    const answers = FAQS.map((f) => f.a).join(" ");
    expect(answers).not.toMatch(/Salt Lake|New Town|Ballygunge|Alipore|Howrah/i);
  });
});
