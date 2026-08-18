import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
}));

describe("Employee project pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, "", "/crm?view=projects");
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

  it("shows the projects workspace and lets staff create customer and project records", async () => {
    render(
      <NotificationsProvider>
        <EmployeeLogin onBackToSite={() => {}} />
      </NotificationsProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /projects/i }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/project register/i)).toBeInTheDocument();
    expect(screen.getByText(/register a customer/i)).toBeInTheDocument();
    expect(screen.getByText(/3bhk apartment interior/i)).toBeInTheDocument();
    expect(getToken()).toBe("demo-token");
  });
});
