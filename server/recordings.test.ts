import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("recordings.trigger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls Manus API and returns success when API key is configured", async () => {
    // Mock fetch to simulate Manus API response
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, task_id: "test-task-123" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.recordings.trigger();

    expect(result).toEqual({ success: true, taskId: "test-task-123" });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.manus.ai/v2/task.create",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "x-manus-api-key": expect.any(String),
        }),
      })
    );

    // Verify the body contains the correct prompt
    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.message.content).toContain("iCloud Recordings Vault/Inbox");
    expect(body.message.content).toContain("Marc's voice profile");
  });

  it("throws an error when Manus API returns an error response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        ok: false,
        error: { code: "permission_denied", message: "Invalid API key" },
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.recordings.trigger()).rejects.toThrow("Invalid API key");
  });

  it("validates that MANUS_API_KEY environment variable is set", () => {
    // This test validates the secret is available in the environment
    const apiKey = process.env.MANUS_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey!.length).toBeGreaterThan(0);
  });
});
