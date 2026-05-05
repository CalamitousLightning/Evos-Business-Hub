import { useEffect, useState } from "react";

const API = "https://api.evosdata.xyz";

// Networks config — flip available to true when stock is back
const NETWORKS = [
  {
    name: "MTN",
    icon: "🟡",
    style: {
      background: "linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,193,7,0.05))",
      border: "1px solid rgba(255,193,7,0.3)",
    },
    available: true,
  },
  {
    name: "Telecel (Vodafone)",
    icon: "🔴",
    style: {
      background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
      border: "1px solid rgba(239,68,68,0.3)",
    },
    available: false,
  },
  {
    name: "AirtelTigo",
    icon: "🔵",
    style: {
      background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))",
      border: "1px solid rgba(59,130,246,0.3)",
    },
    available: false,
  },
];

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
              background: done || active ? "#38bdf8" : "#1e293b",
              color: done || active ? "#000" : "#475569",
              border: done || active ? "2px solid #38bdf8" : "2px solid #334155",
            }}>
              {done ? "✓" : num}
            </div>
            <span style={{ ...s.stepLabel, color: active || done ? "#e5e7eb" : "#475569" }}>
              {label}
            </span>
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
function StepNetwork({ onSelect }) {
  return (
    <div>
      <p style={s.stepHint}>Choose your network</p>
      {NETWORKS.map((n) => (
        <div
          key={n.name}
          style={{
            ...s.networkOption,
            ...n.style,
            opacity: n.available ? 1 : 0.45,
            cursor: n.available ? "pointer" : "not-allowed",
          }}
          onClick={() => n.available && onSelect(n.name)}
        >
          <span>{n.icon}</span>
          <span style={s.networkName}>{n.name}</span>
          {!n.available && <span style={s.outOfStock}>Out of Stock</span>}
        </div>
      ))}
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
      <p style={s.stepHint}>
        Select bundle for <strong style={{ color: "#38bdf8" }}>{network}</strong>
      </p>
      {bundles.length === 0 && (
        <p style={{ color: "#64748b", fontSize: 13 }}>No bundles available.</p>
      )}
      <div style={s.bundleGrid}>
        {bundles.map((item, i) => (
          <div key={i} style={s.bundleCard} onClick={() => onSelect(item)}>
            <span style={s.bundleName}>{item.bundle}</span>
            <span style={s.bundlePrice}>GH₵ {Number(item.final_price).toFixed(2)}</span>
            <div style={s.bundleArrow}>Tap →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================
// STEP 3 — CHECKOUT
// =========================
function StepCheckout({ selected, onBack, onConfirm, processing }) {
  const [phone, setPhone] = useState("");
  const [confirmPhone, setConfirmPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  const validPhone = (num) => /^0\d{9}$/.test(num);

  const handlePay = () => {
    setError("");
    if (!validPhone(phone)) {
      setError("Phone must be 10 digits and start with 0");
      return;
    }
    if (phone !== confirmPhone) {
      setError("Phone numbers do not match");
      return;
    }
    if (!accepted) {
      setError("You must confirm the refund policy");
      return;
    }
    onConfirm(phone.trim());
  };

  const canPay = phone.length >= 10 && confirmPhone.length >= 10 && accepted && !processing;

  return (
    <div>
      <button style={s.backBtn} onClick={onBack}>← Back</button>
      <p style={s.stepHint}>Almost done — confirm your details</p>

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

      {error && <div style={s.errorBox}>{error}</div>}

      <input
        type="tel"
        placeholder="Phone Number (e.g. 0244000000)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={s.input}
      />

      <input
        type="tel"
        placeholder="Confirm Phone Number"
        value={confirmPhone}
        onChange={(e) => setConfirmPhone(e.target.value)}
        style={s.input}
      />

      <div style={s.notice}>
        <label style={s.checkWrap}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={() => setAccepted(!accepted)}
            style={{ accentColor: "#38bdf8", flexShrink: 0, marginTop: 2 }}
          />
          <span style={s.checkText}>
            I confirm this number is correct.{" "}
            <strong style={{ color: "#f87171" }}>Wrong numbers will NOT be refunded.</strong>{" "}
            I take full responsibility for the number entered.
          </span>
        </label>
      </div>

      <button
        onClick={handlePay}
        disabled={!canPay || processing}
        style={{
          ...s.payBtn,
          opacity: canPay && !processing ? 1 : 0.4,
          cursor: canPay && !processing ? "pointer" : "not-allowed",
        }}
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
          phone_number: phone,
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

  if (loading) return <p style={{ padding: 20, color: "#e5e7eb" }}>Loading store...</p>;
  if (!store) return <p style={{ padding: 20, color: "#e5e7eb" }}>Store not found</p>;

  // Match network — handle "Telecel (Vodafone)" → "Telecel"
  const networkKey = network ? network.replace(" (Vodafone)", "") : null;
  const bundlesForNetwork = (store.prices || []).filter(
    (p) => p.network === networkKey || p.network === network
  );

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <h1 style={s.title}>{store.store_name || store.agent_name || "Agent Store"}</h1>
        <p style={s.sub}>Fast Data Purchase • Powered by EVOS HUB</p>
      </div>

      <Steps step={step} />

      <div style={s.card}>
        {step === 1 && (
          <StepNetwork onSelect={(net) => { setNetwork(net); setStep(2); }} />
        )}
        {step === 2 && (
          <StepBundle
            bundles={bundlesForNetwork}
            network={network}
            onSelect={(item) => { setSelected({ ...item, network: item.network || network }); setStep(3); }}
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

  stepsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepItem: { display: "flex", alignItems: "center", gap: 6 },
  stepCircle: {
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700,
  },
  stepLabel: { fontSize: 11, letterSpacing: "0.04em" },
  stepLine: { width: 28, height: 2, margin: "0 6px" },

  card: {
    background: "rgba(15, 23, 42, 0.88)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: 18,
    padding: "22px 18px",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
  },
  stepHint: { fontSize: 13, color: "#94a3b8", marginBottom: 14, marginTop: 0 },

  networkOption: {
    padding: "16px",
    marginBottom: "12px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: 700,
  },
  networkName: { fontSize: 15, fontWeight: 700, color: "#e5e7eb" },
  outOfStock: {
    marginLeft: "auto",
    color: "#ef4444",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },

  backBtn: {
    background: "none", border: "none",
    color: "#38bdf8", fontSize: 13,
    cursor: "pointer", padding: 0, marginBottom: 10,
  },
  bundleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  bundleCard: {
    background: "rgba(2,6,23,0.65)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "14px 12px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  bundleName: { fontWeight: 700, fontSize: 13, color: "#e5e7eb" },
  bundlePrice: { fontWeight: 800, fontSize: 16, color: "#38bdf8" },
  bundleArrow: { fontSize: 10, color: "#38bdf8", opacity: 0.6, marginTop: 2 },

  summary: {
    background: "rgba(2,6,23,0.65)",
    borderRadius: 12,
    padding: "4px 14px",
    marginBottom: 16,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  summaryRow: {
    display: "flex", justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  summaryLabel: { fontSize: 13, color: "#64748b" },
  summaryVal: { fontSize: 14, fontWeight: 600, color: "#e5e7eb" },

  errorBox: {
    background: "rgba(127,29,29,0.8)",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 12,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(2,6,23,0.75)",
    color: "#fff",
    fontSize: 14,
    marginBottom: 12,
    boxSizing: "border-box",
    outline: "none",
  },
  notice: {
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.25)",
    padding: "12px",
    borderRadius: 12,
    marginBottom: 14,
  },
  checkWrap: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
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
