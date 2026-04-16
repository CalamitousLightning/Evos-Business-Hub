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

        // ✅ YOUR BACKEND RETURNS {status, data}
        const data = res.data?.data;

        if (Array.isArray(data)) {
          setPrices(data);
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

      if (!network || !bundle) {
        setError("Select network and bundle");
        return;
      }

      if (!phone) {
        setError("Enter phone number");
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

      if (!res.data?.payment_url) {
        setError("Payment link not received");
        setLoading(false);
        return;
      }

      setTimeout(() => {
        window.location.href = res.data.payment_url;
      }, 500);

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
              { name: "MTN", icon: "🟡", style: styles.optionMTN },
              { name: "TELECEL", icon: "🔴", style: styles.optionTELECEL },
              { name: "AIRTELTIGO", icon: "🔵", style: styles.optionAIRTEL },
            ].map((n) => (
            <div
              key={n.name}
              style={{ ...styles.option, ...n.style }}
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
                   ...(isSelected(b) ? styles.selectedCard : {}),
                }}
              >
                <h4 style={{ color: "#e5e7eb" }}>{b.bundle}</h4>
                <p style={{ color: "#94a3b8" }}>GH₵ {b.price}</p>
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

/* ======================
   SHOP UI (UPGRADED SaaS STYLE)
====================== */
const styles = {
  container: {
    padding: "24px",
    color: "#e5e7eb",
    textAlign: "center",
    minHeight: "100vh",
  },

  title: {
    marginBottom: "22px",
    fontSize: "22px",
    fontWeight: "700",
  },

  wrapper: {
    maxWidth: "440px",
    margin: "auto",
  },

  box: {
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  step: {
    marginBottom: "15px",
    color: "#38bdf8",
    fontWeight: "600",
    fontSize: "14px",
  },

  /* ======================
     NETWORK OPTIONS (UPGRADED)
  ====================== */
  option: {
    padding: "16px",
    marginBottom: "12px",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "600",
    transition: "0.2s ease",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.03)",
  },

  optionMTN: {
    background: "linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,193,7,0.05))",
    border: "1px solid rgba(255,193,7,0.3)",
  },

  optionTELECEL: {
    background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
    border: "1px solid rgba(239,68,68,0.3)",
  },

  optionAIRTEL: {
    background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(239,68,68,0.08))",
    border: "1px solid rgba(59,130,246,0.3)",
  },

  /* ======================
     BUNDLES (FIXED READABILITY + HOVER)
  ====================== */
  card: {
    padding: "16px",
    borderRadius: "14px",
    marginBottom: "10px",
    cursor: "pointer",
    transition: "0.2s ease",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  cardHover: {
    transform: "translateY(-2px)",
    background: "rgba(255,255,255,0.06)",
  },

  selectedCard: {
    border: "2px solid #38bdf8",
    background: "rgba(56, 189, 248, 0.08)",
    boxShadow: "0 10px 25px rgba(56, 189, 248, 0.15)",
  },

  summary: {
    background: "rgba(2, 6, 23, 0.6)",
    padding: "14px",
    borderRadius: "12px",
    marginBottom: "15px",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  input: {
    width: "100%",
    padding: "13px",
    marginBottom: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(2, 6, 23, 0.7)",
    color: "white",
  },

  buyBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #10b981, #22c55e)",
    border: "none",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  },

  back: {
    marginBottom: "12px",
    background: "transparent",
    border: "none",
    color: "#38bdf8",
    cursor: "pointer",
    fontWeight: "600",
  },

  error: {
    background: "rgba(127, 29, 29, 0.8)",
    color: "white",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
};
