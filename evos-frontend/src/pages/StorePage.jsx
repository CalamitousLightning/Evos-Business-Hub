import { useEffect, useState } from "react";

const API = "https://api.evosdata.xyz";

export default function StorePage({ setPage }) {
  const agentId = window.location.pathname.split("/").pop();

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [selected, setSelected] = useState(null);
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);

  // =========================
  // LOAD STORE
  // =========================
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
  // PLACE ORDER (FIXED PAYSTACK FLOW)
  // =========================
  const placeOrder = async () => {
    if (!selected) return alert("Select a bundle");
    if (!phone.trim()) return alert("Enter phone number");

    setProcessing(true);

    try {
      const res = await fetch(`${API}/store/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: Number(agentId),
          network: selected.network,
          bundle: selected.bundle,
          phone_number: phone.trim(),
        }),
      });

      const data = await res.json();

      // =========================
      // 🔥 CRITICAL FIX HERE
      // =========================
      if (data.status === "created") {
        if (data.payment_url) {
          // 👉 REDIRECT TO PAYSTACK
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
  if (loading) return <p style={{ padding: 20 }}>Loading store...</p>;

  if (!store) return <p style={{ padding: 20 }}>Store not found</p>;

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>{store.agent_name}'s Store</h1>

      <p style={styles.sub}>Buy data bundles instantly</p>

      {/* BUNDLES */}
      <div style={styles.grid}>
        {(store.prices || []).map((item, i) => (
          <div
            key={i}
            style={{
              ...styles.card,
              border:
                selected?.network === item.network &&
                selected?.bundle === item.bundle
                  ? "2px solid #38bdf8"
                  : "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={() => setSelected(item)}
          >
            <h3>{item.network}</h3>
            <p>{item.bundle}</p>
            <h2>GH₵ {Number(item.final_price).toFixed(2)}</h2>
          </div>
        ))}
      </div>

      {/* PHONE */}
      <input
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={styles.input}
      />

      {/* BUY */}
      <button
        onClick={placeOrder}
        disabled={processing}
        style={{
          ...styles.btn,
          opacity: processing ? 0.7 : 1,
        }}
      >
        {processing ? "Processing..." : "Buy Now"}
      </button>

      {/* TRACK */}
      <button style={styles.track} onClick={() => setPage("order-tracking")}>
        Track Order
      </button>
    </div>
  );
}
const styles = {
  wrap: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: 18,
    color: "#e5e7eb",
  },

  title: {
    fontSize: 28,
    fontWeight: 900,
  },

  sub: {
    color: "#94a3b8",
    marginBottom: 20,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "1fr",
    gap: 12,
  },

  card: {
    padding: 16,
    borderRadius: 14,
    cursor: "pointer",
    background: "#0f172a",
  },

  input: {
    width: "100%",
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
    border:
      "1px solid rgba(255,255,255,0.1)",
    background: "#020617",
    color: "white",
  },

  btn: {
    width: "100%",
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    border: "none",
    background:
      "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    fontWeight: 900,
    cursor: "pointer",
  },

  track: {
    marginTop: 12,
    width: "100%",
    padding: 12,
    borderRadius: 12,
    background: "#1e293b",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};
