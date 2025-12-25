// src/constants/apiConstants.js

// ===================================
// 🌍 Base API URL
// ===================================
export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ===================================
// 🔐 AUTH ENDPOINTS
// ===================================
export const AUTH_URL = {
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
  LOGOUT: `${BASE_URL}/auth/logout`, // ✅ Added logout endpoint
};

// ===================================
// 👤 USER ENDPOINTS
// ===================================
export const USER_URL = {
  PROFILE: `${BASE_URL}/users/profile`,
  DELETE: `${BASE_URL}/users/profile`,
  TOP_PROVIDERS: `${BASE_URL}/users/top`,
  UPLOAD_IMAGE: `${BASE_URL}/users/upload`,
};


export const PROVIDER_URL = {
  BASE: "providers",
  TOP: "providers/top",
};


// ===================================
// 🧰 JOB ENDPOINTS
// ===================================
export const JOB_URL = {
  BASE: `${BASE_URL}/jobs`,
};

// ===================================
// 💬 REVIEW ENDPOINTS
// ===================================
export const REVIEW_URL = {
  BASE: `${BASE_URL}/reviews`,
};

// ===================================
// ⚖️ DISPUTE ENDPOINTS
// ===================================
export const DISPUTE_URL = {
  BASE: `${BASE_URL}/disputes`,
};

// ===================================
// 🏷️ CATEGORY ENDPOINTS (Admin)
// ===================================
export const ADMIN_CATEGORY_URL = {
  BASE: `${BASE_URL}/admin/categories`,
};

// ===================================
// 💼 ADMIN DASHBOARD ENDPOINTS
// ===================================
export const ADMIN_ANALYTICS_URL = {
  BASE: `${BASE_URL}/admin/analytics`,
};
// src/constants/apiConstants.js
export const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
