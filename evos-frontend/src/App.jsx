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

  // =========================
  // 🔐 SINGLE AUTH STATE (FIXED)
  // =========================
  const [user, setUser] = useState(null);

  // 🌙 THEME
  const [theme, setTheme] = useState("dark");

  // =========================
  // LOAD FROM LOCALSTORAGE
  // =========================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // =========================
  // THEME TOGGLE
  // =========================
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // =========================
  // LOGOUT FIXED
  // =========================
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("email");

    setUser(null);
    setPage("home");
  };

  // =========================
  // NAVIGATION
  // =========================
  const navigate = (p) => {
    setPage(p);
    setMenuOpen(false);
  };

  // =========================
  // PAGE ROUTER
  // =========================
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

  return (
    <div style={getAppStyle(theme)}>
      {/* NAVBAR */}
      <nav style={getNavStyle(theme)}>
        <div style={styles.logo} onClick={() => navigate("home")}>
          EVOS HUB
        </div>

        <div style={styles.navRight}>
          <button onClick={toggleTheme} style={styles.themeBtn}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <div style={styles.toggle} onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </div>
        </div>
      </nav>

      {/* DROPDOWN */}
      {menuOpen && (
        <div style={getDropdownStyle(theme)}>
          <button onClick={() => navigate("shop")} style={styles.menuBtn}>
            Buy Data
          </button>

          <button onClick={() => navigate("orders")} style={styles.menuBtn}>
            Orders
          </button>

          <button onClick={() => navigate("dashboard")} style={styles.menuBtn}>
            Dashboard
          </button>

          {user ? (
            <button onClick={logout} style={styles.logout}>
              Logout
            </button>
          ) : (
            <>
              <button onClick={() => navigate("login")} style={styles.menuBtn}>
                Login
              </button>
              <button
                onClick={() => navigate("register")}
                style={styles.primaryBtn}
              >
                Register
              </button>
            </>
          )}
        </div>
      )}

      {/* CONTENT */}
      <main style={styles.container}>{renderPage()}</main>
    </div>
  );
}


/* =======================
  STYLES (UPGRADED UI SYSTEM)
======================= */
const styles = {
  app: {
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    minHeight: "100vh",
    transition: "all 0.3s ease",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  logo: {
    fontWeight: "700",
    fontSize: "18px",
    cursor: "pointer",
    color: "#38bdf8",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  toggle: {
    fontSize: "22px",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "10px",
    transition: "0.2s ease",
  },

  themeBtn: {
    padding: "7px 11px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
    color: "#0b1220",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(56, 189, 248, 0.25)",
  },

  dropdown: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "14px",
    margin: "10px",
    borderRadius: "12px",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },

  menuBtn: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
    cursor: "pointer",
    textAlign: "left",
    transition: "0.2s ease",
  },

  primaryBtn: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
    color: "#0b1220",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(56, 189, 248, 0.25)",
  },

  logout: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    background: "#ef4444",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(239, 68, 68, 0.25)",
  },

  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
};
