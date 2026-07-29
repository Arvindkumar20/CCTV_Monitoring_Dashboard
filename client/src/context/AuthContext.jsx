// import React, { createContext, useEffect, useState, useRef } from "react";
// import api from "../services/api";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const hasFetched = useRef(false); // prevent double call

//   const fetchProfile = async () => {
//     try {
//       const res = await api.get("/api/auth/profile");
//       setUser(res.data);
//     } catch (err) {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token"); // only if using token auth

//     if (!hasFetched.current && token) {
//       hasFetched.current = true;
//       fetchProfile();
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const signup = async (data) => {
//     await api.post("/api/auth/register", data);
//     await fetchProfile();
//   };

//   const login = async (data) => {
//     await api.post("/api/auth/login", data);
//     await fetchProfile();
//   };

//   const logout = async () => {
//     await api.post("/api/auth/logout");
//     setUser(null);
//   };

//   const updateProfile = async (data) => {
//     const res = await api.patch("/api/auth/profile", data);
//     setUser(res.data);
//   };

//   const changePassword = async (data) => {
//     await api.post("/api/auth/change-password", data);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         isAuthenticated: !!user,
//         signup,
//         login,
//         logout,
//         updateProfile,
//         changePassword,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

import React, { createContext, useEffect, useState, useRef } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasInitialized = useRef(false);

  // Fetch profile
  const fetchProfile = async () => {
    const res = await api.get("/api/auth/profile");
    console.log(res);
    setUser(res.data.data);
  };

  // App initialization
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      try {
        // Silent refresh first
        await api.post("/api/auth/refresh-token");
        await fetchProfile();
      } catch (err) {
        console.log(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register
  const signup = async (data) => {
    const res = await api.post("/api/auth/register", data);
    console.log(res);
    await fetchProfile();
  };

  // Login
  const login = async (data) => {
    const res = await api.post("/api/auth/login", data);
    console.log(res);
    await fetchProfile();
  };

  // Logout
  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
    window.location.href = "/admin-login";
  };

  // Update profile
  const updateProfile = async (data) => {
    const res = await api.patch("/api/auth/profile", data);
    setUser(res.data);
  };

  // Change password
  const changePassword = async (data) => {
    await api.post("/api/auth/change-password", data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signup,
        login,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
