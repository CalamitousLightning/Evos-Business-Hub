import { useState } from "react";
import { registerUser } from "../api";

export default function Register({ setPage }) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [ref, setRef] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    // 🔒 FRONTEND VALIDATION (MATCH BACKEND)
    if (!username || !email || !password) {
      setError("Username, email, and password are required");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Enter a valid phone number");
      return;
    }

    try {
      setLoading(true);

      const res = await registerUser({
        username: username.trim().toLowerCase(),
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        password: password.trim(),
        referred_by: ref.trim() || null,
      });

      const data = res.data;

      console.log("REGISTER RESPONSE:", data);

      // ❌ BACKEND STATUS HANDLING
      if (data.status === "username_taken") {
        setError("Username already taken");
        return;
      }

      if (data.status === "email_taken") {
        setError("Email already exists");
        return;
      }

      if (data.status !== "created") {
        setError("Registration failed");
        return;
      }

      // ✅ SUCCESS
      setSuccess("Account created successfully!");

      // small delay for UX
      setTimeout(() => {
        setPage("login");
      }, 1200);

    } catch (err) {
      console.log("REGISTER ERROR:", err);

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
      <h2 style={{ textAlign: "center" }}>Create Account</h2>

      <input
        style={styles.input}
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Phone (e.g. 0551234567)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Referral Code (optional)"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
      />

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Creating account..." : "Register"}
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
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#111",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    color: "#ef4444",
    fontSize: "14px",
    textAlign: "center",
  },
  success: {
    color: "#10b981",
    fontSize: "14px",
    textAlign: "center",
  },
};
