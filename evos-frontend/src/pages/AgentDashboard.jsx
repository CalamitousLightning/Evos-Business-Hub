import { useEffect, useState } from "react";

const API_BASE = "https://api.evosdata.xyz";

export default function AgentDashboard({ user, setPage }) {
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    wallet_balance: 0,
    total_sales: 0,
    total_profit: 0,
    total_orders: 0,
    store_link: "",
    transactions: [],
  });

  // =========================
  // AUTH GUARD
  // =========================
  useEffect(() => {
    if (!user) {
      setPage("login");
      return;
    }

    const isAgent =
      user.role === "agent" &&
      user.agent_status === "approved";

    if (!isAgent) {
      setPage("dashboard");
    }
  }, [user, setPage]);

  // =========================
  // LOAD DASHBOARD
  // =========================
useEffect(() => {
  if (!user?.id) return;

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // =========================
      // 1. LOAD STATS
      // =========================
      const res = await fetch(
        `${API_BASE}/agent/dashboard/${user.id}`
      );

      if (!res.ok) throw new Error("Dashboard failed");

      const data = await res.json();

      // =========================
      // 2. LOAD TRANSACTIONS (FIX HERE)
      // =========================
      const txRes = await fetch(
        `${API_BASE}/agent/transactions/${user.id}`
      );

      const txData = await txRes.json();

      setStats({
        wallet_balance: Number(data.wallet_balance || 0),
        total_sales: Number(data.total_sales || 0),
        total_profit: Number(data.total_profit || 0),
        total_orders: Number(data.total_orders || 0),
        store_link:
          data.store_link ||
          `${window.location.origin}/store/${user.id}`,
        transactions: txData.transactions || [],
      });

    } catch (err) {
      console.log(err);
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, [user]);

  // =========================
  // COPY LINK
  // =========================
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        stats.store_link
      );
      alert("Copied!");
    } catch {
      alert("Copy failed");
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.clear();
    setPage("login");
  };

  const bg = dark ? "#020617" : "#f8fafc";
  const cardBg = dark ? "#0f172a" : "#ffffff";
  const text = dark ? "#e5e7eb" : "#111827";
  const soft = dark ? "#94a3b8" : "#64748b";

  return (
    <div
      style={{
        ...styles.container,
        background: bg,
        color: text,
      }}
    >
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.brand}>
          AGENT HUB
        </div>

        <div style={styles.headBtns}>
          <button
            style={styles.topBtn}
            onClick={() =>
              setDark(!dark)
            }
          >
            {dark ? "☀️" : "🌙"}
          </button>

          <button
            style={styles.topBtn}
            onClick={() =>
              setPage("dashboard")
            }
          >
            🏠
          </button>
        </div>
      </div>

      <div style={styles.main}>
        <h1 style={styles.title}>
          Welcome Agent
        </h1>

        <p style={{ color: soft }}>
          {user?.username}
        </p>

        {/* ERROR */}
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <p style={{ color: soft }}>
            Loading...
          </p>
        ) : (
          <>
            {/* STATS */}
            <div style={styles.grid2}>
              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
              >
                <p style={styles.label}>
                  Wallet
                </p>
                <h2>
                  GH₵{" "}
                  {stats.wallet_balance.toFixed(
                    2
                  )}
                </h2>
              </div>

              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
              >
                <p style={styles.label}>
                  Profit
                </p>
                <h2>
                  GH₵{" "}
                  {stats.total_profit.toFixed(
                    2
                  )}
                </h2>
              </div>

              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
              >
                <p style={styles.label}>
                  Orders
                </p>
                <h2>
                  {stats.total_orders}
                </h2>
              </div>

              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
              >
                <p style={styles.label}>
                  Sales
                </p>
                <h2>
                  {stats.total_sales}
                </h2>
              </div>
            </div>

            {/* STORE LINK */}
            <div
              style={{
                ...styles.card,
                background: cardBg,
                marginTop: 14,
              }}
            >
              <p style={styles.label}>
                Store Link
              </p>

              <div style={styles.linkText}>
                {stats.store_link}
              </div>

              <button
                style={styles.copyBtn}
                onClick={copyLink}
              >
                Copy
              </button>
            </div>

            {/* ACTIONS */}
            <div
              style={{
                ...styles.grid,
                marginTop: 14,
              }}
            >
              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
                onClick={() =>
                  setPage(
                    "agent-pricing"
                  )
                }
              >
                💰 Pricing
              </div>

              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
                onClick={() =>
                  setPage(
                    "agent-store"
                  )
                }
              >
                🏪 Store
              </div>

              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
                onClick={() =>
                  setPage(
                    "agent-withdraw"
                  )
                }
              >
                💳 Withdraw
              </div>

              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
                onClick={logout}
              >
                🚪 Logout
              </div>
            </div>

            {/* TRANSACTIONS */}
            <h3 style={styles.sectionTitle}>
              Recent Transactions
            </h3>

            {stats.transactions.length ===
            0 ? (
              <p style={{ color: soft }}>
                No transactions
              </p>
            ) : (
              stats.transactions
                .slice(0, 10)
                .map((tx, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.tx,
                      background:
                        cardBg,
                    }}
                  >
                    <div>
                      <strong>
                        {tx.type ===
                        "credit"
                          ? "Credit"
                          : "Debit"}
                      </strong>

                      <div
                        style={{
                          fontSize: 12,
                          color: soft,
                          marginTop: 4,
                        }}
                      >
                        Ref:{" "}
                        {tx.reference ||
                          "N/A"}
                      </div>
                    </div>

                    <div
                      style={{
                        fontWeight: 800,
                        color:
                          tx.type ===
                          "credit"
                            ? "#22c55e"
                            : "#ef4444",
                      }}
                    >
                      {tx.type ===
                      "credit"
                        ? "+"
                        : "-"}
                      GH₵{" "}
                      {Number(
                        tx.amount || 0
                      ).toFixed(2)}
                    </div>
                  </div>
                ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* =========================
STYLES
========================= */
const styles = {
  container: {
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    padding: 16,
    borderBottom:
      "1px solid rgba(255,255,255,0.05)",
  },

  brand: {
    color: "#38bdf8",
    fontSize: 22,
    fontWeight: 900,
  },

  headBtns: {
    display: "flex",
    gap: 10,
  },

  topBtn: {
    width: 42,
    height: 42,
    border: "none",
    borderRadius: 12,
    background:
      "rgba(56,189,248,0.12)",
    color: "#38bdf8",
    cursor: "pointer",
  },

  main: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 18,
  },

  title: {
    fontSize: 30,
    fontWeight: 900,
    marginBottom: 4,
  },

  label: {
    opacity: 0.7,
    marginBottom: 8,
    fontSize: 14,
  },

  error: {
    color: "#ef4444",
    marginBottom: 12,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
  },

  grid2: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: 14,
    marginTop: 16,
  },

  card: {
    padding: 18,
    borderRadius: 18,
    border:
      "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer",
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontWeight: 800,
  },

  copyBtn: {
    width: "100%",
    marginTop: 12,
    padding: 12,
    border: "none",
    borderRadius: 14,
    background:
      "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    color: "#00111f",
    fontWeight: 900,
    cursor: "pointer",
  },

  linkText: {
    wordBreak: "break-word",
    fontSize: 14,
    marginTop: 8,
  },

  tx: {
    padding: 14,
    borderRadius: 14,
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 10,
    border:
      "1px solid rgba(255,255,255,0.06)",
  },
};
