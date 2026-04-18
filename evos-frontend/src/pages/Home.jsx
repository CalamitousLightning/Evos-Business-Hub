import { useEffect, useState } from "react";

export default function Home({ setPage, theme }) {
  const [loaded, setLoaded] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

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
          Fast, secure and automated data delivery system powered by EVOS
          Bussiness HUB.
        </p>

        <div style={styles.buttons}>
          <button
            style={styles.primaryBtn}
            onClick={() => setPage("shop")}
          >
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

          <button
            style={styles.supportBtn}
            onClick={() => setSupportOpen(true)}
          >
            Support
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

        <button
          style={styles.ctaBtn}
          onClick={() => setPage("shop")}
        >
          Get Started
        </button>
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

            {/* WHATSAPP SUPPORT */}
            <div
              style={{
                ...styles.helpCard,
                cursor: "pointer",
              }}
              onClick={() =>
                window.open(
                  "https://wa.me/233208718943",
                  "_blank"
                )
              }
            >
              💬 WhatsApp Support
              <br />
              Tap to chat instantly
            </div>

            {/* COMMUNITY */}
            <div
              style={{
                ...styles.helpCard,
                cursor: "pointer",
              }}
              onClick={() =>
                window.open(
                  "https://whatsapp.com/channel/0029VaTrnsZEgGfFXkIcjt1M",
                  "_blank"
                )
              }
            >
              👥 WhatsApp Community
              <br />
              Join updates & promos
            </div>

            {/* EMAIL */}
            <div
              style={{
                ...styles.helpCard,
                cursor: "pointer",
              }}
              onClick={() => {
                window.location.href =
                  "mailto:support@evosdata.com";
              }}
            >
              📧 Email Support
              <br />
              Tap to send email
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

/* ======================
   STYLES
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
    border: "1px solid rgba(255,255,255,0.06)",
  },

  title: {
    fontSize: "clamp(30px, 5vw, 52px)",
    fontWeight: "800",
    marginBottom: "12px",
  },

  highlight: {
    color: "#38bdf8",
  },

  subtitle: {
    fontSize: "16px",
    maxWidth: "650px",
    margin: "0 auto 22px",
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
  },

  secondaryBtn: {
    padding: "12px 18px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    cursor: "pointer",
  },

  supportBtn: {
    padding: "12px 18px",
    borderRadius: "12px",
    background: "#22c55e",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
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
    minWidth: "130px",
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
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  card: {
    padding: "20px",
    borderRadius: "16px",
  },

  cta: {
    textAlign: "center",
    padding: "70px 20px",
    marginTop: "40px",
    borderRadius: "20px",
  },

  ctaBtn: {
    marginTop: "15px",
    padding: "12px 20px",
    borderRadius: "12px",
    background: "#0b1220",
    color: "white",
    border: "none",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 1000,
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
    zIndex: 1200,
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
