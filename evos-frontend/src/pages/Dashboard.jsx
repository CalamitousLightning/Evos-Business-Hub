import { useEffect, useState } from "react";

export default function Dashboard({ setPage, user }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // demo stats
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
          ...styles.mobileHeader,
          background: isDark ? "#111827" : "#0ea5e9",
        }}
      >
        <div style={styles.headerBrand}>EVOS HUB</div>

        <div style={styles.headerActions}>
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

      {/* SIDEBAR / DRAWER */}
      <div
        style={{
          ...styles.sidebar,
          background: isDark ? "#111827" : "#0ea5e9",
          left: menuOpen ? "0" : "-280px",
        }}
      >
        <div style={styles.logoBox}>
          <div style={styles.logo}>EVOS</div>
          <small style={{ color: "white" }}>
            Powered by Evos Technologies
          </small>
          <small style={{ color: "white", opacity: 0.8 }}>
            (Evosgpt, SOE)
          </small>
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
          <div
            style={{
              ...styles.card,
              background: isDark ? "#1e293b" : "#ffffff",
            }}
          >
            <h3>📅 Orders Today</h3>
            <h1>{stats.today}</h1>
          </div>

          <div
            style={{
              ...styles.card,
              background: isDark ? "#1e293b" : "#ffffff",
            }}
          >
            <h3>✅ Successful</h3>
            <h1>{stats.success}</h1>
          </div>

          <div
            style={{
              ...styles.card,
              background: isDark ? "#1e293b" : "#ffffff",
            }}
          >
            <h3>⏳ Pending</h3>
            <h1>{stats.pending}</h1>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={styles.grid}>
          <div
            style={{
              ...styles.card,
              background: isDark ? "#1e293b" : "#ffffff",
            }}
            onClick={() => setPage("shop")}
          >
            <h3>Buy Data</h3>
            <p>Purchase MTN, Telecel, AirtelTigo bundles</p>
          </div>

          <div
            style={{
              ...styles.card,
              background: isDark ? "#1e293b" : "#ffffff",
            }}
            onClick={() => setPage("orders")}
          >
            <h3>Track Orders</h3>
            <p>View all transactions and delivery status</p>
          </div>
        </div>

        {/* TRACKER */}
        <div
          style={{
            ...styles.card,
            background: isDark ? "#1e293b" : "#ffffff",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>
            Live Delivery Tracker
          </h3>

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
    position: "relative",
  },

  mobileHeader: {
    height: "70px",
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },

  headerBrand: {
    color: "white",
    fontSize: "28px",
    fontWeight: "800",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
  },

  iconBtn: {
    width: "46px",
    height: "46px",
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
    zIndex: 1100,
    transition: "0.3s ease",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 1050,
  },

  logoBox: {
    marginBottom: "25px",
  },

  logo: {
    fontSize: "28px",
    fontWeight: "800",
    color: "white",
    marginBottom: "8px",
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
    cursor: "pointer",
    textAlign: "left",
  },

  main: {
    padding: "18px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "6px",
  },

  subtitle: {
    marginBottom: "18px",
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
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    cursor: "pointer",
  },
};
