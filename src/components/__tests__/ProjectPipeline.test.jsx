import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeeLogin from "../EmployeeLogin";
import { api, getToken } from "../../lib/api";
import { NotificationsProvider } from "../../lib/notifications";

vi.mock("../../lib/api", () => ({
  api: {
    me: vi.fn(),
    login: vi.fn(),
    getLeads: vi.fn(),
    getCustomers: vi.fn(),
    getProjects: vi.fn(),
    getFollowups: vi.fn(),
    createLead: vi.fn(),
    createFollowup: vi.fn(),
    setFollowupDone: vi.fn(),
    getQuotations: vi.fn(),
    createQuotation: vi.fn(),
  },
  getToken: vi.fn(() => "demo-token"),
  setToken: vi.fn(),
  onUnauthorized: vi.fn(() => () => {}),
  onSlowRequest: vi.fn(() => () => {}),
}));

describe("Employee project pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, "", "/portal?view=projects");
    api.me.mockResolvedValue({
      id: 1,
      name: "Ananya Rao",
      role: "Design lead",
      isSuperAdmin: true,
      permissions: {},
    });
    api.getLeads.mockResolvedValue([]);
    api.getCustomers.mockResolvedValue([
      {
        id: 5,
        name: "Vikram Shah",
        phone: "9876543210",
        city: "Mumbai",
        companyName: "Urban Nest",
      },
    ]);
    api.getProjects.mockResolvedValue([
      {
        id: 11,
        projectCode: "PRJ-2026-001",
        name: "3BHK apartment interior",
        projectType: "Residential interiors",
        siteAddress: "Andheri East",
        city: "Mumbai",
        customerId: 5,
        customerName: "Vikram Shah",
      },
    ]);
    api.getFollowups.mockResolvedValue([]);
  });

  it("shows the projects workspace with the fetched project and lets staff open the add-project form", async () => {
    render(
      <NotificationsProvider>
        <EmployeeLogin onBackToSite={() => {}} />
      </NotificationsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/3bhk apartment interior/i)).toBeInTheDocument();
    });

    // The fetched project's own details render, not just its name.
    expect(screen.getByText(/PRJ-2026-001/i)).toBeInTheDocument();
    expect(screen.getByText(/vikram shah/i)).toBeInTheDocument();
    expect(screen.getByText(/andheri east/i)).toBeInTheDocument();

    // A super admin can open the create-project form from this view.
    const addProjectButton = screen.getByRole("button", { name: /add project/i });
    expect(addProjectButton).toBeInTheDocument();
    fireEvent.click(addProjectButton);
    expect(await screen.findByText(/new project/i)).toBeInTheDocument();

    expect(getToken()).toBe("demo-token");
  });
});
