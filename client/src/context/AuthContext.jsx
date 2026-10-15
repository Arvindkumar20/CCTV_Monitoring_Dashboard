

// import React, { createContext, useEffect, useState, useRef } from "react";
// import api from "../services/api";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const hasInitialized = useRef(false);

//   // Fetch profile
//   const fetchProfile = async () => {
//     const res = await api.get("/api/auth/profile");
//     console.log(res);
//     setUser(res.data.data);
//   };

//   // App initialization
//   useEffect(() => {
//     if (hasInitialized.current) return;
//     hasInitialized.current = true;

//     const initAuth = async () => {
//       try {
//         // Silent refresh first
//         await api.post("/api/auth/refresh-token");
//         await fetchProfile();
//       } catch (err) {
//         console.log(err);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initAuth();
//   }, []);

//   // Register
//   const signup = async (data) => {
//     const res = await api.post("/api/auth/register", data);
//     console.log(res);
//     await fetchProfile();
//   };

//   // Login
//   const login = async (data) => {
//     const res = await api.post("/api/auth/login", data);
//     console.log(res);
//     await fetchProfile();
//   };

//   // Logout
//   const logout = async () => {
//     await api.post("/api/auth/logout");
//     setUser(null);
//     window.location.href = "/admin-login";
//   };

//   // Update profile
//   const updateProfile = async (data) => {
//     const res = await api.patch("/api/auth/profile", data);
//     setUser(res.data);
//   };

//   // Change password
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












// frontend/src/context/AuthContext.jsx
import React, { createContext, useEffect, useState, useRef } from "react";
import api, { tokenStore } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(tokenStore.get()); // ✅ Init from store
  const [loading, setLoading] = useState(true);

  const hasInitialized = useRef(false);

  // ═══════════════════════════════════════════════════════════
  // ✅ SYNC with tokenStore (interceptor updates it)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const unsubscribe = tokenStore.subscribe((newToken) => {
      setToken(newToken);
    });
    return unsubscribe;
  }, []);

  // Fetch profile
  const fetchProfile = async () => {
    const res = await api.get("/api/auth/profile");
    setUser(res.data.data);
  };

  // App initialization
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      try {
        // ✅ Silent refresh — interceptor will capture new token
        await api.post("/api/auth/refresh-token");
        await fetchProfile();
      } catch (err) {
        console.log(err);
        setUser(null);
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register
  const signup = async (data) => {
    const res = await api.post("/api/auth/register", data);
    await fetchProfile();
  };

  // Login
  const login = async (data) => {
    const res = await api.post("/api/auth/login", data);
    // ✅ Token automatically captured by interceptor
    await fetchProfile();
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (e) {
      // ignore
    }
    setUser(null);
    tokenStore.clear();
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
        token, // ✅ Expose token for Socket.IO
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