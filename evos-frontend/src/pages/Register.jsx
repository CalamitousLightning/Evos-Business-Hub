import { useState } from "react";
import { registerUser } from "../api";

export default function Register({ setPage }) {
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    ref: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    const { username, fullName, email, phone, password, ref } = form;

    // ✅ VALIDATION
    if (!username || !email || !password) {
      return setError("Username, email, and password are required");
    }

    if (username.length < 3) {
      return setError("Username must be at least 3 characters");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return setError("Enter a valid phone number");
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

      // ❌ BACKEND HANDLING
      if (data.status === "username_taken") {
        return setError("Username already taken");
      }

      if (data.status === "email_taken") {
        return setError("Email already exists");
      }

      if (data.status !== "created") {
        return setError("Registration failed");
      }

      // ✅ SUCCESS
      setSuccess("Account created successfully 🎉");

      setTimeout(() => {
        setPage("login");
      }, 1200);

    } catch (err) {
      console.log("REGISTER ERROR:", err);

      setError(
        err.response?.data?.detail ||
        "Server error. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join EVOS Data Services</p>

        <input
          style={styles.input}
          placeholder="Username"
          value={form.username}
          onChange={(e) => handleChange("username", e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Phone (0551234567)"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Referral Code (optional)"
          value={form.ref}
          onChange={(e) => handleChange("ref", e.target.value)}
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

        <p style={styles.switchText}>
          Already have an account?{" "}
          <span onClick={() => setPage("login")} style={styles.link}>
            Login
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
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  title: {
    textAlign: "center",
    margin: 0,
  },
  subtitle: {
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
    marginBottom: "10px",
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
    background: "#111827",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.2s",
  },
  error: {
    color: "#ef4444",
    fontSize: "13px",
    textAlign: "center",
  },
  success: {
    color: "#10b981",
    fontSize: "13px",
    textAlign: "center",
  },
  switchText: {
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
