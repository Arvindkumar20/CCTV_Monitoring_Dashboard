// context/ThemeContext.jsx
import React, { createContext, useContext, useMemo } from "react";
import { useSettings } from "@/hooks/useSettings";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { settings } = useSettings();
  
  const theme = useMemo(() => {
    const primaryColor = settings?.branding?.primaryColor || "#2563eb";
    const secondaryColor = settings?.branding?.secondaryColor || "#5419bb";
    const accentColor = settings?.branding?.accentColor || "#06b6d4";
    
    return {
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      },
      // Add CSS variables for use in styles
      cssVariables: {
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor,
        '--accent-color': accentColor,
      }
    };
  }, [settings]);

  return (
    <ThemeContext.Provider value={theme}>
      <div style={theme.cssVariables}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};