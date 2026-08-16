import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          <Router>
            <AppRoutes />
          </Router>
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
