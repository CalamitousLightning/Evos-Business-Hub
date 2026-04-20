import { useEffect, useState } from "react";

export default function StorePage({ setPage }) {
  const agentId = window.location.pathname.split("/").pop();

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [selected, setSelected] = useState(null);
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);

  // LOAD STORE
  useEffect(() => {
    const loadStore = async () => {
      try {
        const res = await fetch(
          `https://evos-business-hub.onrender.com/store/${agentId}`
        );
        const data = await res.json();
        setStore(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [agentId]);

  // PLACE ORDER
  const placeOrder = async () => {
    if (!selected || !phone) {
      alert("Select bundle + enter phone");
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch(
        "https://evos-business-hub.onrender.com/store/order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: agentId,
            bundle_id: selected.id,
            phone,
          }),
        }
      );

      const data = await res.json();

      if (data?.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert("Failed to initiate payment");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading store...</p>;

  if (!store)
    return <p style={{ padding: 20 }}>Store not found</p>;

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>{store.agent_name}'s Store</h1>

      <p style={styles.sub}>Buy data bundles instantly</p>

      {/* BUNDLES */}
      <div style={styles.grid}>
        {store.prices.map((item, i) => (
          <div
            key={i}
            style={{
              ...styles.card,
              border:
                selected?.id === item.id
                  ? "2px solid #38bdf8"
                  : "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={() => setSelected(item)}
          >
            <h3>{item.network}</h3>
            <p>{item.bundle}</p>

            <h2>GH₵ {item.final_price}</h2>
          </div>
        ))}
      </div>

      {/* PHONE INPUT */}
      <input
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={styles.input}
      />

      {/* BUTTON */}
      <button
        onClick={placeOrder}
        disabled={processing}
        style={styles.btn}
      >
        {processing ? "Processing..." : "Buy Now"}
      </button>

      {/* TRACK ORDER */}
      <button
        style={styles.track}
        onClick={() => setPage("track")}
      >
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
    gridTemplateColumns: "1fr",
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
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#020617",
    color: "white",
  },

  btn: {
    width: "100%",
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
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
