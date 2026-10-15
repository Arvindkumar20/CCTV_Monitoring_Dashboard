import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./context/ThemeContext";
import NotificationPrompt from "./components/alert/NotificationPrompt";
import { Toaster } from "sonner";
import { AlertProvider } from "./context/AlertContext";

function App() {
  const userData = JSON.parse(localStorage.getItem("userData"));
  console.log(userData);
  return (
    <AuthProvider>
      <ThemeProvider>

        <SettingsProvider>
          <AlertProvider>
                    <NotificationPrompt />
        <Toaster position="top-right" />
            <Router>
              <AppRoutes />
            </Router>
          </AlertProvider>
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
