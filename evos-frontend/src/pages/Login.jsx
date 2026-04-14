import { useState } from "react";
import * as API from "../api";

export default function Login({ setUser, setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");

      if (!username || !password) {
        setError("Please fill in all fields");
        return;
      }

      setLoading(true);

      const res = await API.loginUser({
        username,
        password,
      });

      const data = res.data;

      if (data.status !== "ok") {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      // 🔥 SAVE FULL USER
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      // redirect
      setPage("shop");

    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.detail || "Login failed. Try again."
      );
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

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
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

  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#38bdf8",
    color: "white",
    fontWeight: "bold",
  },

  error: {
    background: "#7f1d1d",
    color: "white",
    padding: "8px",
    borderRadius: "6px",
    fontSize: "14px",
  },
};