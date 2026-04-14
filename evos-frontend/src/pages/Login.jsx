import { useState } from "react";
import { loginUser } from "../api";

export default function Login({ setUser, setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    // basic frontend validation
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await loginUser({
        username: username.trim().toLowerCase(),
        password: password.trim(),
      });

      const data = res.data;

      console.log("LOGIN RESPONSE:", data); // DEBUG (important)

      if (data.status !== "ok") {
        setError(
          data.status === "user_not_found"
            ? "User not found"
            : data.status === "wrong_password"
            ? "Wrong password"
            : "Invalid credentials"
        );
        return;
      }

      // save user safely
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("username", data.user.username);

      setUser(data.user);
      setPage("shop");
    } catch (err) {
      console.log("LOGIN ERROR:", err);

      setError(
        err.response?.data?.detail ||
        "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={{ textAlign: "center" }}>Login</h2>

      <input
        style={styles.input}
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />

      <input
        style={styles.input}
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

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
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#111",
    color: "white",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
};