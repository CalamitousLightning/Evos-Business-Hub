import { useEffect, useState } from "react";

export default function AgentDashboard({
  user,
  setPage,
}) {
  const [loading, setLoading] =
    useState(true);

  const [dark, setDark] = useState(true);

  const [stats, setStats] = useState({
    wallet_balance: 0,
    total_sales: 0,
    total_profit: 0,
    total_orders: 0,
    store_link: "",
    transactions: [],
  });

  // =========================
  // AUTH / ACCESS GUARD
  // =========================
  useEffect(() => {
    if (!user) {
      setPage("login");
      return;
    }

    const isAgentActive =
      user.role === "agent" &&
      user.agent_status === "approved";

    if (!isAgentActive) {
      setPage("dashboard");
    }
  }, [user, setPage]);

  // =========================
  // LOAD AGENT DATA
  // =========================
  useEffect(() => {
    if (!user?.id) return;

    const loadAgent = async () => {
      try {
        const res = await fetch(
          `https://YOUR-BACKEND-URL/agent/dashboard/${user.id}`
        );

        const data = await res.json();

        setStats({
          wallet_balance:
            data.wallet_balance || 0,
          total_sales:
            data.total_sales || 0,
          total_profit:
            data.total_profit || 0,
          total_orders:
            data.total_orders || 0,
          store_link:
            data.store_link ||
            `${window.location.origin}/store/${user.id}`,
          transactions:
            data.transactions || [],
        });
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadAgent();
  }, [user]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(
      stats.store_link
    );

    alert("Store link copied");
  };

  const logout = () => {
    localStorage.removeItem("user");
    setPage("login");
  };

  const bg = dark
    ? "#020617"
    : "#f8fafc";

  const cardBg = dark
    ? "#0f172a"
    : "#ffffff";

  const text = dark
    ? "#e5e7eb"
    : "#111827";

  const soft = dark
    ? "#94a3b8"
    : "#64748b";

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

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.hero}>
          <h1 style={styles.title}>
            Welcome Agent
          </h1>

          <p style={{ color: soft }}>
            {user?.username ||
              user?.email}
          </p>

          <div style={styles.status}>
            <span style={styles.dot} />
            Approved Agent Account
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <p style={{ color: soft }}>
            Loading dashboard...
          </p>
        ) : (
          <>
            {/* TOP STATS */}
            <div style={styles.grid2}>
              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
              >
                <div style={styles.small}>
                  Wallet Balance
                </div>

                <div
                  style={
                    styles.bigMoney
                  }
                >
                  GH₵{" "}
                  {Number(
                    stats.wallet_balance
                  ).toFixed(2)}
                </div>
              </div>

              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
              >
                <div style={styles.small}>
                  Total Profit
                </div>

                <div
                  style={
                    styles.bigMoney
                  }
                >
                  GH₵{" "}
                  {Number(
                    stats.total_profit
                  ).toFixed(2)}
                </div>
              </div>

              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
              >
                <div style={styles.small}>
                  Total Orders
                </div>

                <div
                  style={
                    styles.bigNumber
                  }
                >
                  {
                    stats.total_orders
                  }
                </div>
              </div>

              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
              >
                <div style={styles.small}>
                  Total Sales
                </div>

                <div
                  style={
                    styles.bigNumber
                  }
                >
                  {
                    stats.total_sales
                  }
                </div>
              </div>
            </div>

            {/* STORE LINK */}
            <div
              style={{
                ...styles.card,
                background: cardBg,
                marginTop: "14px",
              }}
            >
              <div style={styles.small}>
                My Store Link
              </div>

              <div
                style={
                  styles.linkText
                }
              >
                {stats.store_link}
              </div>

              <button
                style={
                  styles.copyBtn
                }
                onClick={copyLink}
              >
                Copy Link
              </button>
            </div>

            {/* QUICK ACTIONS */}
            <div
              style={
                styles.sectionTitle
              }
            >
              Quick Actions
            </div>

            <div style={styles.grid}>
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
                <h3>
                  💰 Pricing
                </h3>
                <p
                  style={{
                    color: soft,
                  }}
                >
                  Set your markup
                </p>
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
                <h3>
                  💳 Withdraw
                </h3>
                <p
                  style={{
                    color: soft,
                  }}
                >
                  Request payout
                </p>
              </div>

              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
                onClick={() =>
                  setPage(
                    "agent-transactions"
                  )
                }
              >
                <h3>
                  📜 Transactions
                </h3>
                <p
                  style={{
                    color: soft,
                  }}
                >
                  Wallet history
                </p>
              </div>

              <div
                style={{
                  ...styles.card,
                  background: cardBg,
                }}
                onClick={logout}
              >
                <h3>
                  🚪 Logout
                </h3>
                <p
                  style={{
                    color: soft,
                  }}
                >
                  Secure sign out
                </p>
              </div>
            </div>

            {/* RECENT TX */}
            <div
              style={
                styles.sectionTitle
              }
            >
              Recent Transactions
            </div>

            {stats.transactions
              .length === 0 ? (
              <p
                style={{
                  color: soft,
                }}
              >
                No records yet
              </p>
            ) : (
              stats.transactions
                .slice(0, 5)
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
                      {tx.type}
                    </div>

                    <div>
                      GH₵{" "}
                      {Number(
                        tx.amount
                      ).toFixed(
                        2
                      )}
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

const styles = {
  container: {
    minHeight: "100vh",
  },

  header: {
    height: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    padding: "0 18px",
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
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
