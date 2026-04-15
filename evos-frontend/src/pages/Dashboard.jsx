import { useEffect, useState } from "react";

export default function Dashboard({ setPage, user }) {
  const [dark, setDark] = useState(true);

  // 🔐 AUTH GUARD (FIXED)
  useEffect(() => {
    if (!user) {
      setPage("login");
    }
  }, [user, setPage]);

  // 🔥 DATAMART WIDGET (FIXED - prevents duplicate scripts)
  useEffect(() => {
    const container = document.getElementById("tracker");

    if (!container) return;

    // clear old script safely
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

  return (
    <div style={dark ? styles.darkContainer : styles.lightContainer}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logoBox}>
          <div style={styles.logo}>EVOS</div>
          <small>Hub</small>
        </div>

        <button style={styles.navBtn} onClick={() => setPage("shop")}>
          📦 Buy Data
        </button>

        <button style={styles.navBtn} onClick={() => setPage("orders")}>
          📡 Track Orders
        </button>

        <button style={styles.navBtn} onClick={logout}>
          🚪 Logout
        </button>

        <button
          style={styles.toggle}
          onClick={() => setDark(!dark)}
        >
          {dark ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h2 style={styles.title}>Dashboard</h2>

        <p style={styles.subtitle}>
          Welcome back, {user?.username || user?.email}
        </p>

        {/* ACTIONS */}
        <div style={styles.grid}>
          <div style={styles.card} onClick={() => setPage("shop")}>
            <h3>Buy Data</h3>
            <p>Purchase MTN, Telecel, AirtelTigo bundles</p>
          </div>

          <div style={styles.card} onClick={() => setPage("orders")}>
            <h3>Track Orders</h3>
            <p>View live status of all your transactions</p>
          </div>
        </div>

        {/* TRACKER */}
        <div style={styles.trackerBox}>
          <h3 style={{ marginBottom: "10px" }}>
            Live Delivery Tracker
          </h3>

          <div id="tracker"></div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  darkContainer: {
    display: "flex",
    minHeight: "100vh",
    background: "#0b1220",
    color: "white",
  },

  lightContainer: {
    display: "flex",
    minHeight: "100vh",
    background: "#f3f4f6",
    color: "#111",
  },

  sidebar: {
    width: "220px",
    padding: "20px",
    background: "#111827",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  logoBox: {
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "bold",
  },

  logo: {
    fontSize: "24px",
    color: "#38bdf8",
  },

  navBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#1f2937",
    color: "white",
  },

  toggle: {
    marginTop: "20px",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#374151",
    color: "white",
  },

  main: {
    flex: 1,
    padding: "25px",
  },

  title: {
    fontSize: "24px",
    marginBottom: "5px",
  },

  subtitle: {
    opacity: 0.7,
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
  },

  card: {
    padding: "20px",
    borderRadius: "15px",
    background: "#1f2937",
    cursor: "pointer",
  },

  trackerBox: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "15px",
    background: "#111827",
  },
};
