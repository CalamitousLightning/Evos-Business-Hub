import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Success from "./pages/Success";
import AgentDashboard from "./pages/AgentDashboard";

export default function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const path = window.location.pathname;

    if (path === "/success") setPage("success");
    else if (path === "/orders") setPage("orders");
    else if (path === "/dashboard") setPage("dashboard");
    else if (path === "/shop") setPage("shop");
    else if (path === "/login") setPage("login");
    else if (path === "/register") setPage("register");
    else if (path === "/agent-dashboard")
      setPage("agent-dashboard");
    else setPage("home");
  }, []);

  const toggleTheme = () => {
    const newTheme =
      theme === "dark" ? "light" : "dark";

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("email");

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
      "agent-dashboard":
        "/agent-dashboard",
    };

    window.history.pushState(
      {},
      "",
      routes[p] || "/"
    );
  };

  const isDark = theme === "dark";

  const isAgentActive =
    user?.role === "agent" &&
    user?.agent_status === "approved";

  const renderPage = () => {
    switch (page) {
      case "home":
        return (
          <Home
            setPage={navigate}
            theme={theme}
          />
        );

      case "shop":
        return (
          <Shop
            user={user}
            theme={theme}
          />
        );

      case "orders":
        return (
          <Orders
            user={user}
            theme={theme}
          />
        );

      case "login":
        return (
          <Login
            setUser={setUser}
            setPage={navigate}
            theme={theme}
          />
        );

      case "register":
        return (
          <Register
            setPage={navigate}
            theme={theme}
          />
        );

      case "dashboard":
        return (
          <Dashboard
            user={user}
            setPage={navigate}
            theme={theme}
          />
        );

      case "agent-dashboard":
        return (
          <AgentDashboard
            user={user}
            setPage={navigate}
            theme={theme}
          />
        );

      case "success":
        return (
          <Success theme={theme} />
        );

      default:
        return (
          <Home
            setPage={navigate}
            theme={theme}
          />
        );
    }
  };

  return (
    <div style={appStyle(isDark)}>
      {/* GLOBAL LAYER */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: isDark
            ? "radial-gradient(circle at top, rgba(0,0,0,0.55), rgba(0,0,0,0.85))"
            : "rgba(255,255,255,0.25)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* NAVBAR */}
        <nav style={navStyle(isDark)}>
          <div
            style={logoStyle}
            onClick={() =>
              navigate("home")
            }
          >
            EVOS HUB
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
              onClick={toggleTheme}
              style={themeBtn}
            >
              {theme === "dark"
                ? "☀️"
                : "🌙"}
            </button>

            <div
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
              style={menuIcon}
            >
              ☰
            </div>
          </div>
        </nav>

        {/* MENU */}
        {menuOpen && (
          <div
            style={dropdownStyle(
              isDark
            )}
          >
            <button
              onClick={() =>
                navigate("shop")
              }
              style={menuBtn(
                isDark
              )}
            >
              Buy Data
            </button>

            <button
              onClick={() =>
                navigate("orders")
              }
              style={menuBtn(
                isDark
              )}
            >
              Orders
            </button>

            <button
              onClick={() =>
                navigate(
                  "dashboard"
                )
              }
              style={menuBtn(
                isDark
              )}
            >
              Dashboard
            </button>

            {/* AGENT HUB */}
            {user && (
              <button
                onClick={() =>
                  navigate(
                    "agent-dashboard"
                  )
                }
                style={agentBtn}
              >
                {isAgentActive
                  ? "🚀 Agent Dashboard"
                  : "🚀 Become Agent"}
              </button>
            )}

            {user ? (
              <button
                onClick={logout}
                style={dangerBtn}
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  onClick={() =>
                    navigate(
                      "login"
                    )
                  }
                  style={menuBtn(
                    isDark
                  )}
                >
                  Login
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "register"
                    )
                  }
                  style={
                    primaryBtn
                  }
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}

        {/* CONTENT */}
        <main
          style={contentStyle}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

/* =======================
   STYLES
======================= */

const appStyle = (dark) => ({
  minHeight: "100vh",
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
  backgroundImage:
    "url('/evosdata.png')",
  backgroundSize: "cover",
  backgroundPosition:
    "center",
  backgroundRepeat:
    "no-repeat",
  position: "relative",
  backgroundBlendMode:
    "overlay",
  backgroundColor: dark
    ? "rgba(0,0,0,0.65)"
    : "rgba(255,255,255,0.35)",
  color: dark
    ? "#e5e7eb"
    : "#0f172a",
  transition: "0.3s ease",
});

const navStyle = (dark) => ({
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  padding: "14px 20px",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  backdropFilter:
    "blur(14px)",
  background: dark
    ? "rgba(15,23,42,0.6)"
    : "rgba(255,255,255,0.7)",
});

const logoStyle = {
  fontWeight: "700",
  fontSize: "18px",
  cursor: "pointer",
  color: "#38bdf8",
};

const themeBtn = {
  padding: "7px 11px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background:
    "linear-gradient(135deg,#38bdf8,#0ea5e9)",
  color: "#0b1220",
  fontWeight: "700",
};

const menuIcon = {
  fontSize: "22px",
  cursor: "pointer",
  padding: "6px 10px",
};

const dropdownStyle = (dark) => ({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  padding: "14px",
  margin: "10px",
  borderRadius: "12px",
  background: dark
    ? "rgba(15,23,42,0.95)"
    : "rgba(255,255,255,0.95)",
});

const menuBtn = (dark) => ({
  padding: "10px 12px",
  borderRadius: "10px",
  border: "none",
  background: dark
    ? "rgba(255,255,255,0.05)"
    : "rgba(0,0,0,0.05)",
  color: dark
    ? "#e5e7eb"
    : "#0f172a",
  textAlign: "left",
  cursor: "pointer",
});

const primaryBtn = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "none",
  background:
    "linear-gradient(135deg,#38bdf8,#0ea5e9)",
  color: "#0b1220",
  fontWeight: "700",
  cursor: "pointer",
};

const agentBtn = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "none",
  background:
    "linear-gradient(135deg,#22c55e,#16a34a)",
  color: "white",
  fontWeight: "800",
  cursor: "pointer",
  textAlign: "left",
};

const dangerBtn = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "none",
  background: "#ef4444",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
};

const contentStyle = {
  padding: "20px",
  maxWidth: "1200px",
  margin: "0 auto",
};
