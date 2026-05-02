import { useEffect, useState } from "react";

const API = "https://api.evosdata.xyz";

const NETWORK_LOGOS = {
  MTN: { color: "#FFD700", text: "#000" },
  Vodafone: { color: "#e30613", text: "#fff" },
  Telecel: { color: "#e30613", text: "#fff" },
  AirtelTigo: { color: "#e4002b", text: "#fff" },
  Airteltigo: { color: "#e4002b", text: "#fff" },
};

// =========================
// STEP INDICATOR
// =========================
function Steps({ step }) {
  const labels = ["Network", "Bundle", "Checkout"];
  return (
    <div style={s.stepsRow}>
      {labels.map((label, i) => {
        const num = i + 1;
        const active = step === num;
        const done = step > num;
        return (
          <div key={i} style={s.stepItem}>
            <div style={{
              ...s.stepCircle,
              background: done ? "#38bdf8" : active ? "#38bdf8" : "#1e293b",
              color: done || active ? "#000" : "#475569",
              border: active ? "2px solid #38bdf8" : done ? "2px solid #38bdf8" : "2px solid #334155",
            }}>
              {done ? "✓" : num}
            </div>
            <span style={{ ...s.stepLabel, color: active || done ? "#e5e7eb" : "#475569" }}>{label}</span>
            {i < 2 && <div style={{ ...s.stepLine, background: done ? "#38bdf8" : "#1e293b" }} />}
          </div>
        );
      })}
    </div>
  );
}

