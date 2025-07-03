import React, { createContext, useContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import CharadesGame from './UI/Charade';
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

// Theme Context for Dark/Light Mode
const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

const ThemeContextProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: "#8b5cf6",
        light: "#c4b5fd",
        dark: "#7c3aed"
      },
      secondary: {
        main: "#06b6d4",
        light: "#67e8f9",
        dark: "#0891b2"
      },
      tertiary: {
        main: "#f59e0b",
        light: "#fed7aa",
        dark: "#d97706"
      },
      success: {
        main: "#10b981",
        light: "#86efac",
        dark: "#059669"
      },
      warning: {
        main: "#f59e0b",
        light: "#fed7aa",
        dark: "#d97706"
      },
      error: {
        main: "#ef4444",
        light: "#fca5a5",
        dark: "#dc2626"
      },
      background: {
        default: "linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 50%, #f3e8ff 100%)",
        paper: "rgba(255, 255, 255, 0.95)"
      },
      text: {
        primary: "#374151",
        secondary: "#9ca3af"
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem"
      },
      h2: {
        fontWeight: 600,
        fontSize: "2rem"
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.5rem"
      },
      button: {
        fontWeight: 600,
        textTransform: 'none'
      }
    },
    shape: {
      borderRadius: 16
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(139, 92, 246, 0.1)",
            boxShadow: "0 4px 20px 0 rgba(139, 92, 246, 0.15)"
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "10px 24px",
            boxShadow: "0 2px 10px 0 rgba(139, 92, 246, 0.2)",
            transition: "all 0.3s ease",
            '&:hover': {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px 0 rgba(139, 92, 246, 0.3)"
            }
          }
        }
      }
    }
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: "#8b5cf6",
        light: "#a78bfa",
        dark: "#7c3aed"
      },
      secondary: {
        main: "#06b6d4",
        light: "#22d3ee",
        dark: "#0891b2"
      },
      tertiary: {
        main: "#f59e0b",
        light: "#fbbf24",
        dark: "#d97706"
      },
      success: {
        main: "#10b981",
        light: "#34d399",
        dark: "#059669"
      },
      warning: {
        main: "#f59e0b",
        light: "#fbbf24",
        dark: "#d97706"
      },
      error: {
        main: "#ef4444",
        light: "#f87171",
        dark: "#dc2626"
      },
      background: {
        default: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)",
        paper: "rgba(15, 23, 42, 0.8)"
      },
      text: {
        primary: "#f8fafc",
        secondary: "#cbd5e1"
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem"
      },
      h2: {
        fontWeight: 600,
        fontSize: "2rem"
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.5rem"
      },
      button: {
        fontWeight: 600,
        textTransform: 'none'
      }
    },
    shape: {
      borderRadius: 16
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(10px)",
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(148, 163, 184, 0.1)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)"
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "10px 24px",
            boxShadow: "0 4px 15px 0 rgba(0, 0, 0, 0.3)",
            transition: "all 0.3s ease",
            '&:hover': {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px 0 rgba(0, 0, 0, 0.4)"
            }
          }
        }
      }
    }
  });

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <CharadesGame />
    </ThemeContextProvider>
  </React.StrictMode>
);
