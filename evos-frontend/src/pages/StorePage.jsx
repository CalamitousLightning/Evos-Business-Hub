import { useEffect, useState } from "react";

const API = "https://api.evosdata.xyz";

const NETWORK_CONFIG = {
  MTN:        { label: "MTN",               color: "#FFC107", bg: "linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,193,7,0.05))",   border: "1px solid rgba(255,193,7,0.4)"   },
  Telecel:    { label: "Telecel (Vodafone)", color: "#ef4444", bg: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",   border: "1px solid rgba(239,68,68,0.4)"   },
  AirtelTigo: { label: "AirtelTigo",         color: "#6366f1", bg: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))", border: "1px solid rgba(99,102,241,0.4)"  },
};

// =========================
// CONFIRMATION MODAL — single phone, small checkbox
// =========================
function ConfirmModal({ selected, networkLabel, onClose, onConfirm, processing }) {
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);

  const canSubmit = phone.trim().length >= 9 && accepted && !processing;

  return (
    <div style={modal.overlay}>
      <div style={modal.box}>

        <div style={modal.header}>
          <span style={modal.headerLabel}>Complete Purchase</span>
          <button style={modal.closeBtn} onClick={onClose}>&#x2715;</button>
        </div>

        <div style={modal.summary}>
          <div style={modal.summaryRow}>
            <span style={modal.summaryLabel}>Network</span>
            <span style={modal.summaryValue}>{networkLabel}</span>
          </div>
          <div style={modal.summaryRow}>
            <span style={modal.summaryLabel}>Bundle</span>
            <span style={modal.summaryValue}>{selected.bundle}</span>
          </div>
          <div style={{ ...modal.summaryRow, borderBottom: "none" }}>
            <span style={modal.summaryLabel}>Amount</span>
            <span style={{ ...modal.summaryValue, color: "#38bdf8", fontWeight: 800 }}>
              GH&#8373; {Number(selected.final_price).toFixed(2)}
            </span>
          </div>
        </div>

        <label style={modal.label}>Recipient Phone Number</label>
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
            style={{ marginRight: 8, accentColor: "#38bdf8", width: 14, height: 14, flexShrink: 0, marginTop: 2 }}
          />
          <span style={modal.checkText}>
            I confirm this phone number is correct.{" "}
            <strong style={{ color: "#f87171" }}>Wrong numbers will NOT be refunded.</strong>
          </span>
        </label>

        <button
          onClick={() => onConfirm(phone.trim())}
          disabled={!canSubmit}
          style={{
            ...modal.buyBtn,
            opacity: canSubmit ? 1 : 0.45,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {processing ? "Processing..." : "Pay GH\u20B5 " + Number(selected.final_price).toFixed(2) + " \u2192"}
        </button>
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

  if (loading) return <p style={{ padding: 20, color: "#e5e7eb" }}>Loading store...</p>;
  if (!store) return <p style={{ padding: 20, color: "#e5e7eb" }}>Store not found</p>;

  const availableNetworks = [...new Set((store.prices || []).map((p) => p.network))];
  const bundles = (store.prices || []).filter((p) => p.network === network);
  const cfg = NETWORK_CONFIG[network] || {};
  const networkLabel = cfg.label || network;

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>{store.agent_name}'s Store</h1>
      <p style={styles.sub}>Fast Data Purchase &middot; Powered by EVOS HUB</p>

      {/* STEP 1 — NETWORK */}
      {step === 1 && (
        <>
          {/* Dark panel — always dark regardless of theme, like Shop screenshot */}
          <div style={styles.panel}>
            <p style={styles.panelTitle}>SELECT NETWORK</p>

            {availableNetworks.map((netKey) => {
              const c = NETWORK_CONFIG[netKey] || { label: netKey, color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.3)" };
              return (
                <div
                  key={netKey}
                  style={{ ...styles.networkCard, background: c.bg, border: c.border }}
                  onClick={() => { setNetwork(netKey); setStep(2); }}
                >
                  <div style={{ ...styles.networkDot, background: c.color, boxShadow: `0 0 10px ${c.color}88` }} />
                  <span style={styles.networkName}>{c.label}</span>
                  <span style={styles.networkArrow}>&rarr;</span>
                </div>
              );
            })}
          </div>

          <button style={styles.track} onClick={() => setPage("eta-track")}>
            Track Order
          </button>
        </>
      )}

      {/* STEP 2 — BUNDLES */}
      {step === 2 && (
        <>
          <button style={styles.back} onClick={() => setStep(1)}>&larr; Back</button>
          <p style={styles.hint}>
            Select a bundle for <strong style={{ color: "#38bdf8" }}>{networkLabel}</strong>
          </p>

          {bundles.length === 0 && (
            <p style={{ color: "#64748b", fontSize: 13 }}>No bundles available.</p>
          )}

          <div style={styles.grid}>
            {bundles.map((item, i) => (
              <div key={i} style={styles.card} onClick={() => setSelected(item)}>
                <div style={styles.cardTop}>
                  <span style={styles.bundleName}>{item.bundle}</span>
                  <span style={styles.price}>GH&#8373; {Number(item.final_price).toFixed(2)}</span>
                </div>
                <div style={styles.selectHint}>Tap to select &rarr;</div>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <ConfirmModal
          selected={selected}
          networkLabel={networkLabel}
          processing={processing}
          onClose={() => { if (!processing) setSelected(null); }}
          onConfirm={placeOrder}
        />
      )}
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 520, margin: "0 auto", padding: 18, color: "#e5e7eb" },
  title: { fontSize: 26, fontWeight: 900, margin: "0 0 4px" },
  sub: { color: "#94a3b8", marginBottom: 20, fontSize: 13 },
  hint: { color: "#94a3b8", fontSize: 13, marginBottom: 14 },
  back: {
    background: "none", border: "none", color: "#38bdf8",
    fontSize: 13, cursor: "pointer", padding: 0,
    marginBottom: 12, fontWeight: 700, display: "block",
  },

  // Dark panel — always dark, like Shop screenshot
  panel: {
    background: "rgba(15, 23, 42, 0.88)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: 18,
    padding: "20px 16px",
    marginBottom: 16,
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
  },
  panelTitle: {
    color: "#38bdf8",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "0.8px",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 0,
  },

  networkCard: {
    padding: "14px 16px",
    borderRadius: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontWeight: 700,
    marginBottom: 10,
    transition: "0.2s ease",
  },
  networkDot: { width: 24, height: 24, borderRadius: "50%", flexShrink: 0 },
  networkName: { fontSize: 15, fontWeight: 700, color: "#e5e7eb", flex: 1 },
  networkArrow: { color: "#38bdf8", fontSize: 16 },

  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  card: {
    padding: "14px 16px", borderRadius: 14, cursor: "pointer",
    background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", transition: "0.15s",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  bundleName: { fontWeight: 700, fontSize: 14, color: "#e5e7eb" },
  price: { fontWeight: 800, fontSize: 14, color: "#38bdf8" },
  selectHint: { fontSize: 11, color: "#38bdf8", opacity: 0.7, letterSpacing: "0.05em" },

  track: {
    width: "100%", padding: 12, borderRadius: 12,
    background: "#1e293b", color: "white",
    border: "none", cursor: "pointer", fontSize: 14,
  },
};

const modal = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
    display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000,
  },
  box: {
    width: "100%", maxWidth: 480, background: "#0f172a",
    borderRadius: "20px 20px 0 0", padding: "20px 20px 32px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerLabel: { fontWeight: 700, fontSize: 16, color: "#e5e7eb" },
  closeBtn: { background: "none", border: "none", color: "#64748b", fontSize: 16, cursor: "pointer", padding: "2px 6px" },
  summary: { background: "#020617", borderRadius: 12, padding: "4px 14px", marginBottom: 18, border: "1px solid rgba(255,255,255,0.06)" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  summaryLabel: { fontSize: 13, color: "#64748b" },
  summaryValue: { fontSize: 14, fontWeight: 600, color: "#e5e7eb" },
  label: { display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)", background: "#020617",
    color: "white", fontSize: 15, marginBottom: 14, boxSizing: "border-box", outline: "none",
  },
  checkRow: { display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 20, cursor: "pointer" },
  checkText: { fontSize: 12, color: "#94a3b8", lineHeight: 1.45 },
  buyBtn: {
    width: "100%", padding: 14, borderRadius: 14, border: "none",
    background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    color: "#000", fontWeight: 900, fontSize: 15, letterSpacing: "0.02em",
  },
};
