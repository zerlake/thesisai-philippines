import { enableFetchMocks } from "jest-fetch-mock";

enableFetchMocks();

describe("AI Gateway API Contract", () => {
  const API_URL = "http://localhost:3000/api/ai/generate";

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should return a successful response for a valid request", async () => {
    const mockResponse = { result: "Generated Title" };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse), { status: 200 });

    const requestBody = {
      task: "generate_title",
      prompt: "A paper on the impact of climate change on marine life",
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      API_URL,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(requestBody),
      }),
    );
  });

  it("should return a 400 error for an invalid task", async () => {
    const mockErrorResponse = {
      error: "Invalid request body",
      details: { task: ["Invalid enum value"] },
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockErrorResponse), {
      status: 400,
    });

    const requestBody = {
      task: "invalid_task",
      prompt: "This should fail",
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const errorData = await response.json();

    expect(response.status).toBe(400);
    expect(errorData).toEqual(mockErrorResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      API_URL,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(requestBody),
      }),
    );
  });
});
