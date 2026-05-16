import { useEffect, useState } from "react";

const API = "https://api.evosdata.xyz";

const NETWORK_CONFIG = {
  MTN: {
    label: "MTN",
    emoji: "🟡",
    color: "#b45309",
    accentColor: "#f59e0b",
    bg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
    border: "#fcd34d",
    shadow: "0 4px 20px rgba(245,158,11,0.25)",
    tag: "Most Popular",
    tagColor: "#f59e0b",
  },
  Telecel: {
    label: "Telecel (Vodafone)",
    emoji: "🔴",
    color: "#991b1b",
    accentColor: "#ef4444",
    bg: "linear-gradient(135deg, #fff5f5, #fee2e2)",
    border: "#fca5a5",
    shadow: "0 4px 20px rgba(239,68,68,0.2)",
    tag: "Reliable",
    tagColor: "#ef4444",
  },
  AirtelTigo: {
    label: "AirtelTigo",
    emoji: "🔵",
    color: "#3730a3",
    accentColor: "#6366f1",
    bg: "linear-gradient(135deg, #f0f1ff, #e0e7ff)",
    border: "#a5b4fc",
    shadow: "0 4px 20px rgba(99,102,241,0.2)",
    tag: "Affordable",
    tagColor: "#6366f1",
  },
};

const bundleAccents = [
  { bg: "#f0fdf4", border: "#86efac", price: "#16a34a", size: "#14532d" },
  { bg: "#eff6ff", border: "#93c5fd", price: "#2563eb", size: "#1e3a8a" },
  { bg: "#fdf4ff", border: "#d8b4fe", price: "#9333ea", size: "#581c87" },
  { bg: "#fff7ed", border: "#fdba74", price: "#ea580c", size: "#7c2d12" },
  { bg: "#f0fdfa", border: "#6ee7b7", price: "#059669", size: "#064e3b" },
  { bg: "#fef2f2", border: "#fca5a5", price: "#dc2626", size: "#7f1d1d" },
];

// =========================
// CONFIRMATION MODAL
// =========================
function ConfirmModal({ selected, networkLabel, networkCfg, onClose, onConfirm, processing }) {
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const canSubmit = phone.trim().length >= 9 && accepted && !processing;

  return (
    <div style={modal.overlay}>
      <div style={modal.box}>
        <div style={modal.header}>
          <span style={modal.headerLabel}>✅ Complete Purchase</span>
          <button style={modal.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Summary */}
        <div style={{
          ...modal.summary,
          background: networkCfg?.bg || "#f8fafc",
          border: `2px solid ${networkCfg?.border || "#e2e8f0"}`,
        }}>
          <div style={modal.summaryHeader}>
            <span style={{ fontSize: 18 }}>{networkCfg?.emoji}</span>
            <span style={{ fontWeight: 900, fontSize: 14, color: networkCfg?.color }}>Order Summary</span>
          </div>
          <div style={modal.summaryRow}>
            <span style={modal.summaryLabel}>Network</span>
            <span style={{ ...modal.summaryValue, color: networkCfg?.accentColor, fontWeight: 800 }}>{networkLabel}</span>
          </div>
          <div style={modal.summaryRow}>
            <span style={modal.summaryLabel}>Bundle</span>
            <span style={modal.summaryValue}>{selected.bundle}</span>
          </div>
          <div style={{ ...modal.summaryRow, borderBottom: "none" }}>
            <span style={modal.summaryLabel}>Amount</span>
            <span style={{ ...modal.summaryValue, color: "#16a34a", fontSize: 20, fontWeight: 900 }}>
              GH₵ {Number(selected.final_price).toFixed(2)}
            </span>
          </div>
        </div>

        <label style={modal.label}>📱 Recipient Phone Number</label>
        <input
          type="tel"
          placeholder="e.g. 0244000000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={modal.input}
        />

        <label style={modal.checkRow}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            style={{ marginRight: 8, accentColor: "#6366f1", width: 15, height: 15, flexShrink: 0, marginTop: 2 }}
          />
          <span style={modal.checkText}>
            I confirm this phone number is correct.{" "}
            <strong style={{ color: "#dc2626" }}>Wrong numbers will NOT be refunded.</strong>
          </span>
        </label>

        <button
          onClick={() => onConfirm(phone.trim())}
          disabled={!canSubmit}
          style={{ ...modal.buyBtn, opacity: canSubmit ? 1 : 0.45, cursor: canSubmit ? "pointer" : "not-allowed" }}
        >
          {processing ? "⏳ Processing..." : `💳 Pay GH₵ ${Number(selected.final_price).toFixed(2)} via Paystack`}
        </button>
        <p style={modal.secureNote}>🔒 Secured & encrypted by Paystack</p>
      </div>
    </div>
  );
}

