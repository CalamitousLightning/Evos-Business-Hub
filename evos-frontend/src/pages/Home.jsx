import { useEffect, useState } from "react";

export default function Home({ setPage, theme }) {
  const [supportOpen, setSupportOpen] =
    useState(false);

  useEffect(() => {}, []);

  const isDark =
    theme === "dark";

  const features = [
    {
      title:
        "⚡ Instant Data Delivery",
      desc:
        "Orders are processed automatically after successful payment.",
    },
    {
      title:
        "🔒 Secure Payments",
      desc:
        "Trusted Paystack checkout for safe and reliable transactions.",
    },
    {
      title:
        "📡 Multi-Network Support",
      desc:
        "Buy MTN, Telecel and AirtelTigo bundles in one place.",
    },
    {
      title:
        "📊 Live Order Tracking",
      desc:
        "Track your orders anytime using your payment reference.",
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
          <span
            style={
              styles.highlight
            }
          >
            {" "}
            Instantly
          </span>
        </h1>

        <p
          style={{
            ...styles.subtitle,
            color: isDark
              ? "#94a3b8"
              : "#475569",
          }}
        >
          Fast, secure and
          automated data
          delivery powered by
          EVOS Business HUB.
        </p>

        <div style={styles.buttons}>
          <button
            style={
              styles.primaryBtn
            }
            onClick={() =>
              setPage("shop")
            }
          >
            Buy Data Now
          </button>

          <button
            style={{
              ...styles.secondaryBtn,
              color: isDark
                ? "#e5e7eb"
                : "#111827",
              border: isDark
                ? "1px solid rgba(255,255,255,0.15)"
                : "1px solid rgba(0,0,0,0.15)",
            }}
            onClick={() =>
              setPage(
                "orders"
              )
            }
          >
            Track Orders
          </button>

          <button
            style={
              styles.supportBtn
            }
            onClick={() =>
              setSupportOpen(
                true
              )
            }
          >
            Support
          </button>
        </div>

        {/* STATS */}
        <div style={styles.stats}>
          <div
            style={
              styles.statBox
            }
          >
            <h3>
              ⚡ Instant - 2hr
            </h3>
            <p>
              Delivery Time
            </p>
          </div>

          <div
            style={
              styles.statBox
            }
          >
            <h3>📶 3</h3>
            <p>Networks</p>
          </div>

          <div
            style={
              styles.statBox
            }
          >
            <h3>🔁 24/7</h3>
            <p>Automation</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={
          styles.section
        }
      >
        <h2
          style={
            styles.sectionTitle
          }
        >
          Why Choose EVOS HUB?
        </h2>

        <div style={styles.grid}>
          {features.map(
            (item, i) => (
              <div
                key={i}
                style={{
                  ...styles.card,
                  background:
                    isDark
                      ? "rgba(255,255,255,0.04)"
                      : "#ffffff",
                }}
              >
                <h3>
                  {
                    item.title
                  }
                </h3>

                <p
                  style={{
                    color:
                      isDark
                        ? "#94a3b8"
                        : "#475569",
                  }}
                >
                  {
                    item.desc
                  }
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* RULES */}
      <section
        style={
          styles.section
        }
      >
        <h2
          style={
            styles.sectionTitle
          }
        >
          Purchase Policy
        </h2>

        <div
          style={{
            ...styles.card,
            background:
              isDark
                ? "rgba(255,255,255,0.03)"
                : "#ffffff",
          }}
        >
          {rules.map(
            (rule, i) => (
              <p
                key={i}
                style={
                  styles.rule
                }
              >
                • {rule}
              </p>
            )
          )}
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
        <h2>
          Start Buying Data
          in Seconds
        </h2>

        <p>
          No stress. No
          delays. Just fast
          delivery.
        </p>

        <button
          style={
            styles.ctaBtn
          }
          onClick={() =>
            setPage("shop")
          }
        >
          Get Started
        </button>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          ...styles.footer,
          color: isDark
            ? "#94a3b8"
            : "#475569",
        }}
      >
        <div style={styles.footerGrid}>
          <div>
            <h3
              style={
                styles.footerTitle
              }
            >
              EVOS HUB
            </h3>
            <p>
              Secure automated
              telecom services.
            </p>
          </div>

          <div>
            <h3
              style={
                styles.footerTitle
              }
            >
              Other Products
            </h3>

            <p
              style={
                styles.link
              }
              onClick={() =>
                window.open(
                  "https://evosgpt.xyz",
                  "_blank"
                )
              }
            >
              EVOS GPT
            </p>

            <p>
              EVOS Business
              Hub (Coming
              Soon)
            </p>
          </div>

          <div>
            <h3
              style={
                styles.footerTitle
              }
            >
              Support
            </h3>

            <p>
              WhatsApp:
              0208718943
            </p>

            <p>
              support@evosdata.com
            </p>
          </div>
        </div>

        <div
          style={
            styles.copy
          }
        >
          Powered by EVOS
          Business HUB •
          EVOS
          Technologies
        </div>
      </footer>

      {/* SUPPORT MODAL */}
      {supportOpen && (
        <>
          <div
            style={
              styles.overlay
            }
            onClick={() =>
              setSupportOpen(
                false
              )
            }
          />

          <div
            style={
              styles.modal
            }
          >
            <h2>
              Support Center
            </h2>

            <div
              style={
                styles.helpCard
              }
              onClick={() =>
                window.open(
                  "https://wa.me/233208718943",
                  "_blank"
                )
              }
            >
              💬 WhatsApp
              Support
            </div>

            <div
              style={
                styles.helpCard
              }
              onClick={() =>
                window.open(
                  "https://whatsapp.com/channel/0029VaTrnsZEgGfFXkIcjt1M",
                  "_blank"
                )
              }
            >
              👥 Community
            </div>

            <div
              style={
                styles.helpCard
              }
              onClick={() =>
                (window.location.href =
                  "mailto:support@evosdata.com")
              }
            >
              📧 Email
              Support
            </div>

            <button
              style={
                styles.closeBtn
              }
              onClick={() =>
                setSupportOpen(
                  false
                )
              }
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    transition:
      "0.3s ease",
  },

  hero: {
    textAlign:
      "center",
    padding:
      "80px 20px",
    borderRadius:
      "22px",
    marginBottom:
      "35px",
    border:
      "1px solid rgba(255,255,255,0.06)",
  },

  title: {
    fontSize:
      "clamp(32px,5vw,56px)",
    fontWeight:
      "900",
    marginBottom:
      "12px",
  },

  highlight: {
    color:
      "#38bdf8",
  },

  subtitle: {
    maxWidth:
      "700px",
    margin:
      "0 auto 22px",
    lineHeight:
      "1.6",
  },

  buttons: {
    display: "flex",
    justifyContent:
      "center",
    gap: "12px",
    flexWrap:
      "wrap",
    marginBottom:
      "26px",
  },

  primaryBtn: {
    padding:
      "12px 18px",
    border: "none",
    borderRadius:
      "12px",
    cursor:
      "pointer",
    fontWeight:
      "800",
    background:
      "linear