// =========================
// STEP 1 — NETWORK SELECT
// =========================
function StepNetwork({ networks, onSelect }) {
  return (
    <div>
      <p style={s.stepHint}>Choose your network</p>
      <div style={s.networkGrid}>
        {networks.map((net, i) => {
          const brand = NETWORK_LOGOS[net] || { color: "#334155", text: "#fff" };
          return (
            <div key={i} style={{ ...s.networkCard, background: brand.color }} onClick={() => onSelect(net)}>
              <span style={{ ...s.networkName, color: brand.text }}>{net}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================
// STEP 2 — BUNDLE SELECT
// =========================
function StepBundle({ bundles, network, onSelect, onBack }) {
  return (
    <div>
      <button style={s.backBtn} onClick={onBack}>← Back</button>
      <p style={s.stepHint}>Pick a bundle for <strong style={{ color: "#38bdf8" }}>{network}</strong></p>
      <div style={s.bundleList}>
        {bundles.map((item, i) => (
          <div key={i} style={s.bundleCard} onClick={() => onSelect(item)}>
            <div style={s.bundleRow}>
              <span style={s.bundleName}>{item.bundle}</span>
              <span style={s.bundlePrice}>GH₵ {Number(item.final_price).toFixed(2)}</span>
            </div>
            <div style={s.bundleArrow}>Tap to select →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================
// STEP 3 — PHONE + CONFIRM
// =========================
function StepCheckout({ selected, onBack, onConfirm, processing }) {
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);

  const canPay = phone.trim().length >= 9 && accepted && !processing;

  return (
    <div>
      <button style={s.backBtn} onClick={onBack}>← Back</button>
      <p style={s.stepHint}>Almost done — confirm your details</p>

      {/* Order summary */}
      <div style={s.summary}>
        <div style={s.summaryRow}>
          <span style={s.summaryLabel}>Network</span>
          <span style={s.summaryVal}>{selected.network}</span>
        </div>
        <div style={s.summaryRow}>
          <span style={s.summaryLabel}>Bundle</span>
          <span style={s.summaryVal}>{selected.bundle}</span>
        </div>
        <div style={{ ...s.summaryRow, borderBottom: "none" }}>
          <span style={s.summaryLabel}>Amount</span>
          <span style={{ ...s.summaryVal, color: "#38bdf8", fontWeight: 800 }}>
            GH₵ {Number(selected.final_price).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Phone */}
      <label style={s.label}>Recipient Phone Number</label>
      <input
        type="tel"
        placeholder="e.g. 0244000000"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={s.input}
      />

      {/* Disclaimer */}
      <label style={s.checkRow}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          style={{ width: 17, height: 17, accentColor: "#38bdf8", flexShrink: 0, marginTop: 2 }}
        />
        <span style={s.checkText}>
          I confirm this number is correct.{" "}
          <strong style={{ color: "#f87171" }}>Wrong numbers will NOT be refunded.</strong>{" "}
          I take full responsibility for the number entered.
        </span>
      </label>

      <button
        onClick={() => onConfirm(phone.trim())}
        disabled={!canPay}
        style={{ ...s.payBtn, opacity: canPay ? 1 : 0.4, cursor: canPay ? "pointer" : "not-allowed" }}
      >
        {processing ? "Processing..." : `Pay GH₵ ${Number(selected.final_price).toFixed(2)} →`}
      </button>
    </div>
  );
}

// =========================
// MAIN
// =========================
export default function AgentStore({ setPage }) {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [step, setStep] = useState(1);
  const [network, setNetwork] = useState(null);
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const agentId = window.location.pathname.split("/store/")[1];
    if (!agentId) { setLoading(false); return; }

    const load = async () => {
      try {
        const res = await fetch(`${API}/store/${agentId}`);
        const data = await res.json();
        setStore(data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const placeOrder = async (phone) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API}/store/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: store.agent_id,
          phone: phone,
          network: selected.network,
          bundle: selected.bundle,
        }),
      });
      const data = await res.json();

      if (data.status === "created" && data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      alert(data.message || "Order failed");
    } catch (e) {
      alert("Network error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading store...</p>;
  if (!store) return <p style={{ padding: 20 }}>Store not found</p>;

  // Unique networks from prices
  const networks = [...new Set((store.prices || []).map((p) => p.network))];
  const bundlesForNetwork = (store.prices || []).filter((p) => p.network === network);

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>{store.store_name || "Agent Store"}</h1>
        <p style={s.sub}>Fast Data Purchase • Powered by EVOS HUB</p>
      </div>

      <Steps step={step} />

      <div style={s.card}>
        {step === 1 && (
          <StepNetwork
            networks={networks}
            onSelect={(net) => { setNetwork(net); setStep(2); }}
          />
        )}

        {step === 2 && (
          <StepBundle
            bundles={bundlesForNetwork}
            network={network}
            onSelect={(item) => { setSelected(item); setStep(3); }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepCheckout
            selected={selected}
            processing={processing}
            onBack={() => setStep(2)}
            onConfirm={placeOrder}
          />
        )}
      </div>

      {step === 1 && (
        <button style={s.trackBtn} onClick={() => setPage("order-tracking")}>
          Track Order
        </button>
      )}
    </div>
  );
}

// =========================
// STYLES
// =========================
const s = {
  wrap: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "18px 16px 40px",
    fontFamily: "ui-sans-serif, system-ui, Arial",
    color: "#e5e7eb",
  },
  header: { textAlign: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 900, margin: "0 0 4px" },
  sub: { color: "#64748b", fontSize: 13, margin: 0 },

  // Steps
  stepsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 0,
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
  },
  stepLabel: {
    fontSize: 11,
    letterSpacing: "0.04em",
  },
  stepLine: {
    width: 28,
    height: 2,
    margin: "0 6px",
  },

  // Card container
  card: {
    background: "#0f172a",
    borderRadius: 16,
    padding: "20px 16px",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  stepHint: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 14,
    marginTop: 0,
  },

  // Network
  networkGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  networkCard: {
    borderRadius: 14,
    padding: "22px 12px",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.1s",
  },
  networkName: {
    fontWeight: 900,
    fontSize: 16,
    letterSpacing: "0.02em",
  },

  // Bundle
  backBtn: {
    background: "none",
    border: "none",
    color: "#38bdf8",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    marginBottom: 10,
  },
  bundleList: { display: "flex", flexDirection: "column", gap: 10 },
  bundleCard: {
    background: "#020617",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "12px 14px",
    cursor: "pointer",
  },
  bundleRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  bundleName: { fontWeight: 600, fontSize: 14, color: "#e5e7eb" },
  bundlePrice: { fontWeight: 800, fontSize: 15, color: "#38bdf8" },
  bundleArrow: { fontSize: 11, color: "#38bdf8", opacity: 0.6, marginTop: 4 },

  // Checkout
  summary: {
    background: "#020617",
    borderRadius: 12,
    padding: "4px 14px",
    marginBottom: 18,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  summaryLabel: { fontSize: 13, color: "#64748b" },
  summaryVal: { fontSize: 14, fontWeight: 600, color: "#e5e7eb" },
  label: { display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#020617",
    color: "white",
    fontSize: 15,
    marginBottom: 16,
    boxSizing: "border-box",
    outline: "none",
  },
  checkRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20,
    cursor: "pointer",
  },
  checkText: { fontSize: 13, color: "#94a3b8", lineHeight: 1.55 },
  payBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    color: "#000",
    fontWeight: 900,
    fontSize: 15,
  },

  trackBtn: {
    marginTop: 14,
    width: "100%",
    padding: 12,
    borderRadius: 12,
    background: "#1e293b",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
  },
};
