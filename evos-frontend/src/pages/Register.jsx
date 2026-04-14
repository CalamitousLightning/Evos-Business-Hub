import { useState } from "react";
import { registerUser } from "../api";

export default function Register({ setPage }) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [ref, setRef] = useState("");

  const handleRegister = async () => {
    try {
      const res = await registerUser({
        username,
        full_name: fullName,
        email,
        phone,
        password,
        referred_by: ref || null,
      });

      const data = res.data;

      if (data.status === "username_taken") {
        alert("Username already taken");
        return;
      }

      alert("Registered successfully!");
      setPage("login");

    } catch (err) {
      console.log(err);
      alert("Register failed");
    }
  };

  return (
    <div style={styles.card}>
      <h2>Register</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        placeholder="Referral Code (optional)"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
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