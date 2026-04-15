import axios from "axios";

// =========================
// BASE CONFIG
// =========================
const API = axios.create({
  baseURL: "https://evos-business-hub.onrender.com",
  timeout: 15000, // prevent infinite loading
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// AUTH
// =========================
export const registerUser = (data) =>
  API.post("/auth/register", {
    ...data,
    email: data.email?.trim().toLowerCase(),
    username: data.username?.trim().toLowerCase(),
  });

export const loginUser = (data) =>
  API.post("/auth/login", {
    ...data,
    username: data.username?.trim().toLowerCase(),
  });

// =========================
// PRICES
// =========================
export const getPrices = () => API.get("/prices");

// =========================
// ORDERS
// =========================
export const createOrder = (data) =>
  API.post("/orders/create", {
    ...data,
    email: data.email?.trim().toLowerCase(),
  });

export const getOrders = (email) =>
  API.get(`/orders/me?email=${encodeURIComponent(email)}`);

export default API;