// =========================
// MAIN STORE PAGE
// =========================
export default function StorePage({ setPage }) {
  const agentId = window.location.pathname.split("/store/")[1];

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [step, setStep] = useState(1);
  const [network, setNetwork] = useState("");
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!agentId) { setLoading(false); return; }
    const loadStore = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/store/${agentId}`);
        const data = await res.json();
        if (!res.ok || data.status === "error") { setStore(null); }
        else { setStore(data); }
      } catch (err) {
        console.log("Store error:", err);
        setStore(null);
      } finally {
        setLoading(false);
      }
    };
    loadStore();
  }, [agentId]);

  const placeOrder = async (phone) => {
    if (!selected) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API}/store/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: Number(agentId),
          network: selected.network,
          bundle: selected.bundle,
          phone_number: phone,
        }),
      });
      const data = await res.json();
      if (data.status === "created" && data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      alert(data.message || "Failed to create order");
    } catch (err) {
      alert("Network error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div style={styles.loadingWrap}>
      <div style={styles.loadingSpinner}>⏳</div>
      <p style={styles.loadingText}>Loading store...</p>
    </div>
  );

  if (!store) return (
    <div style={styles.errorWrap}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
      <h2 style={styles.errorTitle}>Store Not Found</h2>
      <p style={styles.errorText}>This store link may be invalid or inactive.</p>
    </div>
  );

  const availableNetworks = [...new Set((store.prices || []).map((p) => p.network))];
  const bundles = (store.prices || []).filter((p) => p.network === network);
  const cfg = NETWORK_CONFIG[network] || {};
  const networkLabel = cfg.label || network;

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerBadge}>🏪 Agent Store</div>
        <h1 style={styles.title}>{store.agent_name}'s Store</h1>
        <p style={styles.sub}>Fast Data Purchase · Powered by <span style={styles.brandSpan}>EVOS HUB</span></p>
      </div>

      {/* PROGRESS */}
      <div style={styles.progressWrap}>
        {["Network", "Bundle", "Pay"].map((label, i) => {
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

      <div style={styles.wrapper}>

        {/* ============ STEP 1 — NETWORK ============ */}
        {step === 1 && (
          <div style={styles.box}>
            <p style={styles.stepLabel}>Step 1 of 2 · Select Your Network</p>

            <div style={styles.networkGrid}>
              {availableNetworks.map((netKey) => {
                const c = NETWORK_CONFIG[netKey] || {
                  label: netKey, emoji: "📡", color: "#475569", accentColor: "#64748b",
                  bg: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "#cbd5e1",
                  shadow: "none", tag: "", tagColor: "#64748b",
                };
                return (
                  <div
                    key={netKey}
                    style={{
                      ...styles.networkCard,
                      background: c.bg,
                      border: `2px solid ${c.border}`,
                      boxShadow: c.shadow,
                    }}
                    onClick={() => { setNetwork(netKey); setStep(2); }}
                  >
                    {c.tag && (
                      <div style={{
                        ...styles.networkTag,
                        background: c.tagColor + "1a",
                        color: c.tagColor,
                        border: `1px solid ${c.tagColor}33`,
                      }}>
                        {c.tag}
                      </div>
                    )}
                    <div style={styles.networkLeft}>
                      <div style={styles.networkEmoji}>{c.emoji}</div>
                      <div>
                        <div style={{ ...styles.networkName, color: c.color }}>{c.label}</div>
                      </div>
                    </div>
                    <div style={{ ...styles.networkArrow, color: c.accentColor }}>→</div>
                  </div>
                );
              })}
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoChip}>🔒 Paystack Secured</span>
              <span style={styles.infoChip}>⚡ Instant Delivery</span>
            </div>

            <button
              style={styles.trackBtn}
              onClick={() => {
                sessionStorage.setItem("storeAgentId", agentId);
                setPage("eta-track");
              }}
            >
              📦 Track My Order
            </button>
          </div>
        )}

        {/* ============ STEP 2 — BUNDLES ============ */}
        {step === 2 && (
          <div style={styles.box}>
            <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>

            <p style={styles.stepLabel}>Step 2 of 2 · Pick a Bundle</p>

            <div style={{
              ...styles.networkPill,
              background: cfg.bg,
              border: `2px solid ${cfg.border}`,
              color: cfg.color,
            }}>
              {cfg.emoji} {networkLabel}
            </div>

            {bundles.length === 0 && (
              <div style={styles.emptyBox}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                <p style={styles.emptyText}>No bundles available for this network.</p>
              </div>
            )}

            <div style={styles.bundleGrid}>
              {bundles.map((item, i) => {
                const accent = bundleAccents[i % bundleAccents.length];
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.bundleCard,
                      background: accent.bg,
                      border: `2px solid ${accent.border}`,
                    }}
                    onClick={() => setSelected(item)}
                  >
                    <div style={{ ...styles.bundleSize, color: accent.size }}>{item.bundle}</div>
                    <div style={{ ...styles.bundleDivider, background: accent.border }} />
                    <div style={{ ...styles.bundlePrice, color: accent.price }}>
                      GH₵ {Number(item.final_price).toFixed(2)}
                    </div>
                    <div style={{ ...styles.bundleCta, background: accent.border, color: accent.price }}>
                      Select →
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* CONFIRM MODAL */}
      {selected && (
        <ConfirmModal
          selected={selected}
          networkLabel={networkLabel}
          networkCfg={cfg}
          processing={processing}
          onClose={() => { if (!processing) setSelected(null); }}
          onConfirm={placeOrder}
        />
      )}

      {/* ===================== FLOATING SUPPORT ===================== */}
      <div style={styles.floatWrap}>
        {chatOpen && (
          <div style={styles.chatPopup}>
            <div style={styles.chatHeader}>
              <span style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>💬 EVOS Support</span>
              <button style={styles.chatClose} onClick={() => setChatOpen(false)}>✕</button>
            </div>
            <p style={styles.chatMsg}>Hi! How can we help you? Choose an option 👇</p>
            <div style={styles.chatOptions}>
              <button style={styles.chatOption}
                onClick={() => window.open("https://wa.me/233208718943", "_blank")}>
                💬 WhatsApp Chat
              </button>
              <button style={styles.chatOption}
                onClick={() => window.open("https://whatsapp.com/channel/0029VaTrnsZEgGfFXkIcjt1M", "_blank")}>
                👥 Community
              </button>
              <button style={styles.chatOption}
                onClick={() => window.location.href = "mailto:support@evosdata.xyz"}>
                📧 Email Support
              </button>
            </div>
          </div>
        )}
        <button style={styles.floatBtn} onClick={() => setChatOpen(!chatOpen)}>
          {chatOpen ? "✕" : "💬"}
        </button>
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: "28px 18px 80px",
    minHeight: "100vh",
    fontFamily: "'Nunito', 'Poppins', ui-rounded, system-ui, Arial",
    background: "linear-gradient(160deg, #f8faff 0%, #f0f4ff 50%, #fdf4ff 100%)",
    color: "#1e293b",
  },

  // LOADING / ERROR
  loadingWrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "60vh",
    fontFamily: "'Nunito', ui-rounded, system-ui, Arial",
    background: "linear-gradient(160deg, #f8faff, #f0f4ff)",
  },
  loadingSpinner: { fontSize: 40, marginBottom: 12, animation: "spin 1s linear infinite" },
  loadingText: { fontSize: 15, color: "#64748b", fontWeight: 700 },
  errorWrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "60vh", textAlign: "center",
    padding: 24, fontFamily: "'Nunito', ui-rounded, system-ui, Arial",
    background: "linear-gradient(160deg, #f8faff, #f0f4ff)",
  },
  errorTitle: { fontSize: 22, fontWeight: 900, color: "#0f172a", marginBottom: 8 },
  errorText: { fontSize: 14, color: "#64748b", fontWeight: 600 },

  // HEADER
  header: { textAlign: "center", marginBottom: 24 },
  headerBadge: {
    display: "inline-block", padding: "5px 18px", borderRadius: 50,
    background: "linear-gradient(135deg, #e0e7ff, #ddd6fe)",
    border: "1px solid #c4b5fd", color: "#6d28d9",
    fontSize: 12, fontWeight: 800, marginBottom: 10, letterSpacing: "0.5px",
  },
  title: {
    fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 900,
    color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px",
  },
  sub: { fontSize: 13, color: "#64748b", margin: 0, fontWeight: 600 },
  brandSpan: { color: "#6366f1", fontWeight: 900 },

  // PROGRESS
  progressWrap: {
    display: "flex", justifyContent: "center", alignItems: "center",
    position: "relative", maxWidth: 340, margin: "0 auto 24px",
  },
  progressItem: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 6, flex: 1, position: "relative", zIndex: 1,
  },
  progressDot: {
    width: 34, height: 34, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 800, transition: "all 0.35s",
  },
  progressLabel: { fontSize: 11, transition: "color 0.3s" },
  progressLine: {
    position: "absolute", top: 17, left: "16%", right: "16%",
    height: 3, background: "#e5e7eb", zIndex: 0, borderRadius: 10, overflow: "hidden",
  },
  progressLineFill: {
    height: "100%",
    background: "linear-gradient(90deg, #22c55e, #6366f1)",
    borderRadius: 10, transition: "width 0.4s ease",
  },

  wrapper: { maxWidth: 480, margin: "0 auto" },

  box: {
    background: "white", padding: "24px 20px", borderRadius: 24,
    border: "1.5px solid #e5e7eb",
    boxShadow: "0 8px 40px rgba(99,102,241,0.08), 0 2px 8px rgba(0,0,0,0.04)",
  },

  stepLabel: {
    fontSize: 11, color: "#6366f1", fontWeight: 800,
    textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 18px",
  },

  // NETWORK
  networkGrid: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 },
  networkCard: {
    padding: "16px 18px", borderRadius: 18, cursor: "pointer",
    display: "flex", alignItems: "center", transition: "transform 0.15s", position: "relative",
  },
  networkTag: {
    position: "absolute", top: 10, right: 42,
    fontSize: 10, fontWeight: 800, padding: "2px 8px",
    borderRadius: 50, letterSpacing: "0.5px", textTransform: "uppercase",
  },
  networkLeft: { display: "flex", alignItems: "center", gap: 14, flex: 1 },
  networkEmoji: { fontSize: 30, flexShrink: 0 },
  networkName: { fontWeight: 900, fontSize: 16, marginBottom: 2 },
  networkArrow: { fontSize: 20, fontWeight: 900, flexShrink: 0 },

  infoRow: { display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  infoChip: {
    fontSize: 11, color: "#64748b", fontWeight: 700,
    background: "#f1f5f9", border: "1px solid #e2e8f0",
    padding: "4px 10px", borderRadius: 50,
  },

  trackBtn: {
    width: "100%", padding: "12px", borderRadius: 14,
    background: "linear-gradient(135deg, #e0e7ff, #ede9fe)",
    border: "1.5px solid #c4b5fd", color: "#6d28d9",
    fontWeight: 800, fontSize: 14, cursor: "pointer",
  },

  // BUNDLE STEP
  backBtn: {
    background: "#f1f5f9", border: "none", color: "#6366f1",
    fontSize: 13, fontWeight: 800, cursor: "pointer",
    padding: "6px 14px", borderRadius: 50, marginBottom: 16, display: "inline-block",
  },
  networkPill: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 18px", borderRadius: 50, fontSize: 13, fontWeight: 900, marginBottom: 20,
  },
  emptyBox: { textAlign: "center", padding: "30px 0 10px" },
  emptyText: { color: "#94a3b8", fontSize: 14, margin: 0, fontWeight: 600 },

  bundleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  bundleCard: {
    borderRadius: 18, padding: "18px 14px 14px", cursor: "pointer",
    textAlign: "center", transition: "transform 0.15s",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
  },
  bundleSize: { fontWeight: 900, fontSize: 20, marginBottom: 8, letterSpacing: "-0.3px" },
  bundleDivider: { width: "50%", height: 2, borderRadius: 10, marginBottom: 8, opacity: 0.5 },
  bundlePrice: { fontWeight: 900, fontSize: 17, marginBottom: 12 },
  bundleCta: { fontSize: 11, fontWeight: 800, padding: "5px 14px", borderRadius: 50 },

  // FLOATING SUPPORT
  floatWrap: {
    position: "fixed", bottom: 24, right: 20, zIndex: 9999,
    display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10,
  },
  chatPopup: {
    background: "white", border: "1.5px solid #e5e7eb",
    borderRadius: 18, padding: 18, width: 270,
    boxShadow: "0 8px 40px rgba(99,102,241,0.15)",
  },
  chatHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  chatClose: {
    background: "none", border: "none", color: "#94a3b8",
    cursor: "pointer", fontSize: 14, fontWeight: 800,
  },
  chatMsg: { fontSize: 13, color: "#64748b", lineHeight: 1.55, margin: "0 0 12px", fontWeight: 600 },
  chatOptions: { display: "flex", flexDirection: "column", gap: 8 },
  chatOption: {
    padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb",
    background: "#f8fafc", color: "#0f172a", fontSize: 13,
    fontWeight: 700, cursor: "pointer", textAlign: "left",
  },
  floatBtn: {
    width: 54, height: 54, borderRadius: "50%",
    background: "linear-gradient(135deg, #25D366, #128C7E)",
    border: "none", color: "white", fontSize: 22, cursor: "pointer",
    boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
};

const modal = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)",
    display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000,
  },
  box: {
    width: "100%", maxWidth: 480, background: "white",
    borderRadius: "24px 24px 0 0", padding: "22px 20px 36px",
    border: "1.5px solid #e5e7eb",
    boxShadow: "0 -8px 40px rgba(99,102,241,0.12)",
    fontFamily: "'Nunito', 'Poppins', ui-rounded, system-ui, Arial",
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 18,
  },
  headerLabel: { fontWeight: 900, fontSize: 16, color: "#0f172a" },
  closeBtn: {
    background: "#f1f5f9", border: "none", color: "#64748b",
    fontSize: 13, cursor: "pointer", padding: "6px 10px", borderRadius: 50, fontWeight: 800,
  },
  summary: { borderRadius: 16, padding: "10px 16px", marginBottom: 18 },
  summaryHeader: {
    display: "flex", alignItems: "center", gap: 8,
    marginBottom: 10, paddingBottom: 8,
    borderBottom: "1.5px solid rgba(0,0,0,0.06)",
  },
  summaryRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  summaryLabel: { fontSize: 12, color: "#64748b", fontWeight: 600 },
  summaryValue: { fontSize: 14, fontWeight: 700, color: "#0f172a" },
  label: { display: "block", fontSize: 12, color: "#64748b", fontWeight: 800, marginBottom: 6, letterSpacing: "0.4px" },
  input: {
    width: "100%", padding: "13px 14px", borderRadius: 14,
    border: "1.5px solid #e2e8f0", background: "#f8fafc",
    color: "#0f172a", fontSize: 14, fontWeight: 600,
    marginBottom: 14, boxSizing: "border-box", outline: "none",
  },
  checkRow: {
    display: "flex", alignItems: "flex-start", gap: 0,
    background: "#fffbeb", border: "1.5px solid #fcd34d",
    padding: "12px 14px", borderRadius: 14, marginBottom: 18, cursor: "pointer",
  },
  checkText: { fontSize: 12, color: "#92400e", lineHeight: 1.55, fontWeight: 600 },
  buyBtn: {
    width: "100%", padding: 15, borderRadius: 16, border: "none",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white", fontWeight: 900, fontSize: 15, cursor: "pointer",
    boxShadow: "0 6px 24px rgba(34,197,94,0.35)", marginBottom: 10,
  },
  secureNote: { textAlign: "center", fontSize: 12, color: "#94a3b8", margin: 0, fontWeight: 600 },
};
