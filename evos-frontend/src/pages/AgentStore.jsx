import { useEffect, useState } from "react";

const API = "https://api.evosdata.xyz";

export default function AgentStore({ setPage }) {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    network: "",
    bundle: "",
  });

  // =========================
  // GET AGENT STORE DATA
  // =========================
  useEffect(() => {
    const path = window.location.pathname;
    const agentId = path.split("/store/")[1];

    if (!agentId) {
      setLoading(false);
      return;
    }

    const loadStore = async () => {
      try {
        const res = await fetch(`${API}/store/${agentId}`);
        const data = await res.json();

        setStore(data);
      } catch (err) {
        console.log("Store error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, []);

  // =========================
  // PLACE ORDER
  // =========================
  const placeOrder = async () => {
    if (!form.phone || !form.network || !form.bundle) {
      alert("Fill all fields");
      return;
    }

    setOrderLoading(true);

    try {
      const res = await fetch(`${API}/store/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: store.agent_id,
          phone: form.phone,
          network: form.network,
          bundle: form.bundle,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Order placed successfully");
        setForm({ phone: "", network: "", bundle: "" });
      } else {
        alert(data.message || "Order failed");
      }
    } catch (err) {
      console.log(err);
      alert("Network error");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading store...</p>;
  }

  if (!store) {
    return <p style={{ padding: 20 }}>Store not found</p>;
  }

  return (
    <div style={styles.wrap}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          {store.store_name || "Agent Store"}
        </h1>

        <p style={styles.sub}>
          Fast Data Purchase • Powered by EVOS HUB
        </p>
      </div>

      {/* PRODUCTS */}
      <div style={styles.sectionTitle}>Available Bundles</div>

      <div style={styles.grid}>
        {store.prices?.map((item, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.row}>
              <strong>{item.network}</strong>
              <span>GH₵ {item.final_price}</span>
            </div>

            <p style={styles.small}>{item.bundle}</p>

            <button
              style={styles.selectBtn}
              onClick={() =>
                setForm({
                  ...form,
                  network: item.network,
                  bundle: item.bundle,
                })
              }
            >
              Select
            </button>
          </div>
        ))}
      </div>

      {/* ORDER FORM */}
      <div style={styles.sectionTitle}>Place Order</div>

      <div style={styles.form}>
        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
          style={styles.input}
        />

        <input
          placeholder="Network (auto-filled)"
          value={form.network}
          readOnly
          style={styles.input}
        />

        <input
          placeholder="Bundle (auto-filled)"
          value={form.bundle}
          readOnly
          style={styles.input}
        />

        <button
          onClick={placeOrder}
          disabled={orderLoading}
          style={{
            ...styles.buyBtn,
            opacity: orderLoading ? 0.7 : 1,
          }}
        >
          {orderLoading ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

/* =======================
   STYLES
======================= */

const styles = {
  wrap: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "18px",
    fontFamily:
      "ui-sans-serif, system-ui, Arial",
  },

  header: {
    textAlign: "center",
    marginBottom: "20px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "900",
  },

  sub: {
    color: "#64748b",
    fontSize: "14px",
  },

  sectionTitle: {
    marginTop: "20px",
    marginBottom: "10px",
    fontWeight: "800",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "1fr",
    gap: "12px",
  },

  card: {
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "#fff",
  },

  row: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  small: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "6px",
  },

  selectBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "10px",
    background: "#38bdf8",
    color: "#00111f",
    fontWeight: "700",
    cursor: "pointer",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
  },

  buyBtn: {
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    fontWeight: "900",
    cursor: "pointer",
  },
};
