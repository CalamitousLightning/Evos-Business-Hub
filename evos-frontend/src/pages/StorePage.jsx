import { useEffect, useState } from "react";

const API = "https://api.evosdata.xyz";

const NETWORK_CONFIG = {
  MTN:        { icon: "🟡", light: "#FFC107", dark: "rgba(255,193,7,0.15)", border: "rgba(255,193,7,0.4)" },
  Telecel:    { icon: "🔴", light: "#ef4444", dark: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.4)"  },
  AirtelTigo: { icon: "🔵", light: "#3b82f6", dark: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.4)" },
};

const NETWORK_LABELS = {
  MTN: "MTN",
  Telecel: "Telecel (Vodafone)",
  AirtelTigo: "AirtelTigo",
};

// =========================
// CONFIRMATION MODAL
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
          <button style={modal.closeBtn} onClick={onClose}>âœ•</button>
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
              GHâ‚µ {Number(selected.final_price).toFixed(2)}
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
            style={{ marginRight: 10, accentColor: "#38bdf8", width: 16, height: 16, flexShrink: 0 }}
          />
          <span style={modal.checkText}>
            I confirm this phone number is correct.{" "}
            <strong style={{ color: "#f87171" }}>Wrong numbers will NOT be refunded.</strong>{" "}
            I take full responsibility for the number entered.
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
          {processing ? "Processing..." : `Pay GHâ‚µ ${Number(selected.final_price).toFixed(2)} â†’`}
        </button>
      </div>
    </div>
  );
}

// =========================
// MAIN STORE PAGE
// =========================
export default function StorePage({ setPage, theme }) {
  const agentId = window.location.pathname.split("/store/")[1];
  const dark = theme !== "light";

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
        setStore(!res.ok || data.status === "error" ? null : data);
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
  const networkLabel = NETWORK_LABELS[network] || network;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 18, color: dark ? "#e5e7eb" : "#0f172a" }}>

      <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px" }}>
        {store.agent_name}'s Store
      </h1>
      <p style={{ color: dark ? "#94a3b8" : "#64748b", marginBottom: 20, fontSize: 13 }}>
        Fast Data Purchase â€¢ Powered by EVOS HUB
      </p>

      {/* STEP 1 â€” NETWORK */}
      {step === 1 && (
        <>
          <p style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 13, marginBottom: 14 }}>
            Select your network
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {availableNetworks.map((netKey) => {
              const cfg = NETWORK_CONFIG[netKey] || { icon: "ðŸ“¶", dark: "rgba(100,116,139,0.15)", border: "rgba(100,116,139,0.4)" };
              const label = NETWORK_LABELS[netKey] || netKey;
              return (
                <div
                  key={netKey}
                  onClick={() => { setNetwork(netKey); setStep(2); }}
                  style={{
                    padding: "18px 20px",
                    borderRadius: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    fontWeight: 700,
                    background: dark
                      ? `linear-gradient(135deg, ${cfg.dark}, transparent)`
                      : `white`,
                    border: `1.5px solid ${cfg.border}`,
                    boxShadow: dark
                      ? `0 2px 12px ${cfg.dark}`
                      : `0 2px 10px rgba(0,0,0,0.08)`,
                  }}
                >
                  <span style={{ fontSize: 26 }}>{cfg.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: dark ? "#e5e7eb" : "#0f172a", flex: 1 }}>
                    {label}
                  </span>
                  <span style={{ color: "#38bdf8", fontSize: 18 }}>â†’</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setPage("order-tracking")}
            style={{
              width: "100%", padding: 12, borderRadius: 12,
              background: dark ? "#1e293b" : "#f1f5f9",
              color: dark ? "white" : "#334155",
              border: "none", cursor: "pointer", fontSize: 14,
            }}
          >
            Track Order
          </button>
        </>
      )}

      {/* STEP 2 â€” BUNDLES */}
      {step === 2 && (
        <>
          <button
            onClick={() => setStep(1)}
            style={{ background: "none", border: "none", color: "#38bdf8", fontSize: 13,
              cursor: "pointer", padding: 0, marginBottom: 12, fontWeight: 700, display: "block" }}
          >â† Back</button>

          <p style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 13, marginBottom: 14 }}>
            Select a bundle for <strong style={{ color: "#38bdf8" }}>{networkLabel}</strong>
          </p>

          {bundles.length === 0 && (
            <p style={{ color: "#64748b", fontSize: 13 }}>No bundles available.</p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {bundles.map((item, i) => (
              <div
                key={i}
                onClick={() => setSelected(item)}
                style={{
                  padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                  background: dark ? "#0f172a" : "#ffffff",
                  border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                  boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: dark ? "#e5e7eb" : "#0f172a", marginBottom: 4 }}>
                  {item.bundle}
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#38bdf8" }}>
                  GHâ‚µ {Number(item.final_price).toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: "#38bdf8", opacity: 0.7, marginTop: 6 }}>
                  Tap to select â†’
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL */}
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
    color: "white", fontSize: 15, marginBottom: 16, boxSizing: "border-box", outline: "none",
  },
  checkRow: { display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 20, cursor: "pointer" },
  checkText: { fontSize: 13, color: "#94a3b8", lineHeight: 1.5 },
  buyBtn: {
    width: "100%", padding: 14, borderRadius: 14, border: "none",
    background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    color: "#000", fontWeight: 900, fontSize: 15, letterSpacing: "0.02em",
  },
};
