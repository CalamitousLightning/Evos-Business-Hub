// ======================
// Shop.jsx — Friendly & Colorful Redesign
// Bundle grid is now a proper 2-col card grid with color accents
// ======================

import { useEffect, useState } from "react";
import API from "../api";

export default function Shop() {
  const [step, setStep] = useState(1);
  const [network, setNetwork] = useState("");
  const [bundle, setBundle] = useState("");
  const [bundlePrice, setBundlePrice] = useState(0);
  const [phone, setPhone] = useState("");
  const [confirmPhone, setConfirmPhone] = useState("");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const user_id = user?.id || null;

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const res = await API.get("/prices");
        const data = res.data?.data;
        setPrices(Array.isArray(data) ? data : []);
      } catch {
        setPrices([]);
      }
    };
    loadPrices();
  }, []);

  const OUT_OF_STOCK = [];
  const isOutOfStock = (name) => OUT_OF_STOCK.includes(name);
  const bundles = prices.filter((p) => p.network === network);
  const validPhone = (num) => /^0\d{9}$/.test(num);

  const handleBuy = async () => {
    try {
      setError("");
      if (!network || !bundle) { setError("Select network and bundle"); return; }
      if (!phone) { setError("Enter phone number"); return; }
      if (!validPhone(phone)) { setError("Phone must be 10 digits and start with 0"); return; }
      if (phone !== confirmPhone) { setError("Phone numbers do not match"); return; }
      if (!agree) { setError("You must confirm refund policy"); return; }

      setLoading(true);
      const res = await API.post("/orders/create", {
        user_id, network, bundle, phone,
        email: email || "guest@evoshub.com",
      });

      const paymentUrl =
        res.data?.payment_url ||
        res.data?.authorization_url ||
        res.data?.data?.authorization_url;

      if (!paymentUrl) {
        setLoading(false);
        setError("Payment link not received");
        return;
      }

      localStorage.setItem("email", email);
      window.location.href = paymentUrl;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Order failed"
      );
    }
  };

  const networks = [
    {
      name: "MTN",
      label: "MTN",
      emoji: "🟡",
      color: "#b45309",
      cardColor: "#fef3c7",
      accentColor: "#f59e0b",
      bg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
      border: "#fcd34d",
      shadow: "0 4px 20px rgba(245,158,11,0.25)",
      desc: "Ghana's largest network",
      tag: "Most Popular",
      tagColor: "#f59e0b",
    },
    {
      name: "TELECEL",
      label: "Telecel",
      emoji: "🔴",
      color: "#991b1b",
      cardColor: "#fee2e2",
      accentColor: "#ef4444",
      bg: "linear-gradient(135deg, #fff5f5, #fee2e2)",
      border: "#fca5a5",
      shadow: "0 4px 20px rgba(239,68,68,0.2)",
      desc: "Formerly Vodafone Ghana",
      tag: "Reliable",
      tagColor: "#ef4444",
    },
    {
      name: "AIRTELTIGO",
      label: "AirtelTigo",
      emoji: "🔵",
      color: "#3730a3",
      cardColor: "#e0e7ff",
      accentColor: "#6366f1",
      bg: "linear-gradient(135deg, #f0f1ff, #e0e7ff)",
      border: "#a5b4fc",
      shadow: "0 4px 20px rgba(99,102,241,0.2)",
      desc: "Nationwide coverage",
      tag: "Affordable",
      tagColor: "#6366f1",
    },
  ];

  const selectedNetwork = networks.find((n) => n.name === network);

  // Bundle card accent colors cycling
  const bundleAccents = [
    { bg: "#f0fdf4", border: "#86efac", price: "#16a34a", size: "#14532d" },
    { bg: "#eff6ff", border: "#93c5fd", price: "#2563eb", size: "#1e3a8a" },
    { bg: "#fdf4ff", border: "#d8b4fe", price: "#9333ea", size: "#581c87" },
    { bg: "#fff7ed", border: "#fdba74", price: "#ea580c", size: "#7c2d12" },
    { bg: "#f0fdfa", border: "#6ee7b7", price: "#059669", size: "#064e3b" },
    { bg: "#fef2f2", border: "#fca5a5", price: "#dc2626", size: "#7f1d1d" },
  ];

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerBadge}>🛒 Buy Data</div>
        <h2 style={styles.title}>Get Connected Instantly</h2>
        <p style={styles.subtitle}>Fast automated data delivery across Ghana 🇬🇭</p>
      </div>

      {/* PROGRESS BAR */}
      <div style={styles.progressWrap}>
        {["Network", "Bundle", "Checkout"].map((label, i) => {
          const active = step === i + 1;
          const done = step > i + 1;
          return (
            <div key={i} style={styles.progressItem}>
              <div style={{
                ...styles.progressDot,
                background: done
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : active
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "#e5e7eb",
                boxShadow: active ? "0 0 0 4px rgba(99,102,241,0.2)" : done ? "0 0 0 4px rgba(34,197,94,0.15)" : "none",
                color: done || active ? "white" : "#9ca3af",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{
                ...styles.progressLabel,
                color: active ? "#6366f1" : done ? "#22c55e" : "#9ca3af",
                fontWeight: active || done ? 800 : 600,
              }}>{label}</span>
            </div>
          );
        })}
        <div style={styles.progressLine}>
          <div style={{
            ...styles.progressLineFill,
            width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
          }} />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      <div style={styles.wrapper}>

        {/* ============ STEP 1 — NETWORK ============ */}
        {step === 1 && (
          <div style={styles.box}>
            <p style={styles.stepLabel}>Step 1 of 3 · Select Your Network</p>

            <div style={styles.networkGrid}>
              {networks.map((n) => {
                const disabled = isOutOfStock(n.name);
                return (
                  <div
                    key={n.name}
                    style={{
                      ...styles.networkCard,
                      background: n.bg,
                      border: `2px solid ${n.border}`,
                      boxShadow: n.shadow,
                      opacity: disabled ? 0.45 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}
                    onClick={() => {
                      if (disabled) return;
                      setNetwork(n.name);
                      setStep(2);
                    }}
                  >
                    {/* Tag */}
                    {!disabled && (
                      <div style={{
                        ...styles.networkTag,
                        background: n.tagColor + "1a",
                        color: n.tagColor,
                        border: `1px solid ${n.tagColor}33`,
                      }}>
                        {n.tag}
                      </div>
                    )}

                    <div style={styles.networkLeft}>
                      <div style={styles.networkEmoji}>{n.emoji}</div>
                      <div>
                        <div style={{ ...styles.networkName, color: n.color }}>{n.label}</div>
                        <div style={styles.networkDesc}>{n.desc}</div>
                      </div>
                    </div>

                    <div style={{ ...styles.networkArrow, color: n.accentColor }}>
                      →
                    </div>

                    {disabled && (
                      <div style={styles.stockBadge}>Out of Stock</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoChip}>🔒 Paystack Secured</span>
              <span style={styles.infoChip}>⚡ Instant Delivery</span>
              <span style={styles.infoChip}>✅ 24/7 Active</span>
            </div>
          </div>
        )}

        {/* ============ STEP 2 — BUNDLE ============ */}
        {step === 2 && (
          <div style={styles.box}>
            <button style={styles.backBtn} onClick={() => setStep(1)}>
              ← Back
            </button>

            <p style={styles.stepLabel}>Step 2 of 3 · Pick a Bundle</p>

            {/* Network pill */}
            <div style={{
              ...styles.networkPill,
              background: selectedNetwork?.bg,
              border: `2px solid ${selectedNetwork?.border}`,
              color: selectedNetwork?.color,
            }}>
              {selectedNetwork?.emoji} {selectedNetwork?.label} Bundles
            </div>

            {bundles.length === 0 && (
              <div style={styles.emptyBox}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                <p style={styles.emptyText}>No bundles available right now.</p>
              </div>
            )}

            {/* BUNDLE GRID — 2 cols, colorful cards */}
            <div style={styles.bundleGrid}>
              {bundles.map((b, i) => {
                const accent = bundleAccents[i % bundleAccents.length];
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.bundleCard,
                      background: accent.bg,
                      border: `2px solid ${accent.border}`,
                    }}
                    onClick={() => {
                      setBundle(b.bundle);
                      setBundlePrice(b.price);
                      setStep(3);
                    }}
                  >
                    {/* Data size */}
                    <div style={{ ...styles.bundleSize, color: accent.size }}>
                      {b.bundle}
                    </div>

                    {/* Divider */}
                    <div style={{ ...styles.bundleDivider, background: accent.border }} />

                    {/* Price */}
                    <div style={{ ...styles.bundlePrice, color: accent.price }}>
                      GH₵ {Number(b.price).toFixed(2)}
                    </div>

                    {/* CTA */}
                    <div style={{
                      ...styles.bundleCta,
                      background: accent.border,
                      color: accent.price,
                    }}>
                      Select →
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ STEP 3 — CHECKOUT ============ */}
        {step === 3 && (
          <div style={styles.box}>
            <button style={styles.backBtn} onClick={() => setStep(2)}>
              ← Back
            </button>

            <p style={styles.stepLabel}>Step 3 of 3 · Complete Your Order</p>

            {/* ORDER SUMMARY */}
            <div style={{
              ...styles.summaryCard,
              background: selectedNetwork?.bg,
              border: `2px solid ${selectedNetwork?.border}`,
            }}>
              <div style={styles.summaryHeader}>
                <span style={{ fontSize: 20 }}>{selectedNetwork?.emoji}</span>
                <span style={{ ...styles.summaryHeaderText, color: selectedNetwork?.color }}>
                  Order Summary
                </span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Network</span>
                <span style={{ ...styles.summaryVal, color: selectedNetwork?.accentColor, fontWeight: 800 }}>
                  {selectedNetwork?.label}
                </span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Bundle</span>
                <span style={styles.summaryVal}>{bundle}</span>
              </div>
              <div style={{ ...styles.summaryRow, borderBottom: "none", marginTop: 4 }}>
                <span style={styles.summaryLabel}>Total</span>
                <span style={{ ...styles.summaryVal, color: "#16a34a", fontSize: 22, fontWeight: 900 }}>
                  GH₵ {Number(bundlePrice).toFixed(2)}
                </span>
              </div>
            </div>

            {/* INPUTS */}
            <label style={styles.inputLabel}>📱 Recipient Phone Number</label>
            <input
              style={styles.input}
              type="tel"
              placeholder="e.g. 0244000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label style={styles.inputLabel}>🔁 Confirm Phone Number</label>
            <input
              style={styles.input}
              type="tel"
              placeholder="Re-enter phone number"
              value={confirmPhone}
              onChange={(e) => setConfirmPhone(e.target.value)}
            />

            <label style={styles.inputLabel}>📧 Email (for receipt)</label>
            <input
              style={styles.input}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* POLICY CHECKBOX */}
            <label style={styles.checkWrap}>
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
                style={{ accentColor: "#6366f1", width: 17, height: 17, flexShrink: 0, marginTop: 2 }}
              />
              <span style={styles.checkText}>
                I confirm this number is correct.{" "}
                <strong style={{ color: "#dc2626" }}>Wrong numbers will NOT be refunded.</strong>{" "}
                I take full responsibility.
              </span>
            </label>

            {/* PAY BUTTON */}
            <button
              onClick={handleBuy}
              disabled={loading}
              style={{ ...styles.buyBtn, opacity: loading ? 0.65 : 1 }}
            >
              {loading
                ? "⏳ Processing..."
                : `💳 Pay GH₵ ${Number(bundlePrice).toFixed(2)} via Paystack`}
            </button>

            <p style={styles.secureNote}>🔒 Payments secured & encrypted by Paystack</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "28px 18px 72px",
    color: "#1e293b",
    fontFamily: "'Nunito', 'Poppins', ui-rounded, system-ui, Arial",
    minHeight: "100vh",
    background: "linear-gradient(160deg, #f8faff 0%, #f0f4ff 50%, #fdf4ff 100%)",
  },

  // HEADER
  header: { textAlign: "center", marginBottom: 28 },
  headerBadge: {
    display: "inline-block",
    padding: "5px 18px",
    borderRadius: 50,
    background: "linear-gradient(135deg, #e0e7ff, #ddd6fe)",
    border: "1px solid #c4b5fd",
    color: "#6d28d9",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 12,
    letterSpacing: "0.5px",
  },
  title: {
    fontSize: 28,
    fontWeight: 900,
    color: "#0f172a",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
  },
  subtitle: { fontSize: 14, color: "#64748b", margin: 0, fontWeight: 600 },

  // PROGRESS
  progressWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 0,
    position: "relative",
    maxWidth: 340,
    margin: "0 auto 28px",
  },
  progressItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    flex: 1,
    position: "relative",
    zIndex: 1,
  },
  progressDot: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    transition: "all 0.35s",
  },
  progressLabel: { fontSize: 11, fontWeight: 600, transition: "color 0.3s" },
  progressLine: {
    position: "absolute",
    top: 17,
    left: "16%",
    right: "16%",
    height: 3,
    background: "#e5e7eb",
    zIndex: 0,
    borderRadius: 10,
    overflow: "hidden",
  },
  progressLineFill: {
    height: "100%",
    background: "linear-gradient(90deg, #22c55e, #6366f1)",
    borderRadius: 10,
    transition: "width 0.4s ease",
  },

  // ERROR
  error: {
    background: "#fef2f2",
    border: "1.5px solid #fca5a5",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 600,
    maxWidth: 480,
    margin: "0 auto 16px",
    textAlign: "center",
  },

  wrapper: { maxWidth: 480, margin: "0 auto" },

  box: {
    background: "white",
    padding: "24px 20px",
    borderRadius: 24,
    border: "1.5px solid #e5e7eb",
    boxShadow: "0 8px 40px rgba(99,102,241,0.08), 0 2px 8px rgba(0,0,0,0.04)",
  },

  stepLabel: {
    fontSize: 11,
    color: "#6366f1",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 18px",
  },

  // NETWORK CARDS
  networkGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 20,
  },
  networkCard: {
    padding: "16px 18px",
    borderRadius: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 0,
    transition: "transform 0.15s, box-shadow 0.15s",
    position: "relative",
  },
  networkTag: {
    position: "absolute",
    top: 10,
    right: 42,
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: 50,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  networkLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  networkEmoji: { fontSize: 30, flexShrink: 0 },
  networkName: { fontWeight: 900, fontSize: 17, marginBottom: 2 },
  networkDesc: { fontSize: 12, color: "#64748b", fontWeight: 600 },
  networkArrow: { fontSize: 20, fontWeight: 900, flexShrink: 0 },
  stockBadge: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    color: "#dc2626",
    fontSize: 11,
    fontWeight: 800,
    padding: "3px 10px",
    borderRadius: 50,
  },

  infoRow: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  infoChip: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 700,
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    padding: "4px 10px",
    borderRadius: 50,
  },

  // BUNDLE STEP
  backBtn: {
    background: "#f1f5f9",
    border: "none",
    color: "#6366f1",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    padding: "6px 14px",
    borderRadius: 50,
    marginBottom: 16,
    display: "inline-block",
  },
  networkPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 18px",
    borderRadius: 50,
    fontSize: 13,
    fontWeight: 900,
    marginBottom: 20,
  },
  emptyBox: {
    textAlign: "center",
    padding: "30px 0 10px",
  },
  emptyText: { color: "#94a3b8", fontSize: 14, margin: 0, fontWeight: 600 },

  // BUNDLE GRID — 2 col colorful cards
  bundleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 4,
  },
  bundleCard: {
    borderRadius: 18,
    padding: "18px 14px 14px",
    cursor: "pointer",
    textAlign: "center",
    transition: "transform 0.15s, box-shadow 0.15s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
  },
  bundleSize: {
    fontWeight: 900,
    fontSize: 20,
    marginBottom: 8,
    letterSpacing: "-0.3px",
  },
  bundleDivider: {
    width: "50%",
    height: 2,
    borderRadius: 10,
    marginBottom: 8,
    opacity: 0.5,
  },
  bundlePrice: {
    fontWeight: 900,
    fontSize: 17,
    marginBottom: 12,
  },
  bundleCta: {
    fontSize: 11,
    fontWeight: 800,
    padding: "5px 14px",
    borderRadius: 50,
    letterSpacing: "0.3px",
  },

  // CHECKOUT
  summaryCard: {
    borderRadius: 18,
    padding: "14px 16px",
    marginBottom: 20,
  },
  summaryHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: "1.5px solid rgba(0,0,0,0.06)",
  },
  summaryHeaderText: {
    fontWeight: 900,
    fontSize: 15,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "9px 0",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  summaryLabel: { fontSize: 13, color: "#64748b", fontWeight: 600 },
  summaryVal: { fontSize: 15, fontWeight: 700, color: "#0f172a" },

  inputLabel: {
    display: "block",
    fontSize: 12,
    color: "#64748b",
    fontWeight: 800,
    marginBottom: 6,
    letterSpacing: "0.4px",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    marginBottom: 14,
    borderRadius: 14,
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    fontSize: 14,
    fontWeight: 600,
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },

  checkWrap: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "#fffbeb",
    border: "1.5px solid #fcd34d",
    padding: "12px 14px",
    borderRadius: 14,
    marginBottom: 18,
    cursor: "pointer",
  },
  checkText: { fontSize: 13, color: "#92400e", lineHeight: 1.6, fontWeight: 600 },

  buyBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: 16,
    border: "none",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    fontWeight: 900,
    fontSize: 15,
    cursor: "pointer",
    marginBottom: 12,
    boxShadow: "0 6px 24px rgba(34,197,94,0.35)",
    letterSpacing: "0.2px",
  },
  secureNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
    margin: 0,
    fontWeight: 600,
  },
};
