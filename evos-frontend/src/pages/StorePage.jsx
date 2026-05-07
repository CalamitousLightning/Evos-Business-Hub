import { useEffect, useState } from "react";

const API = "https://evos-business-hub.onrender.com";

// =========================
// CONFIRMATION MODAL
// =========================
function ConfirmModal({ selected, onClose, onConfirm, processing }) {
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);

  const canSubmit = phone.trim().length >= 9 && accepted && !processing;

  return (
    <div style={modal.overlay}>
      <div style={modal.box}>

        {/* Header */}
        <div style={modal.header}>
          <span style={modal.headerLabel}>Complete Purchase</span>
          <button style={modal.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Selected bundle summary */}
        <div style={modal.summary}>
          <div style={modal.summaryRow}>
            <span style={modal.summaryLabel}>Network</span>
            <span style={modal.summaryValue}>{selected.network}</span>
          </div>
          <div style={modal.summaryRow}>
            <span style={modal.summaryLabel}>Bundle</span>
            <span style={modal.summaryValue}>{selected.bundle}</span>
          </div>
          <div style={{ ...modal.summaryRow, borderBottom: "none" }}>
            <span style={modal.summaryLabel}>Amount</span>
            <span style={{ ...modal.summaryValue, color: "#38bdf8", fontWeight: 800 }}>
              GH₵ {Number(selected.final_price).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Phone input */}
        <label style={modal.label}>Recipient Phone Number</label>
        <input
          type="tel"
          placeholder="e.g. 0244000000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={modal.input}
        />

        {/* Disclaimer checkbox */}
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

        {/* Buy button */}
        <button
          onClick={() => onConfirm(phone.trim())}
          disabled={!canSubmit}
          style={{
            ...modal.buyBtn,
            opacity: canSubmit ? 1 : 0.45,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {processing ? "Processing..." : `Pay GH₵ ${Number(selected.final_price).toFixed(2)} →`}
        </button>
      </div>
    </div>
  );
}

// =========================
// MAIN STORE PAGE
// =========================
export default function StorePage({ setPage }) {
  const agentId = window.location.pathname.split("/").pop();

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [selected, setSelected] = useState(null);  // bundle that opens modal
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadStore = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/store/${agentId}`);
        const data = await res.json();
        if (!res.ok || data.status === "error") {
          setStore(null);
        } else {
          setStore(data);
        }
      } catch (err) {
        console.log("Store error:", err);
        setStore(null);
      } finally {
        setLoading(false);
      }
    };
    loadStore();
  }, [agentId]);

  // =========================
  // PLACE ORDER
  // =========================
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

      if (data.status === "created") {
        if (data.payment_url) {
          window.location.href = data.payment_url;
          return;
        }
        alert("Payment URL missing");
        return;
      }

      alert(data.message || "Failed to create order");
    } catch (err) {
      console.log(err);
      alert("Network error");
    } finally {
      setProcessing(false);
    }
  };

  // =========================
  // UI STATES
  // =========================
  if (loading) return <p style={{ padding: 20, color: "#e5e7eb" }}>Loading store...</p>;
  if (!store) return <p style={{ padding: 20, color: "#e5e7eb" }}>Store not found</p>;

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>{store.agent_name}'s Store</h1>
      <p style={styles.sub}>Select a bundle to get started</p>

      {/* BUNDLE GRID */}
      <div style={styles.grid}>
        {(store.prices || []).map((item, i) => (
          <div
            key={i}
            style={styles.card}
            onClick={() => setSelected(item)}
          >
            <div style={styles.cardTop}>
              <span style={styles.network}>{item.network}</span>
              <span style={styles.price}>GH₵ {Number(item.final_price).toFixed(2)}</span>
            </div>
            <p style={styles.bundle}>{item.bundle}</p>
            <div style={styles.selectHint}>Tap to select →</div>
          </div>
        ))}
      </div>

      {/* TRACK */}
      <button style={styles.track} onClick={() => setPage("order-tracking")}>
        Track Order
      </button>

      {/* MODAL — renders on top when a bundle is selected */}
      {selected && (
        <ConfirmModal
          selected={selected}
          processing={processing}
          onClose={() => { if (!processing) setSelected(null); }}
          onConfirm={placeOrder}
        />
      )}
    </div>
  );
}

// =========================
// STYLES
// =========================
const styles = {
  wrap: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 18,
    color: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: 900,
    margin: "0 0 4px",
  },
  sub: {
    color: "#94a3b8",
    marginBottom: 20,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },
  card: {
    padding: "14px 16px",
    borderRadius: 14,
    cursor: "pointer",
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "border-color 0.15s, transform 0.1s",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  network: {
    fontWeight: 700,
    fontSize: 15,
    color: "#e5e7eb",
  },
  price: {
    fontWeight: 800,
    fontSize: 16,
    color: "#38bdf8",
  },
  bundle: {
    margin: "4px 0 8px",
    color: "#94a3b8",
    fontSize: 13,
  },
  selectHint: {
    fontSize: 11,
    color: "#38bdf8",
    opacity: 0.7,
    letterSpacing: "0.05em",
  },
  track: {
    marginTop: 20,
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

const modal = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "flex-end",          // slides up from bottom on mobile
    justifyContent: "center",
    zIndex: 1000,
    padding: "0 0 0 0",
  },
  box: {
    width: "100%",
    maxWidth: 480,
    background: "#0f172a",
    borderRadius: "20px 20px 0 0",
    padding: "20px 20px 32px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLabel: {
    fontWeight: 700,
    fontSize: 16,
    color: "#e5e7eb",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: 16,
    cursor: "pointer",
    padding: "2px 6px",
  },
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
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#e5e7eb",
  },
  label: {
    display: "block",
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 6,
  },
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
    gap: 0,
    marginBottom: 20,
    cursor: "pointer",
  },
  checkText: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  buyBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    color: "#000",
    fontWeight: 900,
    fontSize: 15,
    letterSpacing: "0.02em",
  },
};
