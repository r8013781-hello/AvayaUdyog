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

const APPROVED_REVIEW = {
  id: 1,
  source: "manual",
  authorName: "A client",
  text: "A genuine testimonial.",
};

const findCta = () => screen.findByRole("link", { name: "Review us on Google" });

/**
 * The CTA must survive an empty or failing reviews API. Zero approved
 * reviews is precisely when the business most needs to be asking for one,
 * so gating the ask on already having reviews is backwards.
 */
describe("Testimonials Google review CTA", () => {
  beforeEach(() => {
    window.gtag = vi.fn();
    api.getPublicReviews.mockReset();
  });

  it("uses the official outbound URL and records only CTA context", async () => {
    api.getPublicReviews.mockResolvedValue([APPROVED_REVIEW]);
    render(<Testimonials />);

    const link = await findCta();
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

  it("shows the CTA alongside the cards when reviews are approved", async () => {
    api.getPublicReviews.mockResolvedValue([APPROVED_REVIEW]);
    render(<Testimonials />);

    expect(await findCta()).toBeInTheDocument();
    expect(await screen.findByText("A genuine testimonial.")).toBeInTheDocument();
  });

  it("still shows the CTA when no review has been approved", async () => {
    api.getPublicReviews.mockResolvedValue([]);
    render(<Testimonials />);

    const link = await findCta();
    expect(link).toHaveAttribute("href", GOOGLE_REVIEW_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("still shows the CTA when the reviews API is unavailable", async () => {
    api.getPublicReviews.mockRejectedValue(new Error("backend asleep"));
    render(<Testimonials />);

    expect(await findCta()).toBeInTheDocument();
  });

  it("reframes the heading as an invitation when nothing is approved", async () => {
    api.getPublicReviews.mockResolvedValue([]);
    render(<Testimonials />);

    await findCta();
    // A "trusted by the people who live in our work" headline with no cards
    // beneath it reads as a broken section, not a testimonial section.
    expect(screen.getByRole("heading", { name: /could be yours/i })).toBeInTheDocument();
    expect(screen.queryByText(/who live in our work/i)).toBeNull();
  });

  it("keeps the testimonial headline once reviews exist", async () => {
    api.getPublicReviews.mockResolvedValue([APPROVED_REVIEW]);
    render(<Testimonials />);

    await findCta();
    expect(screen.getByText(/who live in our work/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /could be yours/i })).toBeNull();
  });

  it("renders no placeholder testimonial when nothing is approved", async () => {
    api.getPublicReviews.mockResolvedValue([]);
    render(<Testimonials />);

    await findCta();
    // No cards, no carousel affordances — an empty section must never invent
    // a quote to fill itself.
    expect(document.querySelector("figure")).toBeNull();
    expect(document.querySelector("blockquote")).toBeNull();
    expect(screen.queryByRole("group", { name: "Client reviews" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Next review" })).toBeNull();
  });

  it("records the same GA4 payload when fired from the empty state", async () => {
    api.getPublicReviews.mockResolvedValue([]);
    render(<Testimonials />);

    fireEvent.click(await findCta());
    await waitFor(() => {
      expect(window.gtag).toHaveBeenCalledWith("event", "google_review_click", {
        source_section: "testimonials",
        page_path: "/",
        cta_type: "outbound_link",
      });
    });
    expect(window.gtag).toHaveBeenCalledTimes(1);
  });

  it("keeps the reveal animation class when reviews arrive", async () => {
    /* Regression: useReveal adds .is-visible imperatively, then unobserves
       the node. If React rewrites className on a later render, that class is
       stripped and the heading/CTA sit at opacity 0 permanently — cards
       visible, everything around them blank. Any conditional class on a
       .reveal element brings this straight back. */
    let resolveReviews;
    api.getPublicReviews.mockReturnValue(
      new Promise((resolve) => {
        resolveReviews = resolve;
      }),
    );
    const { container } = render(<Testimonials />);

    const revealed = [...container.querySelectorAll(".reveal")];
    expect(revealed.length).toBeGreaterThan(0);
    revealed.forEach((el) => el.classList.add("is-visible"));

    resolveReviews([APPROVED_REVIEW]);
    await screen.findByText("A genuine testimonial.");

    revealed.forEach((el) => {
      expect(el).toHaveClass("reveal");
      expect(el).toHaveClass("is-visible");
    });
  });

  it("exposes no review or rating input of its own", async () => {
    api.getPublicReviews.mockResolvedValue([APPROVED_REVIEW]);
    render(<Testimonials />);

    await findCta();
    // Reviews are written on Google, synced, and moderated in the CRM. This
    // section collects nothing.
    expect(document.querySelector("form")).toBeNull();
    expect(document.querySelector("input")).toBeNull();
    expect(document.querySelector("textarea")).toBeNull();
  });
});
