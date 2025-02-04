import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import CharadesGame from './UI/Charade';
import {createTheme, ThemeProvider} from "@mui/material";

const theme = createTheme({
    palette: {
        palette: {
            primary: {
                main: "#006d77", // Example color
            },
            secondary: {
                main: "#e29578",
            },
            tertiary: {
                main: "#83c5be",
            },
            quaternary: {
                main: "#ffddd2",
            },
            quinary: {
                main: "#edf6f9",
            },
        },
    }
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <ThemeProvider theme={theme}>
      <CharadesGame/>
      </ThemeProvider>
  </React.StrictMode>
);
