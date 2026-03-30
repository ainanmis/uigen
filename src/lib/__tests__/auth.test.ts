import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { createSession } from "../auth";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

beforeEach(() => {
  vi.clearAllMocks();
});

test("createSession sets cookie with correct name and options", async () => {
  const mockSet = vi.fn();
  vi.mocked(cookies).mockResolvedValue({ set: mockSet, get: vi.fn(), delete: vi.fn() } as any);

  await createSession("user-1", "user@example.com");

  expect(mockSet).toHaveBeenCalledOnce();
  const [name, , options] = mockSet.mock.calls[0];
  expect(name).toBe("auth-token");
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
  expect(options.expires).toBeInstanceOf(Date);
});

test("createSession sets a JWT containing the correct userId and email", async () => {
  let capturedToken: string | undefined;
  vi.mocked(cookies).mockResolvedValue({
    set: vi.fn((_name: string, token: string) => { capturedToken = token; }),
    get: vi.fn(),
    delete: vi.fn(),
  } as any);

  await createSession("user-42", "hello@example.com");

  const { payload } = await jwtVerify(capturedToken!, JWT_SECRET);
  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("hello@example.com");
});

test("createSession sets a cookie that expires in ~7 days", async () => {
  const before = Date.now();
  vi.mocked(cookies).mockResolvedValue({ set: vi.fn(), get: vi.fn(), delete: vi.fn() } as any);

  await createSession("user-1", "user@example.com");

  const mockSet = vi.mocked(cookies).mock.results[0].value;
  const [, , options] = (await mockSet).set.mock.calls[0];
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const expiresMs = (options.expires as Date).getTime();
  expect(expiresMs).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expiresMs).toBeLessThanOrEqual(before + sevenDaysMs + 1000);
});
