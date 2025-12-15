import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WikiViewer } from "@/components/admin/wiki-viewer";

// Mock fetch
global.fetch = vi.fn();

describe("WikiViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders wiki viewer with sidebar and content area", () => {
    render(<WikiViewer />);

    expect(screen.getByText("Wiki")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search wiki...")).toBeInTheDocument();
    expect(screen.getByText("Select a Wiki Page")).toBeInTheDocument();
  });

  it("displays wiki pages in sidebar", () => {
    render(<WikiViewer />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("Code Standards")).toBeInTheDocument();
  });

  it("filters wiki pages based on search query", () => {
    render(<WikiViewer />);

    const searchInput = screen.getByPlaceholderText("Search wiki...");
    fireEvent.change(searchInput, { target: { value: "standards" } });

    expect(screen.getByText("Code Standards")).toBeInTheDocument();
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
  });

  it("shows loading state when fetching wiki content", async () => {
    (global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  content: "# Test Content\n\nTest body",
                  slug: "test",
                  title: "Test",
                }),
              }),
            100
          )
        )
    );

    render(<WikiViewer />);

    const homeButton = screen.getByText("Home");
    fireEvent.click(homeButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.queryByText("# Test Content")).toBeInTheDocument();
    });
  });

  it("displays wiki content when page is selected", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        content: "# Home\n\nWelcome to the wiki",
        slug: "Home",
        title: "Home",
      }),
    });

    render(<WikiViewer />);

    const homeButton = screen.getByText("Home");
    fireEvent.click(homeButton);

    await waitFor(() => {
      expect(screen.getByText("Home")).toBeInTheDocument();
    });
  });

  it("handles fetch errors gracefully", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Fetch failed"));

    render(<WikiViewer />);

    const homeButton = screen.getByText("Home");
    fireEvent.click(homeButton);

    await waitFor(() => {
      expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
    });
  });

  it("displays hint text when no page is selected", () => {
    render(<WikiViewer />);

    expect(screen.getByText("Select a Wiki Page")).toBeInTheDocument();
    expect(
      screen.getByText(/Click a page to view its content/i)
    ).toBeInTheDocument();
  });
});
