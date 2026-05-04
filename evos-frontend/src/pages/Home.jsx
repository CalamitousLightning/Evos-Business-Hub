import { useEffect, useState } from "react";

export default function Home({ setPage, theme }) {
  const [supportOpen, setSupportOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {}, []);

  const isDark = theme === "dark";

  const features = [
    {
      title: "⚡ Instant Data Delivery",
      desc: "Orders are processed automatically after successful payment.",
    },
    {
      title: "🔒 Secure Payments",
      desc: "Trusted Paystack checkout for safe and reliable transactions.",
    },
    {
      title: "📡 Multi-Network Support",
      desc: "Buy MTN, Telecel and AirtelTigo bundles in one place.",
    },
    {
      title: "📊 Live Order Tracking",
      desc: "Track your orders anytime using your payment reference.",
    },
  ];

  const rules = [
    "Please confirm phone number before payment.",
    "No refund for successful delivery to wrong numbers entered by customer.",
    "Refunds apply only to failed or undelivered orders after review.",
    "During network congestion, some orders may delay.",
  ];

  return (
    <div style={styles.container}>
      {/* HERO */}
      <section
        style={{
          ...styles.hero,
          background: isDark
            ? "radial-gradient(circle at top,#0f172a,#020617)"
            : "linear-gradient(135deg,#e0f2fe,#f8fafc)",
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
          Fast, secure and automated data delivery powered by EVOS Business HUB.
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
                ? "1px solid rgba(255,255,255,0.15)"
                : "1px solid rgba(0,0,0,0.15)",
            }}
            onClick={() => setPage("orders")}
          >
            Track Orders
          </button>

          <button style={styles.supportBtn} onClick={() => setSupportOpen(true)}>
            Support
          </button>
        </div>

        {/* STATS */}
        <div style={styles.stats}>
          <div style={styles.statBox}>
            <h3>⚡ Instant - 2hr</h3>
            <p>Delivery Time</p>
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
      </section>

      {/* FEATURES */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Why Choose EVOS HUB?</h2>

        <div style={styles.grid}>
          {features.map((item, i) => (
            <div
              key={i}
              style={{
                ...styles.card,
                background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
              }}
            >
              <h3>{item.title}</h3>
              <p style={{ color: isDark ? "#94a3b8" : "#475569" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* RULES */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Purchase Policy</h2>

        <div
          style={{
            ...styles.card,
            background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
          }}
        >
          {rules.map((rule, i) => (
            <p key={i} style={styles.rule}>
              • {rule}
            </p>
          ))}
        </div>
      </section>

      {/* BECOME AN AGENT */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🤝 Become an Agent</h2>

        <div
          style={{
            ...styles.agentCard,
            background: isDark
              ? "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(14,165,233,0.04))"
              : "linear-gradient(135deg, #e0f2fe, #f0fdf4)",
            border: isDark
              ? "1px solid rgba(56,189,248,0.2)"
              : "1px solid rgba(56,189,248,0.3)",
          }}
        >
          <p style={{ ...styles.agentIntro, color: isDark ? "#e5e7eb" : "#1e293b" }}>
            Want to run your own data store and earn on every sale? Agent slots are
            available — but not forever. Here's what you need to know before reaching out:
          </p>

          <div style={styles.agentRules}>
            <div style={styles.agentRule}>
              <span style={styles.agentIcon}>📦</span>
              <span style={{ color: isDark ? "#cbd5e1" : "#334155" }}>
                You must have completed <strong style={{ color: "#38bdf8" }}>at least 20 successful orders</strong> on
                EVOS before you qualify to apply. This shows you understand the platform
                and trust the service.
              </span>
            </div>

            <div style={styles.agentRule}>
              <span style={styles.agentIcon}>⏳</span>
              <span style={{ color: isDark ? "#cbd5e1" : "#334155" }}>
                Agent slots are <strong style={{ color: "#f87171" }}>limited</strong>. If
                all slots are filled by the time you reach 20 orders, the opportunity
                closes — so don't sleep on it.
              </span>
            </div>

            <div style={styles.agentRule}>
              <span style={styles.agentIcon}>💰</span>
              <span style={{ color: isDark ? "#cbd5e1" : "#334155" }}>
                As an agent you set your own markup, get a personal store link, and earn
                profit on every order your customers place — automatically.
              </span>
            </div>

            <div style={styles.agentRule}>
              <span style={styles.agentIcon}>📩</span>
              <span style={{ color: isDark ? "#cbd5e1" : "#334155" }}>
                Once you hit 20 orders, reach out via WhatsApp or email with your account
                username and order history. We'll verify and onboard you.
              </span>
            </div>
          </div>

          <div style={styles.agentBtns}>
            <button
              style={styles.agentContactBtn}
              onClick={() => window.open("https://wa.me/233208718943?text=Hi, I'd like to become an EVOS agent", "_blank")}
            >
              💬 Contact via WhatsApp
            </button>
            <button
              style={styles.agentShopBtn}
              onClick={() => setPage("shop")}
            >
              Start Buying →
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          ...styles.cta,
          background: isDark
            ? "linear-gradient(135deg,#0f172a,#111827)"
            : "linear-gradient(135deg,#38bdf8,#22c55e)",
        }}
      >
        <h2>Start Buying Data in Seconds</h2>
        <p>No stress. No delays. Just fast delivery.</p>

        <button style={styles.ctaBtn} onClick={() => setPage("shop")}>
          Get Started
        </button>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          ...styles.footer,
          color: isDark ? "#94a3b8" : "#475569",
        }}
      >
        <div style={styles.footerGrid}>
          <div>
            <h3 style={styles.footerTitle}>EVOS HUB</h3>
            <p>Secure automated telecom services.</p>
          </div>

          <div>
            <h3 style={styles.footerTitle}>Other Products</h3>
            <p
              style={styles.link}
              onClick={() => window.open("https://evosgpt.xyz", "_blank")}
            >
              EVOS GPT
            </p>
            <p>Evos Business Hub (coming Soon)</p>
          </div>

          <div>
            <h3 style={styles.footerTitle}>Policy and Terms</h3>
            <p style={styles.link} onClick={() => setAboutOpen(true)}>
              About Us
            </p>
            <p style={styles.link} onClick={() => setPrivacyOpen(true)}>
              Privacy Policy
            </p>
          </div>

          <div>
            <h3 style={styles.footerTitle}>Support</h3>
            <p>WhatsApp: 0208718943</p>
            <p>support@evosdata.xyz</p>
          </div>
        </div>

        <div style={styles.copy}>
          Powered by EVOS Business HUB • EVOS Technologies
        </div>
      </footer>

      {/* SUPPORT MODAL */}
      {supportOpen && (
        <>
          <div style={styles.overlay} onClick={() => setSupportOpen(false)} />
          <div style={styles.modal}>
            <h2>Support Center</h2>
            <div
              style={styles.helpCard}
              onClick={() => window.open("https://wa.me/233208718943", "_blank")}
            >
              💬 WhatsApp Support
            </div>
            <div
              style={styles.helpCard}
              onClick={() =>
                window.open("https://whatsapp.com/channel/0029VaTrnsZEgGfFXkIcjt1M", "_blank")
              }
            >
              👥 Community
            </div>
            <div
              style={styles.helpCard}
              onClick={() => (window.location.href = "mailto:support@evosdata.xyz")}
            >
              📧 Email Support
            </div>
            <button style={styles.closeBtn} onClick={() => setSupportOpen(false)}>
              Close
            </button>
          </div>
        </>
      )}

      {/* ABOUT MODAL */}
      {aboutOpen && (
        <>
          <div style={styles.overlay} onClick={() => setAboutOpen(false)} />
          <div style={styles.modal}>
            <h2>About EVOSDATA</h2>
            <p>
              EVOSDATA is a secure digital platform for automated mobile data
              purchases in Ghana.
            </p>
            <p>Powered by EVOS Business HUB infrastructure.</p>
            <button style={styles.closeBtn} onClick={() => setAboutOpen(false)}>
              Close
            </button>
          </div>
        </>
      )}

      {/* PRIVACY MODAL */}
      {privacyOpen && (
        <>
          <div style={styles.overlay} onClick={() => setPrivacyOpen(false)} />
          <div style={styles.modal}>
            <h2>Privacy Policy</h2>
            <p>We only collect necessary data for order processing and support.</p>
            <p>All payments are securely handled via Paystack.</p>
            <p>We do not sell or share user data.</p>
            <button style={styles.closeBtn} onClick={() => setPrivacyOpen(false)}>
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { transition: "0.3s ease" },

  hero: {
    textAlign: "center",
    padding: "80px 20px",
    borderRadius: "22px",
    marginBottom: "35px",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  title: {
    fontSize: "clamp(32px,5vw,56px)",
    fontWeight: "900",
    marginBottom: "12px",
  },

  highlight: { color: "#38bdf8" },

  subtitle: {
    maxWidth: "700px",
    margin: "0 auto 22px",
    lineHeight: "1.6",
  },

  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "26px",
  },

  primaryBtn: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "800",
    background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
  },

  secondaryBtn: {
    padding: "12px 18px",
    borderRadius: "12px",
    background: "transparent",
    cursor: "pointer",
  },

  supportBtn: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "#22c55e",
    color: "white",
    fontWeight: "800",
    cursor: "pointer",
  },

  stats: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
  },

  statBox: {
    minWidth: "140px",
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
  },

  section: { padding: "20px 0 40px" },

  sectionTitle: {
    fontSize: "28px",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "22px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "16px",
  },

  card: { padding: "20px", borderRadius: "18px" },

  rule: { marginBottom: "10px", lineHeight: "1.6" },

  // Agent section
  agentCard: {
    padding: "24px",
    borderRadius: "18px",
  },

  agentIntro: {
    fontSize: "15px",
    lineHeight: "1.7",
    marginBottom: "20px",
    margin: "0 0 20px",
  },

  agentRules: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "22px",
  },

  agentRule: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  agentIcon: { fontSize: "18px", flexShrink: 0, marginTop: "1px" },

  agentBtns: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  agentContactBtn: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "#22c55e",
    color: "white",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "14px",
  },

  agentShopBtn: {
    padding: "12px 18px",
    border: "1px solid rgba(56,189,248,0.4)",
    borderRadius: "12px",
    background: "transparent",
    color: "#38bdf8",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "14px",
  },

  cta: {
    textAlign: "center",
    padding: "70px 20px",
    borderRadius: "22px",
    marginTop: "20px",
  },

  ctaBtn: {
    marginTop: "14px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "800",
  },

  footer: {
    marginTop: "45px",
    padding: "30px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },

  footerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
  },

  footerTitle: { marginBottom: "10px", fontWeight: "800" },

  link: { cursor: "pointer", color: "#38bdf8", marginBottom: "8px" },

  copy: { marginTop: "25px", textAlign: "center", fontSize: "14px" },

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
    transform: "translate(-50%,-50%)",
    width: "92%",
    maxWidth: "420px",
    background: "#0f172a",
    padding: "22px",
    borderRadius: "20px",
    zIndex: 1200,
  },

  helpCard: {
    padding: "14px",
    borderRadius: "14px",
    marginTop: "10px",
    background: "rgba(255,255,255,0.04)",
    cursor: "pointer",
  },

  closeBtn: {
    width: "100%",
    marginTop: "14px",
    padding: "12px",
    border: "none",
    borderRadius: "14px",
    fontWeight: "800",
    cursor: "pointer",
    background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
  },
};
