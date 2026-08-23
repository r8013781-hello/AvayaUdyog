import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Testimonials from "../components/Testimonials";

vi.mock("../lib/api", () => ({
  api: {
    getPublicReviews: vi.fn(),
  },
}));

import { api } from "../lib/api";

const GOOGLE_REVIEW_URL = "https://g.page/r/CcWI3rhXDzjpEAE/review";

describe("Testimonials Google review CTA", () => {
  beforeEach(() => {
    window.gtag = vi.fn();
    api.getPublicReviews.mockResolvedValue([
      {
        id: 1,
        source: "manual",
        authorName: "A client",
        text: "A genuine testimonial.",
      },
    ]);
  });

  it("uses the official outbound URL and records only CTA context", async () => {
    render(<Testimonials />);

    const link = await screen.findByRole("link", { name: "Review us on Google" });
    expect(link).toHaveAttribute("href", GOOGLE_REVIEW_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    fireEvent.click(link);
    await waitFor(() => {
      expect(window.gtag).toHaveBeenCalledWith("event", "google_review_click", {
        source_section: "testimonials",
        page_path: "/",
        cta_type: "outbound_link",
      });
    });
  });
});
