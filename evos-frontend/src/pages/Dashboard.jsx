import { useEffect, useState } from "react";

export default function Dashboard({ setPage, user }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔥 LIVE DATAMART STATE
  const [tracker, setTracker] = useState(null);
  const [loadingTracker, setLoadingTracker] = useState(true);

  // AUTH GUARD
  useEffect(() => {
    if (!user) setPage("login");
  }, [user, setPage]);

  // 📡 DATAMART WIDGET SCRIPT
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

  // ⚡ LIVE API TRACKER (CONTROL CENTER FEED)
  useEffect(() => {
    const fetchTracker = async () => {
      try {
        const res = await fetch(
          "https://api.datamartgh.shop/delivery-tracker"
        );
        const data = await res.json();

        setTracker(data.data);
        setLoadingTracker(false);
      } catch (err) {
        console.log("Tracker error:", err);
      }
    };

    fetchTracker();
    const interval = setInterval(fetchTracker, 15000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 SCANNER STATUS ENGINE
  const getScannerStatus = () => {
    if (!tracker?.scanner) return "UNKNOWN";

    if (tracker.scanner.active) return "ACTIVE 🟢";
    if (tracker.scanner.waiting) return "WAITING ⏳";
    return "IDLE 🔴";
  };

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

          <button style={styles.logoutBtn} onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* OVERLAY */}
      {menuOpen && (
        <div style={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}

      {/* MAIN */}
      <div style={styles.main}>
        {/* WELCOME */}
        <div style={styles.hero}>
          <div>
            <h1 style={styles.heroTitle}>Welcome back</h1>
            <p style={{ ...styles.heroText, color: soft }}>
              <strong>{user?.username || user?.email}</strong>
            </p>
          </div>
        </div>

        {/* 🔥 DATAMART CONTROL PANEL */}
        <div
          style={{
            ...styles.card,
            background: cardBg,
            border: "1px solid rgba(14,165,233,0.3)",
            marginTop: "12px",
          }}
        >
          <h3>⚡ Live Datamart System</h3>

          {loadingTracker ? (
            <p style={{ color: soft }}>Connecting scanner...</p>
          ) : (
            <>
              <p>
                <b>Status:</b> {getScannerStatus()}
              </p>

              <p style={{ color: soft }}>{tracker?.message}</p>

              <div style={styles.statRow}>
                <div>📦 Checked: {tracker?.stats?.checked}</div>
                <div>✅ Delivered: {tracker?.stats?.delivered}</div>
                <div>⏳ Pending: {tracker?.stats?.pending}</div>
                <div>❌ Failed: {tracker?.stats?.failed}</div>
              </div>

              <hr style={{ opacity: 0.2 }} />

              <p>
                <b>Last Delivered:</b>
              </p>
              <p style={{ color: soft }}>
                {tracker?.lastDelivered?.summary}
              </p>

              <p>
                <b>Current Batch:</b>
              </p>
              <p style={{ color: soft }}>
                {tracker?.checkingNow?.summary}
              </p>
            </>
          )}
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

        {/* WIDGET TRACKER */}
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
    background: "radial-gradient(circle at top, rgba(14,165,233,0.12), transparent 50%)",
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
    backdropFilter: "blur(18px)",
    background: "rgba(15,23,42,0.75)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },

  brand: {
    color: "#38bdf8",
    fontWeight: "900",
    fontSize: "22px",
    letterSpacing: "1px",
  },

  menuBtn: {
    width: "44px",
    height: "44px",
    border: "none",
    borderRadius: "14px",
    background: "rgba(56,189,248,0.18)",
    color: "#38bdf8",
    fontSize: "20px",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
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
    background: "rgba(15,23,42,0.95)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
  },

  sideTitle: {
    color: "#38bdf8",
    fontSize: "24px",
    fontWeight: "900",
    marginBottom: "6px",
  },

  sideSmall: {
    color: "rgba(255,255,255,0.7)",
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
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    fontWeight: "700",
    textAlign: "left",
    cursor: "pointer",
    transition: "0.2s",
  },

  logoutBtn: {
    padding: "13px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg,#ef4444,#b91c1c)",
    color: "white",
    fontWeight: "800",
    textAlign: "left",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(2px)",
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
    fontWeight: "900",
    marginBottom: "4px",
    color: "#e5e7eb",
  },

  heroText: {
    fontSize: "15px",
  },

  sectionTitle: {
    fontSize: "14px",
    fontWeight: "800",
    marginBottom: "12px",
    marginTop: "10px",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: "0.5px",
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
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    cursor: "pointer",
    backdropFilter: "blur(14px)",
    transition: "0.2s ease",
  },

  bigNumber: {
    fontSize: "34px",
    fontWeight: "900",
    marginTop: "8px",
    color: "#38bdf8",
  },

  footer: {
    textAlign: "center",
    fontSize: "12px",
    marginTop: "26px",
    paddingBottom: "24px",
    color: "rgba(255,255,255,0.5)",
  },
};
