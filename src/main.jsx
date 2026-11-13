import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import {
  AuthProvider,
  AuthPage,
  Protected,
  Account,
  useAuth,
} from "./auth/Auth";
import { Home, Portfolio, CollectionDetails } from "./public/Portfolio";
import { AdminHome, EditCollection } from "./gallery/Admin";
import { demo, configured } from "./lib/backend";
import "./styles.css";
function App() {
  const { user, logout } = useAuth();
  const [error, setError] = useState(""),
    [install, setInstall] = useState(null),
    [update, setUpdate] = useState(null);
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const apply = registerSW({
      onNeedRefresh() {
        setUpdate(() => apply);
      },
    });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      {demo && (
        <div className="mode-banner">
          LOCAL REHEARSAL · Simulated access · Browser-only gallery data · No
          real customer information
        </div>
      )}
      {!demo && !configured && (
        <div className="mode-banner">
          Setup needed: configure Supabase using .env.example and README.
        </div>
      )}
      <header>
        <Link to="/" className="brand">
          ThenFrame<span>PHOTOGRAPHY</span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/portfolio">Portfolio</NavLink>
          {user?.role === "admin" && <NavLink to="/admin">Studio</NavLink>}
        </nav>
        <div className="account-nav">
          {user ? (
            <>
              <Link to="/account">My account</Link>
              <button
                className="ghost"
                onClick={async () => {
                  try {
                    await logout();
                    setError("");
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <Link to="/login">Login / Register ↗</Link>
          )}
        </div>
      </header>
      {install && (
        <div className="pwa-bar">
          <button
            onClick={async () => {
              await install.prompt();
              setInstall(null);
            }}
          >
            Install ThenFrame
          </button>
        </div>
      )}
      {update && (
        <div className="pwa-bar">
          An update is ready. Save your changes first.{" "}
          <button onClick={() => update(true)}>Update app</button>
        </div>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:id" element={<CollectionDetails />} />
          <Route path="/register" element={<AuthPage register />} />
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
                <AdminHome />
              </Protected>
            }
          />
          <Route
            path="/admin/collections"
            element={
              <Protected admin>
                <AdminHome list />
              </Protected>
            }
          />
          <Route
            path="/admin/collections/new"
            element={
              <Protected admin>
                <EditCollection key="new" />
              </Protected>
            }
          />
          <Route
            path="/admin/collections/:id"
            element={
              <Protected admin>
                <EditCollection />
              </Protected>
            }
          />
          <Route
            path="*"
            element={
              <section className="page">
                <h1>Page not found.</h1>
                <Link to="/">Return home</Link>
              </section>
            }
          />
        </Routes>
      </main>
      <footer>
        <div>
          <Link className="brand" to="/">
            ThenFrame
          </Link>
          <p>Wedding stories, thoughtfully framed.</p>
        </div>
        <div>
          <span className="eyebrow">EXPLORE</span>
          <Link to="/portfolio">Wedding portfolio</Link>
          <Link to="/register">Create an account</Link>
        </div>
        <div>
          <span className="eyebrow">SPRINT 1</span>
          <p>G3-AppForge · Section 02</p>
          <Link to="/admin/login">Admin login</Link>
        </div>
        <p className="footer-note">
          University project increment · Bookings, private albums, AI and
          heritage content are planned for later sprints.
        </p>
      </footer>
    </>
  );
}
class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="page">
        <h1>Something went wrong.</h1>
        <p>Refresh the page to try again.</p>
        <a href="/">Return home</a>
      </div>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>,
);
