import { useEffect, useState } from "react";

const API_BASE = "https://api.evosdata.xyz";

export default function AgentWithdraw({ user, setPage }) {
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [message, setMessage] = useState("");

  // =========================
  // LOAD WALLET
  // =========================
  useEffect(() => {
    if (!user?.id) return;

    const loadWallet = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/agent/dashboard/${user.id}`
        );

        const data = await res.json();

        setWallet(Number(data.wallet_balance || 0));
      } catch (err) {
        console.log("Wallet load error:", err);
      }
    };

    loadWallet();
  }, [user]);

  // =========================
  // WITHDRAW
  // =========================
  const withdraw = async () => {
    setMessage("");

    const amt = Number(amount);

    if (!amt || amt <= 0) {
      return setMessage("Enter valid amount");
    }

    if (amt < 5) {
      return setMessage("Minimum withdrawal is GH₵5");
    }

    if (amt > wallet) {
      return setMessage("Insufficient balance");
    }

    if (!accountName || !accountNumber || !bankName) {
      return setMessage("Fill all bank details");
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/agent/withdraw`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: user.id,
            amount: amt,
            account_name: accountName,
            account_number: accountNumber,
            bank_name: bankName,
          }),
        }
      );

      const data = await res.json();

      if (data.status === "request submitted") {
        setMessage("Withdrawal request submitted ✔");

        // refresh wallet display locally
        setWallet((prev) => prev - amt);

        setAmount("");
        setAccountName("");
        setAccountNumber("");
        setBankName("");
      } else {
        setMessage(data.error || "Withdrawal failed");
      }
    } catch (err) {
      console.log(err);
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>💳 Withdraw Funds</h2>

      <div style={styles.card}>
        <p>Wallet Balance</p>
        <h1>GH₵ {wallet.toFixed(2)}</h1>
      </div>

      {message && (
        <p style={{ color: message.includes("✔") ? "green" : "red" }}>
          {message}
        </p>
      )}

      <input
        placeholder="Amount (GH₵)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
        type="number"
      />

      <input
        placeholder="Account Name"
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
        style={styles.input}
      />

      <input
        placeholder="Account Number"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        style={styles.input}
      />

      <input
        placeholder="Bank Name"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        style={styles.input}
      />

      <button
        onClick={withdraw}
        disabled={loading}
        style={styles.button}
      >
        {loading ? "Processing..." : "Request Withdrawal"}
      </button>

      <button
        onClick={() => setPage("agent-dashboard")}
        style={styles.back}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  container: {
    maxWidth: 500,
    margin: "0 auto",
    padding: 20,
    color: "#e5e7eb",
  },

  card: {
    background: "#0f172a",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#020617",
    color: "white",
  },

  button: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 10,
  },

  back: {
    width: "100%",
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    background: "#1e293b",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};
