import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Gallery from "../components/Gallery";

describe("Gallery Component", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: () => Promise.resolve([]),
      }),
    );
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  it("renders Gallery header and description", async () => {
    render(<Gallery />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /The interiors we design/i,
    );
    expect(
      screen.getByText(/tailored to its people, location and budget/i),
    ).toBeInTheDocument();
  });

  // The gallery images are self-hosted stock photography (see commit 054f46d),
  // not photographs of delivered Avaya Udyog projects. Alt text must therefore
  // describe the room rather than attribute it to a completed project — this
  // guards against the attribution creeping back in.
  it("does not attribute gallery photography to completed projects", () => {
    render(<Gallery />);
    screen.getAllByRole("img").forEach((img) => {
      const alt = img.getAttribute("alt") || "";
      expect(alt.length).toBeGreaterThan(0);
      expect(alt).not.toMatch(/by Avaya Udyog|Avaya Udyog .*project/i);
    });
  });

  it("renders filter buttons with correct labels and default active", () => {
    render(<Gallery />);
    const allBtn = screen.getByRole("button", { name: /all/i });
    const residentialBtn = screen.getByRole("button", { name: /residential/i });
    const commercialBtn = screen.getByRole("button", { name: /commercial/i });

    expect(allBtn).toBeInTheDocument();
    expect(residentialBtn).toBeInTheDocument();
    expect(commercialBtn).toBeInTheDocument();

    expect(allBtn).toHaveAttribute("aria-pressed", "true");
    expect(residentialBtn).toHaveAttribute("aria-pressed", "false");
    expect(commercialBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("filter buttons change the filter state and ariat-pressed attribute", () => {
    render(<Gallery />);
    const residentialBtn = screen.getByRole("button", { name: /residential/i });
    fireEvent.click(residentialBtn);
    expect(residentialBtn).toHaveAttribute("aria-pressed", "true");
    const allBtn = screen.getByRole("button", { name: /all/i });
    expect(allBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("favorites toggle button adds and removes favorites in localStorage", async () => {
    render(<Gallery />);
    // The real aria-label is "Add {title} to favorites" — the image title
    // sits between "Add" and "to favorites", so it can never match a
    // literal "Add to favorites" substring.
    const firstFavoriteBtn = await screen.findAllByRole("button", {
      name: /^Add .+ to favorites$/i,
    });
    expect(firstFavoriteBtn.length).toBeGreaterThan(0);

    const firstBtn = firstFavoriteBtn[0];
    // Gallery syncs its favorites state to localStorage on every render,
    // including the initial one — so it's "[]", not absent, before any click.
    expect(JSON.parse(localStorage.getItem("gallery-favorites"))).toEqual([]);

    fireEvent.click(firstBtn);
    let favs = JSON.parse(localStorage.getItem("gallery-favorites"));
    expect(favs.length).toBe(1);

    fireEvent.click(firstBtn);
    favs = JSON.parse(localStorage.getItem("gallery-favorites"));
    expect(favs.length).toBe(0);
  });
});
