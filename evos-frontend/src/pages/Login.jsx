import { useState } from "react";
import { loginUser } from "../api";

export default function Login({ setUser, setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await loginUser({
        username,
        password,
      });

      const data = res.data;

      if (data.status !== "ok") {
        alert("Invalid credentials");
        setLoading(false);
        return;
      }

      // save user
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("username", data.user.username);

      setUser(data.user);

      setPage("shop");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
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

      <button onClick={handleLogin} disabled={loading}>
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
};
