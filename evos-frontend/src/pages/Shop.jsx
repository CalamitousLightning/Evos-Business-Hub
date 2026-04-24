// ======================
// REPLACE ONLY LOGIC + RETURN SECTION
// Keep your styles below unchanged
// ======================

import { useEffect, useState } from "react";
import API from "../api";

export default function Shop() {
  const [step, setStep] = useState(1);

  const [network, setNetwork] = useState("");
  const [bundle, setBundle] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPhone, setConfirmPhone] = useState("");
  const [email, setEmail] = useState(
    localStorage.getItem("email") || ""
  );

  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const user_id = user?.id || null;

  // ======================
  // LOAD PRICES
  // ======================
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const res = await API.get("/prices");
        const data = res.data?.data;
        setPrices(Array.isArray(data) ? data : []);
      } catch {
        setPrices([]);
      }
    };

    loadPrices();
  }, []);

  // ======================
  // OUT OF STOCK
  // ======================
  const OUT_OF_STOCK = [
    "TELECEL",
    "AIRTELTIGO",
  ];

  const isOutOfStock = (name) =>
    OUT_OF_STOCK.includes(name);

  const bundles = prices.filter(
    (p) => p.network === network
  );

  // ======================
  // VALIDATE PHONE
  // ======================
  const validPhone = (num) =>
    /^0\d{9}$/.test(num);

  // ======================
  // BUY ORDER
  // ======================
  const handleBuy = async () => {
    try {
      setError("");

      if (!network || !bundle) {
        setError(
          "Select network and bundle"
        );
        return;
      }

      if (!phone) {
        setError(
          "Enter phone number"
        );
        return;
      }

      if (!validPhone(phone)) {
        setError(
          "Phone must be 10 digits and start with 0"
        );
        return;
      }

      if (phone !== confirmPhone) {
        setError(
          "Phone numbers do not match"
        );
        return;
      }

      if (!agree) {
        setError(
          "You must confirm refund policy"
        );
        return;
      }

      setLoading(true);

      const res = await API.post(
        "/orders/create",
        {
          user_id,
          network,
          bundle,
          phone,
          email:
            email ||
            "guest@evoshub.com",
        }
      );

      const paymentUrl =
        res.data?.payment_url ||
        res.data
          ?.authorization_url ||
        res.data?.data
          ?.authorization_url;

      if (!paymentUrl) {
        setLoading(false);
        setError(
          "Payment link not received"
        );
        return;
      }

      localStorage.setItem(
        "email",
        email
      );

      window.location.href =
        paymentUrl;
    } catch (err) {
      setLoading(false);

      setError(
        err.response?.data
          ?.detail ||
          err.response?.data
            ?.message ||
          "Order failed"
      );
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        Buy Data
      </h2>

      <p style={styles.subTitle}>
        Fast automated delivery
      </p>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <div style={styles.wrapper}>
        {/* STEP 1 */}
        {step === 1 && (
          <div style={styles.box}>
            <h3 style={styles.step}>
              Select Network
            </h3>

            {[
              {
                name: "MTN",
                icon: "🟡",
                style:
                  styles.optionMTN,
              },
              {
                name: "TELECEL",
                icon: "🔴",
                style:
                  styles.optionTELECEL,
              },
              {
                name:
                  "AIRTELTIGO",
                icon: "🔵",
                style:
                  styles.optionAIRTEL,
              },
            ].map((n) => {
              const disabled =
                isOutOfStock(
                  n.name
                );

              return (
                <div
                  key={n.name}
                  style={{
                    ...styles.option,
                    ...n.style,
                    opacity:
                      disabled
                        ? 0.45
                        : 1,
                    cursor:
                      disabled
                        ? "not-allowed"
                        : "pointer",
                  }}
                  onClick={() => {
                    if (
                      disabled
                    )
                      return;

                    setNetwork(
                      n.name
                    );
                    setStep(2);
                  }}
                >
                  <span>
                    {n.icon}
                  </span>

                  {n.name}

                  {disabled && (
                    <span
                      style={
                        styles.stock
                      }
                    >
                      Out of Stock
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={styles.box}>
            <button
              style={styles.back}
              onClick={() =>
                setStep(1)
              }
            >
              ← Back
            </button>

            <h3 style={styles.step}>
              Select Bundle
            </h3>

            {bundles.map(
              (b, i) => (
                <div
                  key={i}
                  style={
                    styles.card
                  }
                  onClick={() => {
                    setBundle(
                      b.bundle
                    );
                    setStep(3);
                  }}
                >
                  <h4>
                    {b.bundle}
                  </h4>

                  <p>
                    GH₵{" "}
                    {b.price}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={styles.box}>
            <button
              style={styles.back}
              onClick={() =>
                setStep(2)
              }
            >
              ← Back
            </button>

            <h3 style={styles.step}>
              Complete Order
            </h3>

            <div
              style={
                styles.summary
              }
            >
              <p>{network}</p>
              <h3>{bundle}</h3>
            </div>

            <input
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
            />

            <input
              style={styles.input}
              placeholder="Confirm Phone Number"
              value={
                confirmPhone
              }
              onChange={(e) =>
                setConfirmPhone(
                  e.target.value
                )
              }
            />

            <input
              style={styles.input}
              placeholder="Email (receipt)"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

            <div
              style={
                styles.notice
              }
            >
              <label
                style={
                  styles.checkWrap
                }
              >
                <input
                  type="checkbox"
                  checked={
                    agree
                  }
                  onChange={() =>
                    setAgree(
                      !agree
                    )
                  }
                />

                <span>
                  I confirm
                  number is
                  correct.
                  Wrong
                  numbers
                  are not
                  refundable.
                </span>
              </label>
            </div>

            <button
              onClick={
                handleBuy
              }
              disabled={
                loading
              }
              style={{
                ...styles.buyBtn,
                opacity:
                  loading
                    ? 0.6
                    : 1,
              }}
            >
              {loading
                ? "Processing..."
                : "Pay with Paystack"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


/* ======================
   SHOP UI (FIXED + CLEAN)
====================== */
const styles = {
  container: {
    padding: "24px",
    color: "#e5e7eb",
    textAlign: "center",
    minHeight: "100vh",
  },

  title: {
    marginBottom: "6px",
    fontSize: "26px",
    fontWeight: "800",
  },

  subTitle: {
    color: "#94a3b8",
    marginBottom: "22px",
    fontSize: "14px",
  },

  wrapper: {
    maxWidth: "440px",
    margin: "0 auto",
  },

  box: {
    background: "rgba(15, 23, 42, 0.88)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  step: {
    marginBottom: "16px",
    color: "#38bdf8",
    fontWeight: "700",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  /* ======================
     NETWORK OPTIONS
  ====================== */
  option: {
    padding: "16px",
    marginBottom: "12px",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "700",
    transition: "0.2s ease",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.03)",
  },

  optionMTN: {
    background:
      "linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,193,7,0.05))",
    border: "1px solid rgba(255,193,7,0.3)",
  },

  optionTELECEL: {
    background:
      "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
    border: "1px solid rgba(239,68,68,0.3)",
  },

  optionAIRTEL: {
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))",
    border: "1px solid rgba(59,130,246,0.3)",
  },

  stock: {
    marginLeft: "auto",
    color: "#ef4444",
    fontSize: "12px",
    fontWeight: "800",
  },

  /* ======================
     BUNDLE CARDS
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

  summary: {
    background: "rgba(2, 6, 23, 0.65)",
    padding: "14px",
    borderRadius: "12px",
    marginBottom: "15px",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(2, 6, 23, 0.75)",
    color: "#ffffff",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  notice: {
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.25)",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "14px",
    textAlign: "left",
  },

  checkWrap: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  buyBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #10b981, #22c55e)",
    border: "none",
    color: "#ffffff",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "15px",
  },

  back: {
    marginBottom: "12px",
    background: "transparent",
    border: "none",
    color: "#38bdf8",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },

  error: {
    background: "rgba(127, 29, 29, 0.8)",
    color: "#ffffff",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    maxWidth: "440px",
    marginInline: "auto",
  },
};
