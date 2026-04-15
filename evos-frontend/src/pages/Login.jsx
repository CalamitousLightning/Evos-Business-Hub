import { useState } from "react";
import { loginUser } from "../api";

export default function Login({ setUser, setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

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

      console.log("LOGIN RESPONSE:", data);

      if (data.status !== "ok") {
        setError("Invalid username/email or password");
        return;
      }

      // ✅ SAVE USER
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("email", data.user.email);

      setUser(data.user);
      setPage("shop");

    } catch (err) {
      console.log("LOGIN ERROR:", err);

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.status ||
        "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>

        <input
          style={styles.input}
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div style={styles.error}>{error}</div>}

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

        <p style={styles.footer}>
          Don’t have an account?{" "}
          <span style={styles.link} onClick={() => setPage("register")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a", // dark navy
  },
  card: {
    width: "100%",
    maxWidth: "380px",
    padding: "30px",
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#111",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb", // blue
    color: "white",
    fontWeight: "bold",
    transition: "0.2s",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    textAlign: "center",
  },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    marginTop: "10px",
  },
  link: {
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
