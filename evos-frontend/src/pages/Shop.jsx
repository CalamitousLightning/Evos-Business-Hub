import { useEffect, useState } from "react";
import API from "../api";

export default function Shop() {
  const [step, setStep] = useState(1);

  const [network, setNetwork] = useState("");
  const [bundle, setBundle] = useState("");
  const [phone, setPhone] = useState("");
  const [prices, setPrices] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = localStorage.getItem("email");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const user_id = user?.id;

  // ======================
  // LOAD PRICES
  // ======================
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const res = await API.get("/prices");

        // SAFE ARRAY HANDLING
        if (Array.isArray(res.data)) {
          setPrices(res.data);
        } else if (Array.isArray(res.data?.prices)) {
          setPrices(res.data.prices);
        } else {
          setPrices([]);
        }

      } catch (err) {
        console.log("Failed to load prices");
        setPrices([]);
      }
    };

    loadPrices();
  }, []);

  // SAFE FILTER
  const bundles = Array.isArray(prices)
    ? prices.filter((p) => p.network === network)
    : [];

  // ======================
  // BUY ORDER
  // ======================
  const handleBuy = async () => {
    try {
      setError("");

      if (!phone) {
        setError("Enter phone number");
        return;
      }

      if (!email) {
        setError("Please login first");
        return;
      }

      if (!user_id) {
        setError("User session missing. Login again.");
        return;
      }

      setLoading(true);

      const res = await API.post("/orders/create", {
        user_id,
        network,
        bundle,
        phone,
      });

      setTimeout(() => {
        window.location.href = res.data.payment_url;
      }, 600);

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.detail || "Order failed");
    }
  };

  const isSelected = (b) => b.bundle === bundle;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Buy Data</h2>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.wrapper}>

        {/* STEP 1 */}
        {step === 1 && (
          <div style={styles.box}>
            <h3 style={styles.step}>Select Network</h3>

            {[
              { name: "MTN", icon: "🟡" },
              { name: "TELECEL", icon: "🔴" },
              { name: "AIRTELTIGO", icon: "🔵" },
            ].map((n) => (
              <div
                key={n.name}
                style={styles.option}
                onClick={() => {
                  setNetwork(n.name);
                  setStep(2);
                }}
              >
                <span>{n.icon}</span> {n.name}
              </div>
            ))}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={styles.box}>
            <button style={styles.back} onClick={() => setStep(1)}>
              ← Back
            </button>

            <h3 style={styles.step}>Select Bundle</h3>

            {bundles.length === 0 && (
              <p style={{ color: "#888" }}>No bundles found</p>
            )}

            {bundles.map((b, i) => (
              <div
                key={i}
                onClick={() => {
                  setBundle(b.bundle);
                  setStep(3);
                }}
                style={{
                  ...styles.card,
                  border: isSelected(b)
                    ? "2px solid #38bdf8"
                    : "1px solid transparent",
                }}
              >
                <h4>{b.bundle}</h4>
                <p>GH₵ {b.price}</p>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={styles.box}>
            <button style={styles.back} onClick={() => setStep(2)}>
              ← Back
            </button>

            <h3 style={styles.step}>Complete Order</h3>

            <div style={styles.summary}>
              <p>{network}</p>
              <h3>{bundle}</h3>
            </div>

            <input
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
            />

            <input
              value={email || ""}
              disabled
              style={styles.input}
            />

            <button
              onClick={handleBuy}
              disabled={loading}
              style={{
                ...styles.buyBtn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Processing..." : "Pay with Paystack"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== */
const styles = {
  container: {
    padding: "20px",
    color: "#e5e7eb",
    textAlign: "center",
  },

  title: {
    marginBottom: "20px",
  },

  wrapper: {
    maxWidth: "420px",
    margin: "auto",
  },

  box: {
    background: "#0f172a",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
  },

  step: {
    marginBottom: "15px",
    color: "#38bdf8",
  },

  option: {
    padding: "15px",
    marginBottom: "12px",
    borderRadius: "12px",
    background: "#111827",
    cursor: "pointer",
  },

  card: {
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "10px",
    background: "#111827",
    cursor: "pointer",
  },

  summary: {
    background: "#111827",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "15px",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#020617",
    color: "white",
  },

  buyBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #10b981, #22c55e)",
    border: "none",
    color: "white",
    fontWeight: "bold",
  },

  back: {
    marginBottom: "10px",
    background: "transparent",
    border: "none",
    color: "#38bdf8",
    cursor: "pointer",
  },

  error: {
    background: "#7f1d1d",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "10px",
  },
};
