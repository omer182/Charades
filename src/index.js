import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import CharadesGame from './UI/Charade';
import {createTheme, ThemeProvider} from "@mui/material";

const theme = createTheme({
    palette: {
        primary: {
            main: '#3f51b5',
        },
        secondary: {
            main: '#f50057',
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
