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
import AgentWithdraw from "./pages/AgentWithdraw";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import StorePage from "./pages/StorePage";
import OrderTracking from "./pages/OrderTracking";
import ETATrack from "./pages/ETATrack";

export default function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Always dark — brand is built for dark
  const theme = "dark";

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    detectRoute();

    window.addEventListener("popstate", detectRoute);
    return () => {
      window.removeEventListener("popstate", detectRoute);
    };
  }, []);

  // =========================
  // ROUTE DETECTOR
  // =========================
  const detectRoute = () => {
    const path = window.location.pathname;

    if (path.startsWith("/store/")) {
      setPage("store");
      return;
    }

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
      "/agent-withdraw": "agent-withdraw",
      "/admin-withdrawals": "admin-withdrawals",
      "/track": "track-order",
      "/eta-track": "eta-track",
    };

    setPage(routeMap[path] || "home");
  };

  const isAgentActive = user?.role === "agent" && user?.agent_status === "approved";
  const isAdmin = user?.role === "admin";

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("home");
  };

  // =========================
  // NAVIGATE
  // =========================
  const navigate = (target) => {
    setMenuOpen(false);
    setPage(target);

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
      "agent-withdraw": "/agent-withdraw",
      "admin-withdrawals": "/admin-withdrawals",
      store: "/store",
      "track-order": "/track",
      "eta-track": "/eta-track",
      "order-tracking": "/eta-track",
    };

    window.history.pushState({}, "", routes[target] || "/");
  };

  // =========================
  // PAGE RENDER
  // =========================
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
      case "agent-withdraw":
        return <AgentWithdraw user={user} setPage={navigate} />;
      case "admin-withdrawals":
        return <AdminWithdrawals user={user} setPage={navigate} />;
      case "store":
        return <StorePage setPage={navigate} theme={theme} />;
      case "track-order":
        return <OrderTracking user={user} setPage={navigate} />;
      case "success":
        return <Success theme={theme} />;
      case "eta-track":
      case "order-tracking":
        return <ETATrack setPage={navigate} />;
      default:
        return <Home setPage={navigate} theme={theme} />;
    }
  };

  return (
    <div style={appStyle}>
      {/* Dark overlay over background image */}
      <div style={overlayStyle} />

      <div style={{ position: "relative", zIndex: 2 }}>

        {/* ======= NAVBAR ======= */}
        <nav style={navStyle}>

          {/* LOGO + BRAND */}
          <div style={logoWrap} onClick={() => navigate("home")}>
            <img
              src="/evosdata.png"
              alt="EVOS Logo"
              style={logoImg}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div style={brandText}>
              <span style={brandName}>EVOSDATA</span>
              <span style={brandSub}>by EVOS Business HUB</span>
            </div>
          </div>

          {/* MENU ICON */}
          <div
            style={menuIconStyle}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </div>
        </nav>

        {/* ======= DROPDOWN MENU ======= */}
        {menuOpen && (
          <div style={dropdownStyle}>
            <button onClick={() => navigate("shop")} style={menuBtn}>🛒 Buy Data</button>
            <button onClick={() => navigate("orders")} style={menuBtn}>📦 Orders</button>
            <button onClick={() => navigate("dashboard")} style={menuBtn}>📊 Dashboard</button>
            <button onClick={() => navigate("eta-track")} style={menuBtn}>📍 Track Order</button>

            {user && (
              <button onClick={() => navigate("agent-dashboard")} style={agentBtn}>
                {isAgentActive ? "🚀 Agent Dashboard" : "🚀 Become Agent"}
              </button>
            )}

            {isAgentActive && (
              <button onClick={() => navigate("agent-withdraw")} style={menuBtn}>
                💳 Withdraw
              </button>
            )}

            {isAdmin && (
              <button onClick={() => navigate("admin-withdrawals")} style={menuBtn}>
                🛠 Withdrawals
              </button>
            )}

            <div style={menuDivider} />

            {user ? (
              <button onClick={logout} style={dangerBtn}>🚪 Logout</button>
            ) : (
              <>
                <button onClick={() => navigate("login")} style={menuBtn}>Login</button>
                <button onClick={() => navigate("register")} style={primaryBtn}>Register</button>
              </>
            )}
          </div>
        )}

        {/* ======= PAGE CONTENT ======= */}
        <main style={contentStyle}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const appStyle = {
  minHeight: "100vh",
  fontFamily: "ui-sans-serif, system-ui, Arial",
  backgroundImage: "url('/evosdata.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundColor: "#020617",
  color: "#e5e7eb",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,0.82)",
  zIndex: 0,
  pointerEvents: "none",
};

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 16px",
  position: "sticky",
  top: 0,
  zIndex: 100,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(2,6,23,0.75)",
  borderBottom: "1px solid rgba(56,189,248,0.12)",
  boxShadow: "0 2px 20px rgba(0,0,0,0.4)",
};

const logoWrap = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  cursor: "pointer",
};

const logoImg = {
  width: 36,
  height: 36,
  objectFit: "contain",
  borderRadius: 8,
};

const brandText = {
  display: "flex",
  flexDirection: "column",
  lineHeight: 1.2,
};

const brandName = {
  color: "#38bdf8",
  fontWeight: 900,
  fontSize: 16,
  letterSpacing: "1px",
};

const brandSub = {
  color: "#475569",
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};

const menuIconStyle = {
  fontSize: 20,
  cursor: "pointer",
  color: "#e5e7eb",
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontWeight: 700,
};

const dropdownStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 16,
  margin: "0 10px 10px",
  borderRadius: 16,
  background: "rgba(15,23,42,0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(56,189,248,0.12)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
};

const menuBtn = {
  padding: "11px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.04)",
  color: "#e5e7eb",
  textAlign: "left",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const primaryBtn = {
  padding: "11px 14px",
  background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
  border: "none",
  borderRadius: 10,
  color: "#000",
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
};

const agentBtn = {
  padding: "11px 14px",
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  border: "none",
  borderRadius: 10,
  color: "white",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  textAlign: "left",
};

const dangerBtn = {
  padding: "11px 14px",
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: 10,
  color: "#f87171",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  textAlign: "left",
};

const menuDivider = {
  height: 1,
  background: "rgba(255,255,255,0.06)",
  margin: "2px 0",
};

const contentStyle = {
  padding: 20,
  maxWidth: 1200,
  margin: "0 auto",
};
