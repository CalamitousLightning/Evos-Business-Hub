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
          Fast, secure and automated data delivery system powered by EVOS Bussiness HUB.
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
            <h3>⚡ 5s - 2hr</h3>
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
/* ======================
   HOME UI (SAAS PREMIUM SYSTEM)
====================== */
const styles = {
  container: {
    transition: "0.3s ease",
  },

  hero: {
    textAlign: "center",
    padding: "80px 20px",
    borderRadius: "20px",
    marginBottom: "40px",
    background: "rgba(15, 23, 42, 0.35)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  title: {
    fontSize: "clamp(30px, 5vw, 52px)",
    fontWeight: "800",
    marginBottom: "12px",
    letterSpacing: "0.5px",
  },

  highlight: {
    color: "#38bdf8",
  },

  subtitle: {
    fontSize: "16px",
    maxWidth: "650px",
    margin: "0 auto 22px",
    color: "rgba(156, 163, 175, 0.9)",
    lineHeight: "1.6",
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
    borderRadius: "12px",
    background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
    color: "#0b1220",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(56, 189, 248, 0.25)",
    transition: "0.2s ease",
  },

  secondaryBtn: {
    padding: "12px 18px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "inherit",
    cursor: "pointer",
    transition: "0.2s ease",
  },

  stats: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  statBox: {
    padding: "14px 18px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    minWidth: "130px",
    backdropFilter: "blur(12px)",
  },

  featuresSection: {
    padding: "60px 20px",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: "26px",
    marginBottom: "30px",
    fontWeight: "700",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  card: {
    padding: "20px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(14px)",
    transition: "0.2s ease",
  },

  cta: {
    textAlign: "center",
    padding: "70px 20px",
    marginTop: "40px",
    borderRadius: "20px",
    background: "rgba(15, 23, 42, 0.35)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  ctaBtn: {
    marginTop: "15px",
    padding: "12px 20px",
    borderRadius: "12px",
    background: "#0b1220",
    color: "white",
    fontWeight: "700",
    border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
    transition: "0.2s ease",
  },
};
