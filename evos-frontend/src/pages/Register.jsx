import { useState } from "react";
import { registerUser } from "../api";

export default function Register({ setPage }) {
  const [email, setEmail] = useState("");

  const handleRegister = async () => {
    try {
      const res = await registerUser({ email });

      if (res.data.status === "exists") {
        alert("User already exists");
      } else {
        alert("Registered! Now login");
        setPage("login");
      }

    } catch {
      alert("Register failed");
    }
  };

  return (
    <div style={styles.card}>
      <h2>Register</h2>

      <input
        placeholder="Enter email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleRegister}>Register</button>
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
};