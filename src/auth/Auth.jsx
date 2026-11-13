import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { demo, supabase, requireBackend, check } from "../lib/backend";
import { demoSession, setDemoSession } from "../lib/demo";
import { registerCustomer, login } from "./service";
const Context = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const epoch = useRef(0);
  useEffect(() => {
    if (demo) {
      setUser(demoSession());
      setLoading(false);
      return;
    }
    if (!supabase) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const update = async (session) => {
      const n = ++epoch.current;
      setLoading(true);
      setUser(null);
      setError("");
      try {
        const profile = session
          ? check(
              await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single(),
            )
          : null;
        if (mounted && n === epoch.current)
          setUser(profile ? { ...profile, email: session.user.email } : null);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted && n === epoch.current) setLoading(false);
      }
    };
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setError(error.message);
        setLoading(false);
      } else update(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        if (mounted) update(session);
      }, 0);
    });
    return () => {
      mounted = false;
      epoch.current++;
      data.subscription.unsubscribe();
    };
  }, []);
  const logout = async () => {
    if (demo) setDemoSession(null);
    else check(await requireBackend().auth.signOut());
    epoch.current++;
    setUser(null);
    setLoading(false);
  };
  return (
    <Context.Provider
      value={{
        user,
        loading,
        error,
        logout,
        simulate: (role) => setUser(setDemoSession(role)),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
export function Protected({ admin = false, children }) {
  const { user, loading, error } = useAuth();
  if (loading) return <p role="status">Checking your session…</p>;
  if (error)
    return (
      <p role="alert">
        Unable to verify access: {error}. Sign out and try again.
      </p>
    );
  if (!user) return <Navigate replace to={admin ? "/admin/login" : "/login"} />;
  if (admin && user.role !== "admin")
    return (
      <section className="empty">
        <h1>Access denied</h1>
        <p>This area is for authorised studio administrators.</p>
      </section>
    );
  return children;
}
export function AuthPage({ register = false, admin = false }) {
  const { user, simulate } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user && (!admin || user.role === "admin"))
      navigate(admin ? "/admin" : "/account", { replace: true });
  }, [user, admin, navigate]);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const d = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const s = requireBackend();
      if (register) {
        const data = await registerCustomer(s, d, location.origin);
        setMessage(
          data.session
            ? "Account created. Opening your account…"
            : "Check your email to confirm your account, then sign in.",
        );
      } else {
        await login(s, d, admin);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-grid">
      <aside className="auth-art">
        <span className="eyebrow">THENFRAME / YOUR NEXT CHAPTER</span>
        <h1>
          {admin
            ? "A little organisation.\nMore room for creativity."
            : "Every story begins\nwith a moment."}
        </h1>
        <p>
          {admin
            ? "Your collections, thoughtfully arranged."
            : "Explore wedding collections and find your inspiration."}
        </p>
        <div className="rings" aria-hidden="true">
          ◎
        </div>
      </aside>
      <section className="auth-panel">
        <span className="eyebrow">
          {admin
            ? "STUDIO ACCESS"
            : register
              ? "WELCOME TO THENFRAME"
              : "WELCOME BACK"}
        </span>
        <h2>
          {admin
            ? "Admin login"
            : register
              ? "Create your account"
              : "Customer login"}
        </h2>
        <p className="muted">
          {admin
            ? "For authorised ThenFrame administrators."
            : "Your wedding inspiration starts here."}
        </p>
        {demo ? (
          <div className="notice">
            <strong>Local rehearsal — authentication is simulated</strong>
            <p>
              No passwords or real accounts are created. Gallery data stays in
              this browser.
            </p>
            <button onClick={() => simulate(admin ? "admin" : "customer")}>
              Continue as demo {admin ? "admin" : "customer"}
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            {register && (
              <label>
                Display name
                <input
                  name="name"
                  autoComplete="name"
                  maxLength="100"
                  required
                />
              </label>
            )}
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                minLength={register ? 8 : undefined}
                autoComplete={register ? "new-password" : "current-password"}
                required
              />
            </label>
            {register && (
              <small>
                At least 8 characters. New accounts are always customers.
              </small>
            )}
            <button disabled={busy}>
              {busy
                ? "Please wait…"
                : register
                  ? "Create account"
                  : admin
                    ? "Sign in to studio"
                    : "Sign in"}
            </button>
          </form>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        <p>
          {register ? (
            <a href="/login">Already have an account? Sign in</a>
          ) : (
            <a href="/register">Create a customer account</a>
          )}
        </p>
        <a href="/portfolio">← Back to the portfolio</a>
      </section>
    </div>
  );
}
export function Account() {
  const { user } = useAuth();
  return (
    <section className="page narrow">
      <span className="eyebrow">YOUR THENFRAME</span>
      <h1>Hello, {user.display_name}.</h1>
      <p>You are signed in as {user.email}.</p>
      <p>Booking enquiries and private albums are planned for later sprints.</p>
      <a className="button" href="/portfolio">
        Explore the portfolio
      </a>
    </section>
  );
}
