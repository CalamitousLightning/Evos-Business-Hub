import { useEffect, useState } from "react";

const API_BASE = "https://evos-business-hub.onrender.com";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  // =========================
  // LOAD WITHDRAWALS
  // =========================
  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE}/admin/withdrawals`
      );

      const data = await res.json();

      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      console.log(err);
      setError("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  // =========================
  // MARK AS PAID
  // =========================
  const markPaid = async (id) => {
    setProcessingId(id);

    try {
      const res = await fetch(
        `${API_BASE}/admin/withdrawals/${id}/paid`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data.status === "paid") {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w.id === id ? { ...w, status: "paid" } : w
          )
        );
      }
    } catch (err) {
      console.log(err);
    } finally {
      setProcessingId(null);
    }
  };

  // =========================
  // REJECT
  // =========================
  const reject = async (id) => {
    setProcessingId(id);

    try {
      const res = await fetch(
        `${API_BASE}/admin/withdrawals/${id}/reject`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data.status === "rejected") {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w.id === id ? { ...w, status: "rejected" } : w
          )
        );
      }
    } catch (err) {
      console.log(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🏦 Admin Withdrawals Panel</h1>

      <button onClick={loadWithdrawals} style={styles.refresh}>
        🔄 Refresh
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading withdrawals...</p>
      ) : withdrawals.length === 0 ? (
        <p>No withdrawal requests</p>
      ) : (
        withdrawals.map((w) => (
          <div key={w.id} style={styles.card}>
            <div>
              <strong>Agent:</strong> {w.agent_id}
            </div>

            <div>
              <strong>Amount:</strong> GH₵ {Number(w.amount).toFixed(2)}
            </div>

            <div>
              <strong>Bank:</strong> {w.bank_name}
            </div>

            <div>
              <strong>Account:</strong> {w.account_number}
            </div>

            <div>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    w.status === "paid"
                      ? "green"
                      : w.status === "rejected"
                      ? "red"
                      : "orange",
                  fontWeight: "bold",
                }}
              >
                {w.status || "pending"}
              </span>
            </div>

            {/* ACTIONS */}
            {w.status === "pending" && (
              <div style={styles.actions}>
                <button
                  onClick={() => markPaid(w.id)}
                  disabled={processingId === w.id}
                  style={styles.approve}
                >
                  ✔ Mark Paid
                </button>

                <button
                  onClick={() => reject(w.id)}
                  disabled={processingId === w.id}
                  style={styles.reject}
                >
                  ✖ Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  container: {
    padding: 20,
    maxWidth: 900,
    margin: "0 auto",
    color: "#e5e7eb",
  },

  refresh: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#38bdf8",
    cursor: "pointer",
    fontWeight: "bold",
  },

  card: {
    background: "#0f172a",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    border: "1px solid #1e293b",
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },

  approve: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#22c55e",
    fontWeight: "bold",
    cursor: "pointer",
  },

  reject: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#ef4444",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
