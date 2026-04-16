import { useEffect, useState } from "react";

export default function Dashboard({ setPage, user }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [stats] = useState({
    today: 12,
    success: 9,
    pending: 3,
  });

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

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [dark]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    setPage("login");
  };

  const isDark = dark;

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const textSoft = isDark ? "#94a3b8" : "#64748b";

  return (
    <div
      style={{
        ...styles.container,
        background: isDark ? "#0b1220" : "#f8fafc",
        color: isDark ? "#e5e7eb" : "#111827",
      }}
    >
      {/* TOP HEADER */}
      <div
        style={{
          ...styles.header,
          background: isDark ? "#111827" : "#0ea5e9",
        }}
      >
        <div style={styles.brand}>EVOS HUB</div>

        <div style={styles.headerRight}>
          <button
            onClick={() => setDark(!dark)}
            style={styles.iconBtn}
          >
            {dark ? "☀️" : "🌙"}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={styles.iconBtn}
          >
            ☰
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <div
        style={{
          ...styles.sidebar,
          background: isDark ? "#111827" : "#0ea5e9",
          left: menuOpen ? "0" : "-280px",
        }}
      >
        <div style={styles.sideTop}>
          <div style={styles.sideLogo}>Menu</div>
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
        {/* TITLE ROW */}
        <div style={styles.titleRow}>
          <div>
            <h2 style={styles.title}>Dashboard</h2>

            <p
              style={{
                ...styles.subtitle,
                color: textSoft,
              }}
            >
              Welcome back,{" "}
              <strong>
                {user?.username || user?.email}
              </strong>
            </p>
          </div>

          <button
            onClick={() => setDark(!dark)}
            style={{
              ...styles.smallThemeBtn,
              background: isDark ? "#1e293b" : "#ffffff",
              color: isDark ? "#ffffff" : "#111827",
            }}
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.card, background: cardBg }}>
            <h3>📅 Orders Today</h3>
            <h1>{stats.today}</h1>
          </div>

          <div style={{ ...styles.card, background: cardBg }}>
            <h3>✅ Successful</h3>
            <h1>{stats.success}</h1>
          </div>

          <div style={{ ...styles.card, background: cardBg }}>
            <h3>⏳ Pending</h3>
            <h1>{stats.pending}</h1>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={styles.grid}>
          <div
            style={{ ...styles.card, background: cardBg }}
            onClick={() => setPage("shop")}
          >
            <h3>Buy Data</h3>
            <p style={{ color: textSoft }}>
              Purchase MTN, Telecel, AirtelTigo bundles
            </p>
          </div>

          <div
            style={{ ...styles.card, background: cardBg }}
            onClick={() => setPage("orders")}
          >
            <h3>Track Orders</h3>
            <p style={{ color: textSoft }}>
              View all transactions and delivery status
            </p>
          </div>
        </div>

        {/* TRACKER */}
        <div style={{ ...styles.card, background: cardBg }}>
          <h3 style={{ marginBottom: "12px" }}>
            Live Delivery Tracker
          </h3>
          <div id="tracker"></div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            ...styles.footer,
            color: textSoft,
          }}
        >
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
    position: "relative",
    transition: "0.3s ease",
  },

  header: {
    height: "72px",
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },

  brand: {
    color: "white",
    fontWeight: "800",
    fontSize: "20px",
    letterSpacing: "0.5px",
  },

  headerRight: {
    display: "flex",
    gap: "10px",
  },

  iconBtn: {
    width: "44px",
    height: "44px",
    border: "none",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.18)",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
  },

  sidebar: {
    position: "fixed",
    top: 0,
    left: "-280px",
    width: "250px",
    height: "100vh",
    padding: "22px",
    zIndex: 1100,
    transition: "0.3s ease",
  },

  sideTop: {
    marginBottom: "25px",
  },

  sideLogo: {
    color: "white",
    fontWeight: "800",
    fontSize: "24px",
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
    background: "rgba(255,255,255,0.18)",
    color: "white",
    fontWeight: "700",
    textAlign: "left",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 1050,
  },

  main: {
    padding: "18px",
    maxWidth: "700px",
    margin: "0 auto",
  },

  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "18px",
  },

  title: {
    fontSize: "30px",
    fontWeight: "800",
    marginBottom: "6px",
  },

  subtitle: {
    fontSize: "15px",
    lineHeight: "1.4",
  },

  smallThemeBtn: {
    border: "none",
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
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
    marginBottom: "18px",
  },

  card: {
    padding: "18px",
    borderRadius: "18px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
    cursor: "pointer",
    transition: "0.2s ease",
  },

  footer: {
    textAlign: "center",
    fontSize: "13px",
    marginTop: "24px",
    paddingBottom: "20px",
  },
};
