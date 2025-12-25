import { createSlice } from "@reduxjs/toolkit";

// Load saved data from localStorage
const userInfo = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const savedLoginRole = localStorage.getItem("loginRole") || null; // "customer" or "provider"

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: userInfo,
    loginRole: savedLoginRole, // Track which role the user chose before login
  },
  reducers: {
    // ✅ Save user credentials after login or register
    setCredentials: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },

    // ✅ Update existing user info (e.g., after editing profile)
    updateUserInfo: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("userInfo", JSON.stringify(state.user));
      }
    },

    // ✅ Store login role (called from AuthChoice)
    setLoginRole: (state, action) => {
      state.loginRole = action.payload; // "customer" or "provider"
      localStorage.setItem("loginRole", action.payload);
    },

    // ✅ Logout clears everything
    logout: (state) => {
      state.user = null;
      state.loginRole = null;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("loginRole");
    },
  },
});

export const { setCredentials, updateUserInfo, setLoginRole, logout } = authSlice.actions;
export default authSlice.reducer;
