import axios from "axios";

// =========================
// BASE CONFIG (PRODUCTION SAFE)
// =========================
const API = axios.create({
  baseURL: "https://evos-business-hub.onrender.com",
  timeout: 20000, // slightly higher for Render cold starts
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// =========================
// GLOBAL ERROR DEBUG (IMPORTANT)
// =========================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// =========================
// AUTH
// =========================
export const registerUser = (data) =>
  API.post("/auth/register", {
    username: data.username?.trim().toLowerCase(),
    email: data.email?.trim().toLowerCase(),
    full_name: data.full_name,
    phone: data.phone,
    password: data.password,
    referred_by: data.referred_by || null,
  });

export const loginUser = (data) =>
  API.post("/auth/login", {
    username: data.username?.trim().toLowerCase(),
    password: data.password,
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
  });

export const getOrders = (user_id) =>
  API.get(`/orders/me?user_id=${user_id}`);

export default API;