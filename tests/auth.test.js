import { describe, it, expect, vi } from "vitest";
import { registerCustomer, login } from "../src/auth/service";
function mock(role = "customer") {
  const single = vi.fn().mockResolvedValue({ data: { role }, error: null });
  return {
    auth: {
      signUp: vi
        .fn()
        .mockResolvedValue({
          data: { user: { id: "test", identities: [{}] }, session: null },
          error: null,
        }),
      signInWithPassword: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "test" } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: () => ({ select: () => ({ eq: () => ({ single }) }) }),
  };
}
describe("Supabase auth adapter contract (mocked SDK, not live auth)", () => {
  const details = {
    name: " Test Customer ",
    email: "Customer@Example.test",
    password: "long-password",
  };
  it("valid registration sends only display name metadata, never an admin role", async () => {
    const s = mock();
    await registerCustomer(
      s,
      { ...details, role: "admin" },
      "https://test.example",
    );
    expect(s.auth.signUp).toHaveBeenCalledWith({
      email: "customer@example.test",
      password: "long-password",
      options: {
        data: { display_name: "Test Customer" },
        emailRedirectTo: "https://test.example/account",
      },
    });
  });
  it("invalid registration does not reach SDK", async () => {
    const s = mock();
    await expect(
      registerCustomer(s, { ...details, password: "short" }, "x"),
    ).rejects.toThrow("8 characters");
    expect(s.auth.signUp).not.toHaveBeenCalled();
  });
  it("propagates duplicate email error", async () => {
    const s = mock();
    s.auth.signUp.mockResolvedValue({
      error: Error("User already registered"),
    });
    await expect(registerCustomer(s, details, "x")).rejects.toThrow(
      "already registered",
    );
  });
  it("handles obfuscated duplicate signup", async () => {
    const s = mock();
    s.auth.signUp.mockResolvedValue({
      data: { user: { identities: [] } },
      error: null,
    });
    await expect(registerCustomer(s, details, "x")).rejects.toThrow(
      "registered",
    );
  });
  it("customer login calls password SDK", async () => {
    const s = mock();
    await login(s, details);
    expect(s.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "customer@example.test",
      password: "long-password",
    });
  });
  it("rejects invalid credentials", async () => {
    const s = mock();
    s.auth.signInWithPassword.mockResolvedValue({
      error: Error("Invalid login credentials"),
    });
    await expect(login(s, details)).rejects.toThrow("Invalid login");
  });
  it("allows authorised admin", async () => {
    const s = mock("admin");
    await expect(login(s, details, true)).resolves.toEqual({
      user: { id: "test" },
    });
    expect(s.auth.signOut).not.toHaveBeenCalled();
  });
  it("rejects customer at admin login and signs session out", async () => {
    const s = mock();
    await expect(login(s, details, true)).rejects.toThrow(
      "Administrator access",
    );
    expect(s.auth.signOut).toHaveBeenCalledOnce();
  });
});
