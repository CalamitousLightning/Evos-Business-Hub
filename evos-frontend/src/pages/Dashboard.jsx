import { useEffect, useState } from "react";

export default function Dashboard({ setPage, user }) {
  const [dark, setDark] = useState(false); // default light mode

  // demo stats (replace later with API values)
  const [stats] = useState({
    today: 12,
    success: 9,
    pending: 3,
  });

  // AUTH GUARD
  useEffect(() => {
    if (!user) {
      setPage("login");
    }
  }, [user, setPage]);

  // TRACKER SCRIPT
  useEffect(() => {
    const container = document.getElementById("tracker");
    if (!container) return;

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://api.datamartgh.shop/widgets/delivery-tracker.js";
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

  return (
    <div
      style={{
        ...styles.container,
        background: isDark ? "#0b1220" : "#f8fafc",
        color: isDark ? "#e5e7eb" : "#111827",
      }}
    >
      {/* SIDEBAR / TOP NAV MOBILE */}
      <div
        style={{
          ...styles.sidebar,
          background: isDark ? "#111827" : "#0ea5e9",
        }}
      >
        <div style={styles.logoBox}>
          <div style={styles.logo}>EVOS</div>
          <small style={{ color: "white" }}>Hub</small>
        </div>

        <div style={styles.navWrap}>
          <button style={styles.navBtn} onClick={() => setPage("shop")}>
            📦 Buy Data
          </button>

          <button style={styles.navBtn} onClick={() => setPage("orders")}>
            📡 Orders
          </button>

          <button style={styles.navBtn} onClick={logout}>
            🚪 Logout
          </button>

          <button
            style={styles.themeBtn}
            onClick={() => setDark(!dark)}
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h2 style={styles.title}>Dashboard</h2>

        <p
          style={{
            ...styles.subtitle,
            color: isDark ? "#94a3b8" : "#64748b",
          }}
        >
          Welcome back, {user?.username || user?.email}
        </p>

        {/* STATS */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>📅 Orders Today</h3>
            <h1>{stats.today}</h1>
          </div>

          <div style={styles.statCard}>
            <h3>✅ Successful</h3>
            <h1>{stats.success}</h1>
          </div>

          <div style={styles.statCard}>
            <h3>⏳ Pending</h3>
            <h1>{stats.pending}</h1>
          </div>
        </div>

        {/* ACTION CARDS */}
        <div style={styles.grid}>
          <div style={styles.card} onClick={() => setPage("shop")}>
            <h3>Buy Data</h3>
            <p>Purchase MTN, Telecel, AirtelTigo bundles</p>
          </div>

          <div style={styles.card} onClick={() => setPage("orders")}>
            <h3>Track Orders</h3>
            <p>View all transactions and delivery status</p>
          </div>
        </div>

        {/* TRACKER */}
        <div style={styles.trackerBox}>
          <h3 style={{ marginBottom: "12px" }}>Live Delivery Tracker</h3>
          <div id="tracker"></div>
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
    display: "flex",
    flexWrap: "wrap",
  },

  sidebar: {
    width: "240px",
    minHeight: "100vh",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  logoBox: {
    textAlign: "center",
    marginBottom: "10px",
  },

  logo: {
    fontSize: "26px",
    fontWeight: "800",
    color: "white",
    letterSpacing: "1px",
  },

  navWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  navBtn: {
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "rgba(255,255,255,0.18)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },

  themeBtn: {
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "white",
    color: "#111827",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "8px",
  },

  main: {
    flex: 1,
    padding: "24px",
    minWidth: "0",
  },

  title: {
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "6px",
  },

  subtitle: {
    marginBottom: "20px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
    gap: "15px",
    marginBottom: "22px",
  },

  statCard: {
    background: "white",
    padding: "18px",
    borderRadius: "16px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
    gap: "15px",
    marginBottom: "22px",
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
    cursor: "pointer",
  },

  trackerBox: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
  },
};
