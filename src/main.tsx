import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import '@fontsource-variable/rubik';
import './styles/global.css';
import App from './App';
import RemoteApp from './remote/RemoteApp';

// /r/ABCD is a phone joining a room as the host remote; everything else is the big screen.
const remoteCode = location.pathname.match(/^\/r\/([a-z]{4})\/?$/i)?.[1]?.toUpperCase();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      {remoteCode ? <RemoteApp code={remoteCode} /> : <App />}
    </MotionConfig>
  </StrictMode>,
);
