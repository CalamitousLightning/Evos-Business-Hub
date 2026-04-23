import { useEffect, useState } from "react";

const API = "https://evos-business-hub.onrender.com";

export default function AgentPricing({ user, setPage }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);

  // =========================
  // ACCESS GUARD
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
  // LOAD PRICING
  // =========================
  const loadPricing = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${API}/agent/pricing/${user.id}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch pricing");
      }

      const data = await res.json();

      const normalized = (data.prices || []).map((item) => {
        const base = Number(item.base_price || 0);
        const markup = Number(item.markup || 0);

        return {
          ...item,
          markup,
          final_price: base + markup,
        };
      });

      setRows(normalized);
    } catch (err) {
      console.log("Pricing load error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
  }, [user]);

  // =========================
  // UPDATE MARKUP
  // =========================
  const updateMarkup = (index, value) => {
    const copy = [...rows];

    let markup = Number(value || 0);

    if (markup < 0) markup = 0;

    const base = Number(copy[index].base_price || 0);

    copy[index].markup = markup;
    copy[index].final_price = base + markup;

    setRows(copy);
  };

  // =========================
  // SAVE PRICING
  // =========================
  const savePricing = async () => {
    try {
      setSaving(true);

      const res = await fetch(
        `${API}/agent/pricing/save`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            agent_id: user.id,
            prices: rows,
          }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        alert("Pricing updated");
        loadPricing();
      } else {
        alert(
          data.message ||
            "Failed to save pricing"
        );
      }
    } catch (err) {
      console.log(err);
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.top}>
        <button
          style={styles.back}
          onClick={() =>
            setPage("agent-dashboard")
          }
        >
          ← Back
        </button>

        <h1 style={styles.title}>
          Agent Pricing
        </h1>
      </div>

      <p style={styles.sub}>
        Base Price + Your Markup = Customer Price
      </p>

      {loading ? (
        <p>Loading pricing...</p>
      ) : rows.length === 0 ? (
        <p>No pricing found</p>
      ) : (
        <>
          {rows.map((item, index) => (
            <div
              key={`${item.network}-${item.bundle}`}
              style={styles.card}
            >
              <div style={styles.row}>
                <div>
                  <strong>
                    {item.network}
                  </strong>
                  <br />
                  {item.bundle}
                </div>

                <div>
                  GH₵{" "}
                  {Number(
                    item.base_price
                  ).toFixed(2)}
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                }}
              >
                <label>
                  Markup
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.markup}
                  onChange={(e) =>
                    updateMarkup(
                      index,
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>

              <div
                style={{
                  marginTop: 12,
                }}
              >
                Final Price:{" "}
                <strong>
                  GH₵{" "}
                  {Number(
                    item.final_price
                  ).toFixed(2)}
                </strong>
              </div>
            </div>
          ))}

          <button
            style={{
              ...styles.save,
              opacity: saving
                ? 0.7
                : 1,
            }}
            onClick={savePricing}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Pricing"}
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "18px",
    color: "#e5e7eb",
  },

  top: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "8px",
  },

  back: {
    border: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    background: "#1e293b",
    color: "white",
  },

  title: {
    fontSize: "28px",
    fontWeight: "900",
    margin: 0,
  },

  sub: {
    color: "#94a3b8",
    marginBottom: "18px",
  },

  card: {
    background: "#0f172a",
    border:
      "1px solid rgba(255,255,255,0.06)",
    padding: "18px",
    borderRadius: "18px",
    marginBottom: "14px",
  },

  row: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "10px",
    alignItems: "center",
  },

  input: {
    width: "100%",
    marginTop: "8px",
    padding: "12px",
    borderRadius: "12px",
    border:
      "1px solid rgba(255,255,255,0.08)",
    background: "#020617",
    color: "white",
  },

  save: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    marginTop: "10px",
    fontWeight: "900",
    background:
      "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    color: "#00111f",
    cursor: "pointer",
  },
};
