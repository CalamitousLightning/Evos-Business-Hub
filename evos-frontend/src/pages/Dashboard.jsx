import { useEffect, useState } from "react";

export default function Dashboard({ setPage, user }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // AUTH GUARD
  useEffect(() => {
    if (!user) setPage("login");
  }, [user, setPage]);

  // TRACKER SCRIPT
  useEffect(() => {
    const container = document.getElementById("tracker");
    if (!container) return;

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://api.datamartgh.shop/widgets/delivery-tracker.js";
    script.async = true;

    script.setAttribute("data-api-key", "YOUR_API_KEY");
    script.setAttribute("data-theme", dark ? "dark" : "light");
    script.setAttribute("data-container", "tracker");

    document.body.appendChild(script);

    return () => {
      const existing = document.querySelector(
        'script[src="https://api.datamartgh.shop/widgets/delivery-tracker.js"]'
      );

      if (existing) existing.remove();

      container.innerHTML = "";
    };
  }, [dark]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    setPage("login");
  };

  const isDark = dark;

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const text = isDark ? "#e5e7eb" : "#111827";
  const soft = isDark ? "#94a3b8" : "#64748b";
  const header = isDark ? "#111827" : "#0ea5e9";

  return (
    <div
      style={{
        ...styles.container,
        background: bg,
        color: text,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          ...styles.header,
          background: header,
        }}
      >
        <div style={styles.brand}>Dashboard</div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={styles.menuBtn}
        >
          ☰
        </button>
      </div>

      {/* SIDEBAR */}
      <div
        style={{
          ...styles.sidebar,
          background: header,
          left: menuOpen ? "0" : "-280px",
        }}
      >
        <div style={styles.sideTitle}>EVOS HUB</div>
        <div style={styles.sideSmall}>
          Powered by Evos Technologies
        </div>

        <div style={styles.navWrap}>
          <button
            style={styles.navBtn}
            onClick={() => {
              setPage("shop");
              setMenuOpen(false);
            }}
          >
            📦 Buy Data
          </button>

          <button
            style={styles.navBtn}
            onClick={() => {
              setPage("orders");
              setMenuOpen(false);
            }}
          >
            📡 Orders
          </button>

          <button
            style={styles.navBtn}
            onClick={() => setDark(!dark)}
          >
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <button
            style={styles.logoutBtn}
            onClick={logout}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          style={styles.overlay}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MAIN */}
      <div style={styles.main}>
        {/* WELCOME */}
        <div style={styles.hero}>
          <div>
            <h1 style={styles.heroTitle}>Welcome back</h1>
            <p style={{ ...styles.heroText, color: soft }}>
              <strong>
                {user?.username || user?.email}
              </strong>
            </p>
          </div>
        </div>

        

        {/* ACTIONS */}
        <div style={styles.sectionTitle}>Quick Actions</div>

        <div style={styles.grid}>
          <div
            style={{ ...styles.card, background: cardBg }}
            onClick={() => setPage("shop")}
          >
            <h3>Buy Data</h3>
            <p style={{ color: soft }}>
              Purchase MTN, Telecel & AirtelTigo bundles
            </p>
          </div>

          <div
            style={{ ...styles.card, background: cardBg }}
            onClick={() => setPage("orders")}
          >
            <h3>Track Orders</h3>
            <p style={{ color: soft }}>
              Monitor transactions and delivery
            </p>
          </div>
        </div>

        {/* TRACKER */}
        <div
          style={{
            ...styles.card,
            background: cardBg,
            marginTop: "16px",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>
            Live Delivery Tracker
          </h3>
          <div id="tracker"></div>
        </div>

        {/* FOOTER */}
        <div style={{ ...styles.footer, color: soft }}>
          © Copyright 2026, Evos Technologies
        </div>
      </div>
    </div>
  );
}

/* =======================
   STYLES
======================= */

const styles = {
  container: {
    minHeight: "100vh",
    transition: "0.3s ease",
  },

  header: {
    height: "70px",
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
  },

  brand: {
    color: "white",
    fontWeight: "800",
    fontSize: "22px",
  },

  menuBtn: {
    width: "44px",
    height: "44px",
    border: "none",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.18)",
    color: "white",
    fontSize: "20px",
    cursor: "pointer",
  },

  sidebar: {
    position: "fixed",
    top: 0,
    left: "-280px",
    width: "260px",
    height: "100vh",
    padding: "22px",
    zIndex: 1200,
    transition: "0.3s ease",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },

  sideTitle: {
    color: "white",
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "6px",
  },

  sideSmall: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    marginBottom: "24px",
  },

  navWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  navBtn: {
    padding: "13px",
    border: "none",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.16)",
    color: "white",
    fontWeight: "700",
    textAlign: "left",
    cursor: "pointer",
  },

  logoutBtn: {
    padding: "13px",
    border: "none",
    borderRadius: "14px",
    background: "#ef4444",
    color: "white",
    fontWeight: "700",
    textAlign: "left",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 1100,
  },

  main: {
    padding: "18px",
    maxWidth: "760px",
    margin: "0 auto",
  },

  hero: {
    marginBottom: "18px",
  },

  heroTitle: {
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "4px",
  },

  heroText: {
    fontSize: "15px",
  },

  sectionTitle: {
    fontSize: "15px",
    fontWeight: "700",
    marginBottom: "12px",
    marginTop: "6px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "14px",
    marginBottom: "18px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "14px",
  },

  card: {
    padding: "18px",
    borderRadius: "18px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
    cursor: "pointer",
  },

  bigNumber: {
    fontSize: "34px",
    fontWeight: "800",
    marginTop: "8px",
  },

  footer: {
    textAlign: "center",
    fontSize: "13px",
    marginTop: "24px",
    paddingBottom: "24px",
  },
};
