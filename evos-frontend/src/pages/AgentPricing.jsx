import { useEffect, useState } from "react";

export default function AgentPricing({
  user,
  setPage,
}) {
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

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
  // LOAD PRICES
  // =========================
  useEffect(() => {
    if (!user?.id) return;

    const loadPricing =
      async () => {
        try {
          const res =
            await fetch(
              `https://YOUR-BACKEND-URL/agent/pricing/${user.id}`
            );

          const data =
            await res.json();

          setRows(
            data.prices || []
          );
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

    loadPricing();
  }, [user]);

  // =========================
  // INPUT CHANGE
  // =========================
  const updateMarkup = (
    index,
    value
  ) => {
    const copy = [...rows];

    copy[index].markup =
      value;

    copy[index].final_price =
      Number(
        copy[index]
          .base_price
      ) +
      Number(value || 0);

    setRows(copy);
  };

  // =========================
  // SAVE ALL
  // =========================
  const savePricing =
    async () => {
      setSaving(true);

      try {
        const res =
          await fetch(
            "https://evos-business-hub.onrender.com/agent/pricing/save",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                agent_id:
                  user.id,
                prices: rows,
              }),
            }
          );

        const data =
          await res.json();

        if (
          data.status ===
          "success"
        ) {
          alert(
            "Pricing updated"
          );
        } else {
          alert(
            "Failed to save"
          );
        }
      } catch (error) {
        alert(
          "Network error"
        );
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
          onClick={() =>
            setPage(
              "agent-dashboard"
            )
          }
        >
          ← Back
        </button>

        <h1 style={styles.title}>
          Agent Pricing
        </h1>
      </div>

      <p style={styles.sub}>
        Set your markup.
        Customers pay your
        final price.
      </p>

      {loading ? (
        <p>
          Loading pricing...
        </p>
      ) : (
        <>
          {rows.map(
            (item, index) => (
              <div
                key={index}
                style={
                  styles.card
                }
              >
                <div
                  style={
                    styles.row
                  }
                >
                  <div>
                    <strong>
                      {
                        item.network
                      }
                    </strong>
                    <br />
                    {
                      item.bundle
                    }
                  </div>

                  <div>
                    GH₵{" "}
                    {
                      item.base_price
                    }
                  </div>
                </div>

                <div
                  style={{
                    marginTop:
                      "12px",
                  }}
                >
                  <label>
                    Markup
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      item.markup
                    }
                    onChange={(
                      e
                    ) =>
                      updateMarkup(
                        index,
                        e
                          .target
                          .value
                      )
                    }
                    style={
                      styles.input
                    }
                  />
                </div>

                <div
                  style={{
                    marginTop:
                      "12px",
                  }}
                >
                  Final Price:
                  <strong>
                    {" "}
                    GH₵{" "}
                    {
                      item.final_price
                    }
                  </strong>
                </div>
              </div>
            )
          )}

          <button
            style={
              styles.save
            }
            onClick={
              savePricing
            }
            disabled={
              saving
            }
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
    background:
      "#1e293b",
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
    background:
      "#0f172a",
    border:
      "1px solid rgba(255,255,255,0.06)",
    padding: "18px",
    borderRadius:
      "18px",
    marginBottom:
      "14px",
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
    borderRadius:
      "12px",
    border:
      "1px solid rgba(255,255,255,0.08)",
    background:
      "#020617",
    color: "white",
  },

  save: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius:
      "14px",
    marginTop: "10px",
    cursor: "pointer",
    fontWeight: "900",
    background:
      "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    color: "#00111f",
  },
};
