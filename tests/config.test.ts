import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveConfig, MPESA_ENV_KEYS } from "../src/config.js";
import { MpesaValidationError } from "../src/errors/index.js";

describe("resolveConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubGlobal("process", {
      ...process,
      env: { ...originalEnv },
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("uses explicit config over env", () => {
    process.env[MPESA_ENV_KEYS.consumerKey] = "env-key";
    process.env[MPESA_ENV_KEYS.consumerSecret] = "env-secret";
    process.env[MPESA_ENV_KEYS.environment] = "production";

    const resolved = resolveConfig({
      consumerKey: "config-key",
      consumerSecret: "config-secret",
      environment: "sandbox",
    });

    expect(resolved.consumerKey).toBe("config-key");
    expect(resolved.consumerSecret).toBe("config-secret");
    expect(resolved.environment).toBe("sandbox");
  });

  it("falls back to env when config is empty", () => {
    process.env[MPESA_ENV_KEYS.consumerKey] = "env-key";
    process.env[MPESA_ENV_KEYS.consumerSecret] = "env-secret";
    process.env[MPESA_ENV_KEYS.environment] = "production";
    process.env[MPESA_ENV_KEYS.shortCode] = "123456";

    const resolved = resolveConfig({});

    expect(resolved.consumerKey).toBe("env-key");
    expect(resolved.consumerSecret).toBe("env-secret");
    expect(resolved.environment).toBe("production");
    expect(resolved.shortCode).toBe("123456");
  });

  it("defaults environment to sandbox when env not set", () => {
    const resolved = resolveConfig({
      consumerKey: "key",
      consumerSecret: "secret",
    });
    expect(resolved.environment).toBe("sandbox");
  });

  it("throws when environment is invalid", () => {
    process.env[MPESA_ENV_KEYS.consumerKey] = "env-key";
    process.env[MPESA_ENV_KEYS.consumerSecret] = "env-secret";
    process.env[MPESA_ENV_KEYS.environment] = "staging";

    expect(() => resolveConfig({})).toThrow(MpesaValidationError);
    expect(() => resolveConfig({})).toThrow(/Invalid environment/);
  });

  it("throws MpesaValidationError when consumerKey and consumerSecret missing", () => {
    delete process.env[MPESA_ENV_KEYS.consumerKey];
    delete process.env[MPESA_ENV_KEYS.consumerSecret];

    expect(() => resolveConfig({})).toThrow(MpesaValidationError);
    expect(() => resolveConfig({})).toThrow(/consumerKey and consumerSecret/);
  });
});
