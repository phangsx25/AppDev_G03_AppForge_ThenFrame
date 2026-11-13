// @vitest-environment jsdom
import React from "react";
import { it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
vi.mock("../src/lib/backend", () => ({
  demo: true,
  supabase: null,
  requireBackend: vi.fn(),
  check: (r) => r.data,
}));
import {
  AuthProvider,
  Protected,
  AuthPage,
  Account,
  useAuth,
} from "../src/auth/Auth";
afterEach(() => {
  cleanup();
  sessionStorage.clear();
});
function mount(route) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/admin/login" element={<AuthPage admin />} />
          <Route
            path="/account"
            element={
              <Protected>
                <Account />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected admin>
                <h1>Studio test dashboard</h1>
              </Protected>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}
it("unauthenticated protected account redirects to customer login", async () => {
  mount("/account");
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Customer login" }),
    ).toBeTruthy(),
  );
});
it("unauthenticated admin route redirects to admin login", async () => {
  mount("/admin");
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "Admin login" })).toBeTruthy(),
  );
});
it("demo admin selection redirects to guarded dashboard", async () => {
  mount("/admin/login");
  fireEvent.click(
    screen.getByRole("button", { name: "Continue as demo admin" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Studio test dashboard" }),
    ).toBeTruthy(),
  );
});
it("customer cannot render admin contents", async () => {
  sessionStorage.setItem(
    "thenframe-demo-role",
    JSON.stringify({ id: "c", role: "customer" }),
  );
  mount("/admin");
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "Access denied" })).toBeTruthy(),
  );
  expect(screen.queryByText("Studio test dashboard")).toBeNull();
});
it("demo customer selection opens protected account", async () => {
  mount("/login");
  fireEvent.click(
    screen.getByRole("button", { name: "Continue as demo customer" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Hello, Rehearsal customer." }),
    ).toBeTruthy(),
  );
});

function LogoutHarness() {
  const { logout } = useAuth();
  return (
    <>
      <button onClick={logout}>Logout test</button>
      <Protected>
        <Account />
      </Protected>
    </>
  );
}
it("logout revokes protected account in React", async () => {
  sessionStorage.setItem(
    "thenframe-demo-role",
    JSON.stringify({ id: "c", role: "customer", display_name: "Test" }),
  );
  render(
    <MemoryRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LogoutHarness />} />
          <Route path="/login" element={<h1>Signed out</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "Hello, Test." })).toBeTruthy(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Logout test" }));
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "Signed out" })).toBeTruthy(),
  );
  expect(JSON.parse(sessionStorage.getItem("thenframe-demo-role"))).toBeNull();
});
