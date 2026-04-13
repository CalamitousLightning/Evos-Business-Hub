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

  // 🔐 AUTH
  const [userEmail, setUserEmail] = useState("");

  // 🌙 THEME (NEW)
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) setUserEmail(email);

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const logout = () => {
    localStorage.removeItem("email");
    setUserEmail("");
    setPage("home");
  };

  const navigate = (p) => {
    setPage(p);
    setMenuOpen(false);
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home setPage={setPage} theme={theme} />;
      case "shop":
        return <Shop userEmail={userEmail} theme={theme} />;
      case "orders":
        return <Orders userEmail={userEmail} theme={theme} />;
      case "login":
        return <Login setUserEmail={setUserEmail} setPage={setPage} theme={theme} />;
      case "register":
        return <Register setPage={setPage} theme={theme} />;
      case "dashboard":
        return <Dashboard userEmail={userEmail} setPage={setPage} theme={theme} />;
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
        ...styles.app,
        background: isDark ? "#0b1220" : "#f9fafb",
        color: isDark ? "#e5e7eb" : "#111827",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          ...styles.nav,
          background: isDark
            ? "rgba(15, 23, 42, 0.9)"
            : "rgba(255,255,255,0.9)",
          color: isDark ? "#e5e7eb" : "#111827",
        }}
      >
        <div style={styles.logo} onClick={() => navigate("home")}>
          EVOS HUB
        </div>

        <div style={styles.navRight}>
          {/* 🌙 THEME TOGGLE */}
          <button onClick={toggleTheme} style={styles.themeBtn}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* MENU */}
          <div style={styles.toggle} onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </div>
        </div>
      </nav>

      {/* DROPDOWN */}
      {menuOpen && (
        <div
          style={{
            ...styles.dropdown,
            background: isDark ? "#111827" : "#ffffff",
          }}
        >
          <button onClick={() => navigate("shop")} style={styles.menuBtn}>
            Buy Data
          </button>

          <button onClick={() => navigate("orders")} style={styles.menuBtn}>
            Orders
          </button>

          <button onClick={() => navigate("dashboard")} style={styles.menuBtn}>
            Dashboard
          </button>

          {userEmail ? (
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
   STYLES
======================= */
const styles = {
  app: {
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    transition: "0.3s ease",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  logo: {
    fontWeight: "bold",
    fontSize: "18px",
    cursor: "pointer",
    color: "#38bdf8",
    letterSpacing: "1px",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  toggle: {
    fontSize: "22px",
    cursor: "pointer",
  },

  themeBtn: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#38bdf8",
    color: "#0b1220",
  },

  dropdown: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "15px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  menuBtn: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
  },

  primaryBtn: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#38bdf8",
    color: "#0b1220",
    fontWeight: "bold",
    cursor: "pointer",
    textAlign: "left",
  },

  logout: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    textAlign: "left",
  },

  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
};