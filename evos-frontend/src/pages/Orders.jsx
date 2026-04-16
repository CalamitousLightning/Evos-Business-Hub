import { useEffect, useState } from "react";
import { getOrders } from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ USE REAL USER ID INSTEAD OF EMAIL
  const userId = localStorage.getItem("user_id");

  // 🔥 STATUS COLOR MAP
  const getColor = (status) => {
    if (status === "pending_payment") return "#f59e0b";
    if (status === "processing") return "#3b82f6";
    if (status === "successful") return "#10b981";
    if (status === "failed") return "#ef4444";
    return "#6b7280";
  };

  // 🔥 FETCH ORDERS
  const loadOrders = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const res = await getOrders(userId);

      // ✅ BACKEND RETURNS { status, orders }
      if (Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const interval = setInterval(loadOrders, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Orders</h1>

      {/* NOT LOGGED IN */}
      {!userId && (
        <p style={styles.info}>
          Please login to view your orders.
        </p>
      )}

      {/* LOADING */}
      {loading && userId && (
        <p style={styles.info}>Loading orders...</p>
      )}

      {/* ERROR */}
      {error && <p style={styles.error}>{error}</p>}

      {/* EMPTY */}
      {!loading && userId && orders.length === 0 && !error && (
        <p style={styles.info}>No orders yet.</p>
      )}

      {/* ORDERS */}
      <div style={styles.grid}>
        {orders.map((o, i) => (
          <div key={i} style={styles.card}>
            <h3>{o.network} • {o.bundle}</h3>

            <p style={{ color: getColor(o.status), fontWeight: "bold" }}>
              {o.status}
            </p>

            <p>GH₵ {o.price}</p>

            <p style={styles.phone}>
              {o.phone_number}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
  },

  card: {
    padding: "15px",
    borderRadius: "12px",
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  phone: {
    fontSize: "12px",
    color: "#6b7280",
  },

  info: {
    textAlign: "center",
    color: "#6b7280",
  },

  error: {
    textAlign: "center",
    color: "red",
  },
};
