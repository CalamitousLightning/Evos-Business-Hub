import { useEffect, useState } from "react";

const API_BASE = "https://evos-business-hub.onrender.com";

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
  // LOAD DATA
  // =========================
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_BASE}/agent/dashboard/${user.id}`
        );

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        setStats({
          wallet_balance: data.wallet_balance ?? 0,
          total_sales: data.total_sales ?? 0,
          total_profit: data.total_profit ?? 0,
          total_orders: data.total_orders ?? 0,
          store_link:
            data.store_link ||
            `${window.location.origin}/store/${user.id}`,
          transactions: data.transactions ?? [],
        });
      } catch (err) {
        console.log("Agent dashboard error:", err);
        setError("Failed to load dashboard. Check backend URL.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(stats.store_link);
      alert("Copied!");
    } catch {
      alert("Copy failed");
    }
  };

  const logout = () => {
    localStorage.clear();
    setPage("login");
  };

  const bg = dark ? "#020617" : "#f8fafc";
  const cardBg = dark ? "#0f172a" : "#ffffff";
  const text = dark ? "#e5e7eb" : "#111827";
  const soft = dark ? "#94a3b8" : "#64748b";

  return (
    <div style={{ ...styles.container, background: bg, color: text }}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.brand}>AGENT HUB</div>

        <div style={styles.headBtns}>
          <button style={styles.topBtn} onClick={() => setDark(!dark)}>
            {dark ? "☀️" : "🌙"}
          </button>

          <button style={styles.topBtn} onClick={() => setPage("dashboard")}>
            🏠
          </button>
        </div>
      </div>

      <div style={styles.main}>
        <h1 style={styles.title}>Welcome Agent</h1>
        <p style={{ color: soft }}>{user?.username}</p>

        {/* ERROR */}
        {error && (
          <div style={{ color: "red", marginBottom: 10 }}>
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <p style={{ color: soft }}>Loading...</p>
        ) : (
          <>
            {/* STATS */}
            <div style={styles.grid2}>
              <div style={{ ...styles.card, background: cardBg }}>
                Wallet
                <h2>GH₵ {stats.wallet_balance.toFixed(2)}</h2>
              </div>

              <div style={{ ...styles.card, background: cardBg }}>
                Profit
                <h2>GH₵ {stats.total_profit.toFixed(2)}</h2>
              </div>

              <div style={{ ...styles.card, background: cardBg }}>
                Orders
                <h2>{stats.total_orders}</h2>
              </div>

              <div style={{ ...styles.card, background: cardBg }}>
                Sales
                <h2>{stats.total_sales}</h2>
              </div>
            </div>

            {/* STORE LINK */}
            <div style={{ ...styles.card, background: cardBg }}>
              <p>Store Link</p>
              <div style={styles.linkText}>{stats.store_link}</div>
              <button style={styles.copyBtn} onClick={copyLink}>
                Copy
              </button>
            </div>

            {/* ACTIONS */}
            <div style={styles.grid}>
              <div
                style={{ ...styles.card, background: cardBg }}
                onClick={() => setPage("agent-pricing")}
              >
                💰 Pricing
              </div>

              <div
                style={{ ...styles.card, background: cardBg }}
                onClick={() => setPage("agent-store")}
              >
                🏪 Store
              </div>

              <div
                style={{ ...styles.card, background: cardBg }}
                onClick={() => setPage("agent-withdraw")}
              >
                💳 Withdraw
              </div>

              <div
                style={{ ...styles.card, background: cardBg }}
                onClick={logout}
              >
                🚪 Logout
              </div>
            </div>

            {/* TRANSACTIONS */}
            <h3>Recent</h3>

            {stats.transactions.length === 0 ? (
              <p style={{ color: soft }}>No transactions</p>
            ) : (
              stats.transactions.slice(0, 5).map((t, i) => (
                <div key={i} style={{ ...styles.tx, background: cardBg }}>
                  <span>{t.type}</span>
                  <span>GH₵ {Number(t.amount).toFixed(2)}</span>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* STYLES */
const styles = {
  container: { minHeight: "100vh" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 16,
    borderBottom: "1px solid rgba(255,255,255,0.05)"
  },
  
  brand: {
    color: "#38bdf8",
    fontSize: "22px",
    fontWeight: "900",
  },

  headBtns: {
    display: "flex",
    gap: "10px",
  },

  topBtn: {
    width: "42px",
    height: "42px",
    border: "none",
    borderRadius: "12px",
    background:
      "rgba(56,189,248,0.12)",
    color: "#38bdf8",
    cursor: "pointer",
  },

  main: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "18px",
  },

  hero: {
    marginBottom: "18px",
  },

  title: {
    fontSize: "30px",
    fontWeight: "900",
    marginBottom: "4px",
  },

  status: {
    marginTop: "10px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    color: "#22c55e",
    fontSize: "14px",
  },

  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "1fr",
    gap: "14px",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "14px",
  },

  card: {
    padding: "18px",
    borderRadius: "18px",
    border:
      "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer",
  },

  small: {
    fontSize: "13px",
    color: "#94a3b8",
  },

  bigNumber: {
    fontSize: "34px",
    fontWeight: "900",
    color: "#38bdf8",
    marginTop: "8px",
  },

  bigMoney: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#22c55e",
    marginTop: "8px",
  },

  sectionTitle: {
    marginTop: "16px",
    marginBottom: "12px",
    fontWeight: "800",
    fontSize: "14px",
  },

  copyBtn: {
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    color: "#00111f",
    fontWeight: "900",
    cursor: "pointer",
  },

  linkText: {
    marginTop: "10px",
    wordBreak: "break-word",
    fontSize: "14px",
  },

  tx: {
    padding: "14px",
    borderRadius: "14px",
    display: "flex",
    justifyContent:
      "space-between",
    marginBottom: "10px",
    border:
      "1px solid rgba(255,255,255,0.06)",
  },
};
