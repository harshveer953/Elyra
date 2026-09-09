import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://elyra-dfg8.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization Bearer token to all outgoing requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("elyra_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(typeof message === "string" ? message : JSON.stringify(message)));
  }
);

/* ==================== AUTH API ==================== */
export const registerUser = async (userData) => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const getPrivateProfile = async () => {
  const { data } = await api.post("/auth/private");
  return data;
};

/* ==================== EVENTS API ==================== */
export const fetchEvents = async () => {
  const { data } = await api.get("/events");
  return data;
};

export const fetchEventById = async (eventId) => {
  const { data } = await api.get(`/events/${eventId}`);
  return data;
};

export const createEvent = async (formData) => {
  const { data } = await api.post("/events", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

/* ==================== ORDERS / TICKETS API ==================== */
export const bookTicket = async (eventId, bookingData) => {
  // bookingData: { numberOfSeats, couponCode }
  const { data } = await api.post(`/order/${eventId}`, bookingData);
  return data;
};

export const fetchMyTickets = async () => {
  const { data } = await api.get("/order");
  return data;
};

export const fetchTicketById = async (ticketId) => {
  const { data } = await api.get(`/order/${ticketId}`);
  return data;
};

export const cancelTicket = async (ticketId) => {
  const { data } = await api.put(`/order/${ticketId}`);
  return data;
};

/* ==================== COMMENTS / REVIEWS API ==================== */
export const fetchEventComments = async (eventId) => {
  const { data } = await api.get(`/comment/${eventId}`);
  return data;
};

export const addEventComment = async (eventId, commentData) => {
  // commentData: { text, rating }
  const { data } = await api.post(`/comment/${eventId}`, commentData);
  return data;
};

/* ==================== AI CHAT ASSISTANT API ==================== */
export const sendChatMessage = async (text) => {
  const { data } = await api.post("/chat", { text });
  return data;
};

/* ==================== ADMIN API ==================== */
export const fetchAdminUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data;
};

export const updateAdminUser = async (userId, updateData) => {
  const { data } = await api.put(`/admin/users/${userId}`, updateData);
  return data;
};

export const fetchAdminEvents = async () => {
  const { data } = await api.get("/admin/events");
  return data;
};

export const updateAdminEvent = async (eventId, updateData) => {
  const { data } = await api.put(`/admin/events/${eventId}`, updateData);
  return data;
};

export const fetchAdminOrders = async () => {
  const { data } = await api.get("/admin/orders");
  return data;
};

export const fetchAdminCoupons = async () => {
  const { data } = await api.get("/admin/coupons");
  return data;
};

export const createAdminCoupon = async (couponData) => {
  // couponData: { couponCode, couponDiscount }
  const { data } = await api.post("/admin/coupons", couponData);
  return data;
};

export const updateAdminCoupon = async (couponId, couponData) => {
  const { data } = await api.put(`/admin/coupons/${couponId}`, couponData);
  return data;
};

export default api;
