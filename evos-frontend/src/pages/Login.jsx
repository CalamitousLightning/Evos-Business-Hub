import { useState } from "react";
import { loginUser } from "../api";

export default function Login({ setUserEmail, setPage }) {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    try {
      const res = await loginUser({ email });

      if (res.data.status !== "ok") {
        alert("User not found");
        return;
      }

      // 🔥 SAVE USER
      localStorage.setItem("email", email);
      setUserEmail(email);

      setPage("shop"); // redirect

    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div style={styles.card}>
      <h2>Login</h2>

      <input
        placeholder="Enter email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
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