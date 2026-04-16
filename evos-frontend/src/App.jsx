import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Success from "./pages/Success";

export default function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");

  // LOAD LOCAL STORAGE
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // THEME TOGGLE
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    setUser(null);
    setPage("home");
  };

  // NAV
  const navigate = (p) => {
    setPage(p);
    setMenuOpen(false);
  };

  // ROUTER
  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home setPage={setPage} theme={theme} />;
      case "shop":
        return <Shop user={user} theme={theme} />;
      case "orders":
        return <Orders user={user} theme={theme} />;
      case "login":
        return <Login setUser={setUser} setPage={setPage} theme={theme} />;
      case "register":
        return <Register setPage={setPage} theme={theme} />;
      case "dashboard":
        return <Dashboard user={user} setPage={setPage} theme={theme} />;
      case "success":
        return <Success theme={theme} />;
      default:
        return <Home setPage={setPage} theme={theme} />;
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
        background: isDark
          ? "linear-gradient(180deg, #0b1220, #0f172a)"
          : "linear-gradient(180deg, #e0f2fe, #f8fafc)",
        color: isDark ? "#e5e7eb" : "#0f172a",
        transition: "all 0.3s ease",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backdropFilter: "blur(14px)",
          background: isDark
            ? "rgba(15, 23, 42, 0.6)"
            : "rgba(255,255,255,0.6)",
          borderBottom: isDark
            ? "1px solid rgba(255,255,255,0.05)"
            : "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            fontWeight: "700",
            fontSize: "18px",
            cursor: "pointer",
            color: "#38bdf8",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
          onClick={() => navigate("home")}
        >
          EVOS HUB
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={toggleTheme}
            style={{
              padding: "7px 11px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
              color: "#0b1220",
              fontWeight: "600",
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              fontSize: "22px",
              cursor: "pointer",
              padding: "6px 10px",
            }}
          >
            ☰
          </div>
        </div>
      </nav>

      {/* DROPDOWN */}
      {menuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "14px",
            margin: "10px",
            borderRadius: "12px",
            background: isDark
              ? "rgba(15, 23, 42, 0.95)"
              : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)",
          }}
        >
          <button onClick={() => navigate("shop")} style={btnStyle}>
            Buy Data
          </button>

          <button onClick={() => navigate("orders")} style={btnStyle}>
            Orders
          </button>

          <button onClick={() => navigate("dashboard")} style={btnStyle}>
            Dashboard
          </button>

          {user ? (
            <button onClick={logout} style={dangerBtn}>
              Logout
            </button>
          ) : (
            <>
              <button onClick={() => navigate("login")} style={btnStyle}>
                Login
              </button>
              <button
                onClick={() => navigate("register")}
                style={primaryBtn}
              >
                Register
              </button>
            </>
          )}
        </div>
      )}

      {/* CONTENT */}
      <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {renderPage()}
      </main>
    </div>
  );
}

/* =======================
   SHARED BUTTON STYLES
======================= */

const btnStyle = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  cursor: "pointer",
  textAlign: "left",
};

const primaryBtn = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
  color: "#0b1220",
  fontWeight: "700",
  cursor: "pointer",
};

const dangerBtn = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "none",
  background: "#ef4444",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};
