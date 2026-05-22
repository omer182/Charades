import React, { createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import CharadesGame from './UI/Charade';
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const ThemeContext = createContext({ isDarkMode: true });
export const useThemeMode = () => useContext(ThemeContext);

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#c6ff3d', light: '#dcff7a', dark: '#9bd200', contrastText: '#07070d' },
    secondary: { main: '#3df0ff', light: '#7df6ff', dark: '#00bcd4', contrastText: '#07070d' },
    success:   { main: '#c6ff3d', light: '#dcff7a', dark: '#9bd200', contrastText: '#07070d' },
    error:     { main: '#ff3d8a', light: '#ff7aae', dark: '#d60057', contrastText: '#ffffff' },
    warning:   { main: '#ff8a3d', light: '#ffb37d', dark: '#c75700', contrastText: '#07070d' },
    info:      { main: '#6366f1', light: '#8a8df5', dark: '#3f43d9', contrastText: '#ffffff' },
    background: {
      default: '#07070d',
      paper: 'rgba(15, 15, 24, 0.72)',
    },
    text: {
      primary: '#f4f4f8',
      secondary: '#9da3b4',
      disabled: '#6b7184',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    overline: { fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'rgba(15, 15, 24, 0.55)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 18,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 32px rgba(0,0,0,0.45)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 22px',
          fontWeight: 600,
          letterSpacing: '0.01em',
          transition: 'transform 0.15s ease, box-shadow 0.25s ease, background 0.25s ease',
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #c6ff3d 0%, #9bd200 100%)',
          color: '#07070d',
          boxShadow: '0 0 0 1px rgba(198,255,61,0.4), 0 8px 24px -8px rgba(198,255,61,0.6)',
          '&:hover': {
            background: 'linear-gradient(135deg, #d8ff66 0%, #afe800 100%)',
            boxShadow: '0 0 0 1px rgba(198,255,61,0.6), 0 10px 32px -6px rgba(198,255,61,0.8)',
          },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.14)',
          color: '#f4f4f8',
          background: 'rgba(255,255,255,0.03)',
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.28)',
            background: 'rgba(255,255,255,0.06)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease',
          '&:hover': { transform: 'translateY(-1px)' },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'rgba(15, 15, 24, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          fontSize: '0.72rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
          padding: '6px 10px',
        },
        arrow: { color: 'rgba(15, 15, 24, 0.95)' },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: '#c6ff3d' },
        thumb: {
          boxShadow: '0 0 0 1px rgba(198,255,61,0.6), 0 0 16px -2px rgba(198,255,61,0.7)',
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '0 0 0 1px rgba(198,255,61,0.6), 0 0 22px rgba(198,255,61,0.9)',
          },
        },
        rail: { backgroundColor: 'rgba(255,255,255,0.08)', opacity: 1 },
        mark: { backgroundColor: 'rgba(255,255,255,0.18)', height: 4 },
        markLabel: { color: 'rgba(244,244,248,0.6)', fontSize: '0.72rem', fontWeight: 500 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'rgba(255,255,255,0.03)',
          '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.22) !important' },
          '&.Mui-focused fieldset': { borderColor: '#c6ff3d !important', borderWidth: '1px !important' },
        },
        input: { color: '#f4f4f8' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: 'rgba(244,244,248,0.55)', '&.Mui-focused': { color: '#c6ff3d' } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: '0.02em',
          borderRadius: 999,
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(13, 13, 24, 0.85)',
          backgroundImage: 'none',
          backdropFilter: 'blur(28px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          background: 'rgba(4, 4, 10, 0.78)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeContext.Provider value={{ isDarkMode: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CharadesGame />
      </ThemeProvider>
    </ThemeContext.Provider>
  </React.StrictMode>
);
