import { useEffect, useState } from "react";
import { getOrders } from "../api";


export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = localStorage.getItem("email");

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
    if (!user) return;

    try {
      setError("");
      const res = await getOrders(user);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadOrders();

    const interval = setInterval(loadOrders, 5000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Orders</h1>

      {/* NOT LOGGED IN */}
      {!user && (
        <p style={styles.info}>
          Please login to view your orders.
        </p>
      )}

      {/* LOADING */}
      {loading && user && (
        <p style={styles.info}>Loading orders...</p>
      )}

      {/* ERROR */}
      {error && <p style={styles.error}>{error}</p>}

      {/* EMPTY STATE */}
      {!loading && orders.length === 0 && user && (
        <p style={styles.info}>No orders yet.</p>
      )}

      {/* ORDERS LIST */}
      <div style={styles.grid}>
        {orders.map((o, i) => (
          <div key={i} style={styles.card}>
            <h3>{o.network} • {o.bundle}</h3>

            <p style={{ color: getColor(o.status), fontWeight: "bold" }}>
              {o.status}
            </p>

            <p>GH₵ {o.price}</p>
            <p style={styles.phone}>{o.phone}</p>
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