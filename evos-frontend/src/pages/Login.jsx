import { useState } from "react";
import { loginUser } from "../api";

export default function Login({ setUser, setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await loginUser({
        username,
        password,
      });

      const data = res.data;

      if (data.status !== "ok") {
        alert("Invalid credentials");
        return;
      }

      // 🔥 SAVE FULL USER (NOT EMAIL ONLY)
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      // redirect
      setPage("shop");

    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  return (
    <div style={styles.card}>
      <h2>Login</h2>

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