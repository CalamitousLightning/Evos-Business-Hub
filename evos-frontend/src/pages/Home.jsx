import { useEffect, useState } from "react";

export default function Home({ setPage, theme }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const isDark = theme === "dark";

  const features = [
    {
      title: "⚡ Instant Data Delivery",
      desc: "Get mobile data delivered in seconds after payment confirmation.",
    },
    {
      title: "🔒 Secure Payments",
      desc: "Powered by Paystack for safe and trusted transactions.",
    },
    {
      title: "📡 Multi-Network Support",
      desc: "MTN, Telecel, AirtelTigo — all in one platform.",
    },
    {
      title: "📊 Live Order Tracking",
      desc: "Track your orders in real-time with our smart tracking system.",
    },
  ];

  return (
    <div style={styles.container}>
      {/* HERO */}
      <div
        style={{
          ...styles.hero,
          background: isDark
            ? "radial-gradient(circle at top, #0f172a, #020617)"
            : "linear-gradient(135deg, #e0f2fe, #f8fafc)",
        }}
      >
        <h1 style={styles.title}>
          Buy Mobile Data
          <span style={styles.highlight}> Instantly</span>
        </h1>

        <p
          style={{
            ...styles.subtitle,
            color: isDark ? "#94a3b8" : "#475569",
          }}
        >
          Fast, secure and automated data delivery system powered by EVOS HUB.
        </p>

        <div style={styles.buttons}>
          <button style={styles.primaryBtn} onClick={() => setPage("shop")}>
            Buy Data Now
          </button>

          <button
            style={{
              ...styles.secondaryBtn,
              color: isDark ? "#e5e7eb" : "#111827",
              border: isDark
                ? "1px solid rgba(255,255,255,0.2)"
                : "1px solid rgba(0,0,0,0.2)",
            }}
            onClick={() => setPage("orders")}
          >
            Track Orders
          </button>
        </div>

        {/* STATS */}
        <div style={styles.stats}>
          <div style={styles.statBox}>
            <h3>⚡ 5s</h3>
            <p>Avg Delivery</p>
          </div>

          <div style={styles.statBox}>
            <h3>📶 3</h3>
            <p>Networks</p>
          </div>

          <div style={styles.statBox}>
            <h3>🔁 24/7</h3>
            <p>Automation</p>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Why Choose EVOS HUB?</h2>

        <div style={styles.grid}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                ...styles.card,
                background: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "#ffffff",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <h3>{f.title}</h3>
              <p
                style={{
                  color: isDark ? "#94a3b8" : "#475569",
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          ...styles.cta,
          background: isDark
            ? "linear-gradient(135deg, #0f172a, #111827)"
            : "linear-gradient(135deg, #38bdf8, #22c55e)",
          color: isDark ? "#e5e7eb" : "#ffffff",
        }}
      >
        <h2>Start Buying Data in Seconds</h2>
        <p>No stress. No delays. Just instant delivery.</p>

        <button style={styles.ctaBtn} onClick={() => setPage("shop")}>
          Get Started
        </button>
      </div>
    </div>
  );
}

/* ======================
   PREMIUM STYLES
====================== */
const styles = {
  container: {
    transition: "0.3s ease",
  },

  hero: {
    textAlign: "center",
    padding: "70px 20px",
    borderRadius: "18px",
    marginBottom: "40px",
  },

  title: {
    fontSize: "clamp(28px, 5vw, 48px)",
    fontWeight: "bold",
    marginBottom: "10px",
  },

  highlight: {
    color: "#38bdf8",
  },

  subtitle: {
    fontSize: "16px",
    maxWidth: "600px",
    margin: "0 auto 20px",
  },

  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "30px",
  },

  primaryBtn: {
    padding: "12px 18px",
    borderRadius: "10px",
    background: "#38bdf8",
    color: "#0b1220",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
  },

  secondaryBtn: {
    padding: "12px 18px",
    borderRadius: "10px",
    background: "transparent",
    cursor: "pointer",
  },

  stats: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  statBox: {
    padding: "14px 18px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    minWidth: "120px",
  },

  featuresSection: {
    padding: "50px 20px",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: "26px",
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
  },

  card: {
    padding: "20px",
    borderRadius: "14px",
    transition: "0.2s ease",
  },

  cta: {
    textAlign: "center",
    padding: "60px 20px",
    marginTop: "40px",
    borderRadius: "18px",
  },

  ctaBtn: {
    marginTop: "15px",
    padding: "12px 20px",
    borderRadius: "10px",
    background: "#0b1220",
    color: "white",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
  },
};