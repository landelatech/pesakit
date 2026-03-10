import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider } from "../src/auth/index.js";
import { MpesaAuthError } from "../src/errors/index.js";

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("fetches and caches token", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(JSON.stringify({ access_token: "test-token", expires_in: "3599" })),
    } as Response);

    const auth = new AuthProvider({
      environment: "sandbox",
      consumerKey: "key",
      consumerSecret: "secret",
    });

    const token1 = await auth.getAccessToken();
    const token2 = await auth.getAccessToken();

    expect(token1).toBe("test-token");
    expect(token2).toBe("test-token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uses Basic auth with base64 credentials", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ access_token: "t", expires_in: "3599" })),
    } as Response);

    const auth = new AuthProvider({
      environment: "sandbox",
      consumerKey: "user",
      consumerSecret: "pass",
    });
    await auth.getAccessToken();

    const call = fetchMock.mock.calls[0];
    expect(call?.[1]?.headers).toBeDefined();
    const headers = call?.[1]?.headers as Record<string, string>;
    expect(headers.Authorization).toMatch(/^Basic /);
    const b64 = headers.Authorization.replace("Basic ", "");
    expect(Buffer.from(b64, "base64").toString("utf8")).toBe("user:pass");
  });

  it("throws MpesaAuthError on non-ok response", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      statusText: "Unauthorized",
      text: () => Promise.resolve(JSON.stringify({ error: "invalid_client" })),
    } as Response);

    const auth = new AuthProvider({
      environment: "sandbox",
      consumerKey: "key",
      consumerSecret: "secret",
    });

    await expect(auth.getAccessToken()).rejects.toThrow(MpesaAuthError);
  });

  it("wraps fetch failures as MpesaAuthError", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    const auth = new AuthProvider({
      environment: "sandbox",
      consumerKey: "key",
      consumerSecret: "secret",
    });

    await expect(auth.getAccessToken()).rejects.toThrow(MpesaAuthError);
  });

  it("deduplicates concurrent refresh requests", async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );

    const auth = new AuthProvider({
      environment: "sandbox",
      consumerKey: "key",
      consumerSecret: "secret",
    });

    const tokenA = auth.getAccessToken();
    const tokenB = auth.getAccessToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch?.({
      ok: true,
      text: () =>
        Promise.resolve(JSON.stringify({ access_token: "shared-token", expires_in: "3599" })),
    } as Response);

    await expect(Promise.all([tokenA, tokenB])).resolves.toEqual(["shared-token", "shared-token"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes token after clearCache", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ access_token: "token1", expires_in: "3599" })),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ access_token: "token2", expires_in: "3599" })),
      } as Response);

    const auth = new AuthProvider({
      environment: "sandbox",
      consumerKey: "key",
      consumerSecret: "secret",
    });

    const t1 = await auth.getAccessToken();
    auth.clearCache();
    const t2 = await auth.getAccessToken();

    expect(t1).toBe("token1");
    expect(t2).toBe("token2");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
