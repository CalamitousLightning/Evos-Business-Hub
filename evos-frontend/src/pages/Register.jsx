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

  const handleRegister = async () => {
    setError("");

    // basic validation
    if (!username || !email || !password) {
      setError("Username, email, and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await registerUser({
        username: username.trim().toLowerCase(),
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
        referred_by: ref.trim() || null,
      });

      const data = res.data;

      console.log("REGISTER RESPONSE:", data);

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

      alert("Account created successfully!");

      // go to login
      setPage("login");

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
      <h2 style={{ textAlign: "center" }}>Register</h2>

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
        placeholder="Phone"
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

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer",
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