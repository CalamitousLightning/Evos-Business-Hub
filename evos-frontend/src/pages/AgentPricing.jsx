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
  useEffect(() => {
    if (!user?.id) return;

    const loadPricing = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API}/agent/pricing/${user.id}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch pricing");
        }

        const data = await res.json();

        const normalized = (data.prices || []).map((item) => ({
          ...item,
          markup: item.markup || 0,
          final_price:
            Number(item.base_price) + Number(item.markup || 0),
        }));

        setRows(normalized);
      } catch (err) {
        console.log("Pricing load error:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadPricing();
  }, [user]);

  // =========================
  // UPDATE MARKUP
  // =========================
  const updateMarkup = (index, value) => {
    const copy = [...rows];

    const markup = Number(value || 0);
    const base = Number(copy[index].base_price || 0);

    copy[index].markup = markup;
    copy[index].final_price = base + markup;

    setRows(copy);
  };

  // =========================
  // SAVE PRICING
  // =========================
  const savePricing = async () => {
    setSaving(true);

    try {
      const res = await fetch(
        `${API}/agent/pricing/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: user.id,
            prices: rows,
          }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        alert("Pricing updated successfully");
      } else {
        alert(data.message || "Failed to save pricing");
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
      {/* HEADER */}
      <div style={styles.top}>
        <button
          style={styles.back}
          onClick={() => setPage("agent-dashboard")}
        >
          ← Back
        </button>

        <h1 style={styles.title}>Agent Pricing</h1>
      </div>

      <p style={styles.sub}>
        Set your markup. Customers will pay: Base Price + Your Markup
      </p>

      {/* LOADING */}
      {loading ? (
        <p>Loading pricing...</p>
      ) : rows.length === 0 ? (
        <p>No pricing data found</p>
      ) : (
        <>
          {/* PRICE LIST */}
          {rows.map((item, index) => (
            <div key={index} style={styles.card}>
              <div style={styles.row}>
                <div>
                  <strong>{item.network}</strong>
                  <br />
                  {item.bundle}
                </div>

                <div>GH₵ {item.base_price}</div>
              </div>

              <div style={{ marginTop: "12px" }}>
                <label>Markup (Your Profit)</label>

                <input
                  type="number"
                  min="0"
                  value={item.markup}
                  onChange={(e) =>
                    updateMarkup(index, e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              <div style={{ marginTop: "12px" }}>
                Final Price:{" "}
                <strong>GH₵ {item.final_price}</strong>
              </div>
            </div>
          ))}

          {/* SAVE BUTTON */}
          <button
            style={{
              ...styles.save,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
            onClick={savePricing}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Pricing"}
          </button>
        </>
      )}
    </div>
  );
}

/* =======================
   STYLES
======================= */

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
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "18px",
    borderRadius: "18px",
    marginBottom: "14px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
  },

  input: {
    width: "100%",
    marginTop: "8px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
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
    background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    color: "#00111f",
  },
};
