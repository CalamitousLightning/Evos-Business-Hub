import { useEffect, useState } from "react";

export default function Dashboard({ setPage, user }) {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  // AUTH GUARD
  useEffect(() => {
    if (!user) setPage("login");
  }, [user, setPage]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    setPage("login");
  };

  const isDark = dark;

  const bg = isDark ? "#020617" : "#f8fafc";
  const cardBg = isDark ? "#0f172a" : "#ffffff";
  const text = isDark ? "#e5e7eb" : "#111827";
  const soft = isDark ? "#94a3b8" : "#64748b";
  const header = isDark ? "#0f172a" : "#0ea5e9";

  // TEMP STATS (replace with backend API later)
  const stats = {
    delivered: 128,
    pending: 7,
    failed: 2,
    total: 137,
  };

  const successRate = Math.round(
    (stats.delivered / stats.total) * 100
  );

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
        <div style={styles.brand}>EVOS HUB</div>

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
            📜 Orders
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
        {/* HERO */}
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Welcome back</h1>

          <p style={{ ...styles.heroText, color: soft }}>
            {user?.username || user?.email}
          </p>

          <div style={styles.onlineWrap}>
            <span style={styles.dot}></span>
            <span style={{ color: soft }}>
              System Online
            </span>
          </div>
        </div>

        {/* STATS */}
        <div style={styles.sectionTitle}>
          Performance Overview
        </div>

        <div style={styles.grid2}>
          <div style={{ ...styles.card, background: cardBg }}>
            <div style={styles.small}>Delivered</div>
            <div style={styles.bigNumber}>
              {stats.delivered}
            </div>
          </div>

          <div style={{ ...styles.card, background: cardBg }}>
            <div style={styles.small}>Pending</div>
            <div style={styles.bigNumber}>
              {stats.pending}
            </div>
          </div>

          <div style={{ ...styles.card, background: cardBg }}>
            <div style={styles.small}>Failed</div>
            <div style={styles.bigNumber}>
              {stats.failed}
            </div>
          </div>

          <div style={{ ...styles.card, background: cardBg }}>
            <div style={styles.small}>Success Rate</div>
            <div style={styles.bigNumber}>
              {successRate}%
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={styles.sectionTitle}>
          Quick Actions
        </div>

        <div style={styles.grid}>
          <div
            style={{ ...styles.card, background: cardBg }}
            onClick={() => setPage("shop")}
          >
            <h3>📦 Buy Data</h3>
            <p style={{ color: soft }}>
              Purchase all network bundles
            </p>
          </div>

          <div
            style={{ ...styles.card, background: cardBg }}
            onClick={() => setPage("orders")}
          >
            <h3>📜 Orders</h3>
            <p style={{ color: soft }}>
              View your transaction history
            </p>
          </div>

          <div
            style={{ ...styles.card, background: cardBg }}
            onClick={() => setPage("orders")}
          >
            <h3>🚚 Track Delivery</h3>
            <p style={{ color: soft }}>
              Check delivery progress
            </p>
          </div>

          <div
            style={{ ...styles.card, background: cardBg }}
            onClick={() => setSupportOpen(true)}
          >
            <h3>💬 Support</h3>
            <p style={{ color: soft }}>
              Help center & how to buy
            </p>
          </div>

          <div style={{ ...styles.card, background: cardBg }}>
            <h3>📱 USSD</h3>
            <p style={{ color: soft }}>
              Coming Soon
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ ...styles.footer, color: soft }}>
          © Copyright 2026, Evos Technologies
        </div>
      </div>

      {/* SUPPORT MODAL */}
      {supportOpen && (
        <>
          <div
            style={styles.overlay}
            onClick={() => setSupportOpen(false)}
          />

          <div style={styles.modal}>
            <h2 style={{ marginBottom: "10px" }}>
              Support Center
            </h2>

            <div style={styles.helpCard}>
              🌐 How to buy data with website
            </div>

            <div style={styles.helpCard}>
              📱 Buy with USSD (Coming Soon)
            </div>

            <div style={styles.helpCard}>
              📞 Contact Support
            </div>

            <button
              style={styles.closeBtn}
              onClick={() => setSupportOpen(false)}
            >
              Close
            </button>
          </div>
        </>
      )}
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
    background:
      "radial-gradient(circle at top, rgba(56,189,248,0.10), transparent 50%)",
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
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(16px)",
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
    background: "rgba(56,189,248,0.14)",
    color: "#38bdf8",
    fontSize: "20px",
    cursor: "pointer",
  },

  sidebar: {
    position: "fixed",
    top: 0,
    width: "260px",
    height: "100vh",
    padding: "22px",
    zIndex: 1200,
    transition: "0.3s ease",
    background: "#020617",
    borderRight:
      "1px solid rgba(255,255,255,0.06)",
  },

  sideTitle: {
    color: "#38bdf8",
    fontSize: "24px",
    fontWeight: "900",
    marginBottom: "6px",
  },

  sideSmall: {
    color: "rgba(255,255,255,0.6)",
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
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    color: "white",
    fontWeight: "700",
    textAlign: "left",
    cursor: "pointer",
  },

  logoutBtn: {
    padding: "13px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#ef4444,#b91c1c)",
    color: "white",
    fontWeight: "800",
    textAlign: "left",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 1100,
  },

  main: {
    padding: "18px",
    maxWidth: "850px",
    margin: "0 auto",
  },

  hero: {
    marginBottom: "20px",
  },

  heroTitle: {
    fontSize: "30px",
    fontWeight: "900",
    marginBottom: "4px",
  },

  heroText: {
    fontSize: "15px",
  },

  onlineWrap: {
    marginTop: "10px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },

  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  sectionTitle: {
    fontSize: "14px",
    fontWeight: "800",
    marginBottom: "12px",
    marginTop: "14px",
    letterSpacing: "0.5px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "14px",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },

  card: {
    padding: "18px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.03)",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.20)",
    cursor: "pointer",
  },

  small: {
    fontSize: "13px",
    color: "#94a3b8",
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
    marginTop: "28px",
    paddingBottom: "24px",
  },

  modal: {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "420px",
    background: "#0f172a",
    padding: "22px",
    borderRadius: "20px",
    zIndex: 1300,
    border: "1px solid rgba(255,255,255,0.06)",
  },

  helpCard: {
    padding: "14px",
    borderRadius: "14px",
    marginBottom: "10px",
    background: "rgba(255,255,255,0.04)",
  },

  closeBtn: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    color: "#00111f",
    fontWeight: "800",
    cursor: "pointer",
    marginTop: "10px",
  },
};
