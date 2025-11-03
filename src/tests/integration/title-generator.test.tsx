import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TitleGeneratorPage from "@/app/(app)/title-generator/page";

// Mock the useAuth hook to provide a dummy session
jest.mock("@/components/auth-provider", () => ({
  useAuth: () => ({
    session: { user: { id: "test-user" } },
  }),
}));

describe("Title Generator Page Integration Test", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it("should render the page, allow typing, and display a generated title on button click", async () => {
    // Arrange
    const mockResponse = { result: "An AI-Generated Title. A second title." };
    global.fetch = jest.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        }) as Promise<Response>,
    );

    render(<TitleGeneratorPage />);

    // Act
    const topicInput = screen.getByPlaceholderText(
      "Enter your thesis topic or abstract...",
    );
    const generateButton = screen.getByRole("button", {
      name: /generate titles/i,
    });

    fireEvent.change(topicInput, {
      target: { value: "A detailed study on renewable energy sources." },
    });
    fireEvent.click(generateButton);

    // Assert
    // Wait for the mock response to be processed and the UI to update
    await waitFor(() => {
      expect(screen.getByText("An AI-Generated Title.")).toBeInTheDocument();
      expect(screen.getByText("A second title.")).toBeInTheDocument();
    });

    // Verify that the API was called correctly
    expect(global.fetch).toHaveBeenCalledWith("/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: "generate_title",
        prompt: "A detailed study on renewable energy sources.",
      }),
    });
  });
});
