import { useState } from "react";
import API from "../api";

export default function Login({ setUser, setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");

      setLoading(true);

      const res = await API.post("/auth/login", {
        username,
        password,
      });

      const data = res.data;

      if (data.status !== "ok") {
        setError("Invalid credentials");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      setPage("shop");

    } catch (err) {
      console.log(err);
      setError(err.response?.data?.detail || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2>Login</h2>

      {error && <div style={styles.error}>{error}</div>}

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

const styles = {
  card: {
    maxWidth: "400px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  error: {
    background: "#7f1d1d",
    color: "white",
    padding: "8px",
    borderRadius: "6px",
  },
};