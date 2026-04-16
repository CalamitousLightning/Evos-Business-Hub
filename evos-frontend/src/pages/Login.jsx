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

      const data = res?.data;

      console.log("LOGIN RESPONSE:", data);

      if (!data || data.status !== "ok") {
        setError("Invalid username or password");
        return;
      }

      const user = data.user;

      // 🚨 CRITICAL FIX: ensure user_id exists for backend
      // backend uses user_id in orders
      const normalizedUser = {
        id: user.id || user.user_id || null,
        username: user.username || "",
        email: user.email || "",
        full_name: user.full_name || "",
        referral_code: user.referral_code || "",
        rank: user.rank || 1,
      };

      // =========================
      // SAVE FULL USER OBJECT
      // =========================
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("email", normalizedUser.email);
      localStorage.setItem("username", normalizedUser.username);
      localStorage.setItem("user_id", normalizedUser.id); // 🔥 IMPORTANT FIX

      setUser(normalizedUser);

      // =========================
      // GO TO DASHBOARD
      // =========================
      setPage("dashboard");

    } catch (err) {
      console.log("LOGIN ERROR:", err);

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.status ||
        "Server error. Try again."
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
    background: "#0f172a",
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
    color: "#111",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
  },

  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: "bold",
  },

  error: {
    color: "#dc2626",
    fontSize: "13px",
    textAlign: "center",
  },

  footer: {
    textAlign: "center",
    fontSize: "13px",
  },

  link: {
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
