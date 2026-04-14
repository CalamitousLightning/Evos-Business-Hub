import axios from "axios";

const API = axios.create({
  baseURL: "https://evos-business-hub.onrender.com"
});

// =========================
// AUTH
// =========================
export const registerUser = (data) =>
  API.post("/auth/register", data);

export const loginUser = (data) =>
  API.post("/auth/login", data);

// =========================
// PRICES
// =========================
export const getPrices = () =>
  API.get("/prices");

// =========================
// ORDERS
// =========================
export const createOrder = (data) =>
  API.post("/orders/create", data);

export const getOrders = (email) =>
  API.get(`/orders/me?email=${email}`);

export default API;