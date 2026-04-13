import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

// AUTH
export const registerUser = (email) =>
  API.post("/auth/register", { email });

export const loginUser = (email) =>
  API.post("/auth/login", { email });

// PRICES
export const getPrices = () =>
  API.get("/prices");

// ORDERS
export const createOrder = (data) =>
  API.post("/orders/create", data);

// ✅ FIXED
export const getOrders = (email) =>
  API.get(`/orders/me?email=${email}`);

export default API;