import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Success from "./pages/Success";
import AgentDashboard from "./pages/AgentDashboard";
import AgentPricing from "./pages/AgentPricing";
import AgentStore from "./pages/AgentStore";
import StorePage from "./pages/StorePage";
import OrderTracking from "./pages/OrderTracking";

export default function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);

    const path = window.location.pathname;

    const routeMap = {
      "/": "home",
      "/shop": "shop",
      "/orders": "orders",
      "/dashboard": "dashboard",
      "/login": "login",
      "/register": "register",
      "/success": "success",
      "/agent-dashboard": "agent-dashboard",
      "/agent-pricing": "agent-pricing",
      "/agent-store": "agent-store",
      "/store": "store",
      "/track": "track-order",
    };

    setPage(routeMap[path] || "home");
  }, []);

  const isAgentActive =
    user?.role === "agent" &&
    user?.agent_status === "approved";

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setPage("home");
    window.history.pushState({}, "", "/");
  };

  const navigate = (p) => {
    setPage(p);
    setMenuOpen(false);

    const routes = {
      home: "/",
      shop: "/shop",
      orders: "/orders",
      dashboard: "/dashboard",
      login: "/login",
      register: "/register",
      success: "/success",
      "agent-dashboard": "/agent-dashboard",
      "agent-pricing": "/agent-pricing",
      "agent-store": "/agent-store",
      store: "/store",
      "track-order": "/track",
    };

    window.history.pushState({}, "", routes[p] || "/");
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home setPage={navigate} theme={theme} />;

      case "shop":
        return <Shop user={user} theme={theme} />;

      case "orders":
        return <Orders user={user} theme={theme} />;

      case "login":
        return <Login setUser={setUser} setPage={navigate} theme={theme} />;

      case "register":
        return <Register setPage={navigate} theme={theme} />;

      case "dashboard":
        return <Dashboard user={user} setPage={navigate} theme={theme} />;

      case "agent-dashboard":
        return <AgentDashboard user={user} setPage={navigate} theme={theme} />;

      case "agent-pricing":
        return <AgentPricing user={user} setPage={navigate} />;

      case "agent-store":
        return <AgentStore user={user} setPage={navigate} />;

      case "store":
        return <StorePage setPage={navigate} />;

      case "track-order":
        return <OrderTracking user={user} setPage={navigate} />;

      case "success":
        return <Success theme={theme} />;

      default:
        return <Home setPage={navigate} theme={theme} />;
    }
  };

  const isDark = theme === "dark";

  return (
    <div style={appStyle(isDark)}>
      <div style={overlayStyle(isDark)} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* NAV */}
        <nav style={navStyle(isDark)}>
          <div style={logoStyle} onClick={() => navigate("home")}>
            EVOS HUB
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={toggleTheme} style={themeBtn}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <div onClick={() => setMenuOpen(!menuOpen)} style={menuIcon}>
              ☰
            </div>
          </div>
        </nav>

        {/* MENU */}
        {menuOpen && (
          <div style={dropdownStyle(isDark)}>
            <button onClick={() => navigate("shop")} style={menuBtn(isDark)}>
              Buy Data
            </button>

            <button onClick={() => navigate("orders")} style={menuBtn(isDark)}>
              Orders
            </button>

            <button onClick={() => navigate("dashboard")} style={menuBtn(isDark)}>
              Dashboard
            </button>

            {user && (
              <button
                onClick={() => navigate("agent-dashboard")}
                style={agentBtn}
              >
                {isAgentActive ? "🚀 Agent Dashboard" : "🚀 Become Agent"}
              </button>
            )}

            {user ? (
              <button onClick={logout} style={dangerBtn}>
                Logout
              </button>
            ) : (
              <>
                <button onClick={() => navigate("login")} style={menuBtn(isDark)}>
                  Login
                </button>

                <button onClick={() => navigate("register")} style={primaryBtn}>
                  Register
                </button>
              </>
            )}
          </div>
        )}

        {/* PAGE */}
        <main style={contentStyle}>{renderPage()}</main>
      </div>
    </div>
  );
}

/* ================= UI STYLES ================= */

const appStyle = (dark) => ({
  minHeight: "100vh",
  fontFamily: "system-ui",
  backgroundImage: "url('/evosdata.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundColor: dark ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.35)",
  color: dark ? "#e5e7eb" : "#0f172a",
});

const overlayStyle = (dark) => ({
  position: "fixed",
  inset: 0,
  background: dark
    ? "rgba(0,0,0,0.6)"
    : "rgba(255,255,255,0.2)",
  zIndex: 0,
  pointerEvents: "none",
});

const navStyle = (dark) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: 14,
  position: "sticky",
  top: 0,
  backdropFilter: "blur(12px)",
  background: dark ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.7)",
});

const logoStyle = { color: "#38bdf8", fontWeight: 800, cursor: "pointer" };
const themeBtn = { padding: 8, borderRadius: 8, border: "none" };
const menuIcon = { fontSize: 22, cursor: "pointer" };

const dropdownStyle = (dark) => ({
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 14,
  margin: 10,
  borderRadius: 12,
  background: dark ? "#0f172a" : "#fff",
});

const menuBtn = (dark) => ({
  padding: 10,
  borderRadius: 8,
  border: "none",
  background: dark ? "#1e293b" : "#f1f5f9",
  color: dark ? "#fff" : "#000",
  textAlign: "left",
});

const primaryBtn = {
  padding: 10,
  background: "#38bdf8",
  border: "none",
  borderRadius: 8,
};

const agentBtn = {
  padding: 10,
  background: "linear-gradient(135deg,#22c55e,#16a34a)",
  border: "none",
  borderRadius: 8,
  color: "white",
  fontWeight: 700,
};

const dangerBtn = {
  padding: 10,
  background: "#ef4444",
  border: "none",
  borderRadius: 8,
  color: "white",
};

const contentStyle = {
  padding: 20,
  maxWidth: 1200,
  margin: "0 auto",
};
