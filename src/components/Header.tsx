import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Flag, Maximize2, Minimize2, Smartphone, Volume2, VolumeX, X } from 'lucide-react';
import { useRoom } from '../net/RoomContext';
import JoinPanel from './JoinPanel';
import type { ScreenProps } from './types';
import { vars } from './ui';

function useFullscreen() {
  const [on, setOn] = useState(() => Boolean(document.fullscreenElement));
  useEffect(() => {
    const sync = () => setOn(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const toggle = () =>
    (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => undefined);
  return { on, toggle, supported: document.fullscreenEnabled };
}

export default function Header({ state, dispatch }: ScreenProps) {
  const { phase, round, settings, teams, teamIndex } = state;
  const fullscreen = useFullscreen();
  const [confirmEnd, setConfirmEnd] = useState(false);
  const { room, openRoom, closeRoom } = useRoom();
  const [showJoin, setShowJoin] = useState(false);
  const phoneLive = room.open && room.status === 'live' && room.remotes > 0;

  // The QR has done its job once a phone joins: close it so the game is visible again.
  const [seenRemotes, setSeenRemotes] = useState(room.remotes);
  if (room.remotes !== seenRemotes) {
    setSeenRemotes(room.remotes);
    if (room.remotes > seenRemotes && showJoin) setShowJoin(false);
  }

  useEffect(() => {
    if (!confirmEnd) return;
    const id = setTimeout(() => setConfirmEnd(false), 3000);
    return () => clearTimeout(id);
  }, [confirmEnd]);

  const inGame = phase !== 'lobby' && phase !== 'gameOver';
  const totalTurns = settings.rounds * teams.length;
  const turnNo = (round - 1) * teams.length + teamIndex + 1;

  return (
    <header className="header">
      <div className="brand">
        <span className="brand__mark" aria-hidden>
          <svg viewBox="0 0 32 32" width="30" height="30">
            <rect x="2" y="2" width="28" height="28" rx="9" fill="var(--sun)" />
            <circle cx="11.5" cy="13" r="2.4" fill="var(--ink-0)" />
            <circle cx="20.5" cy="13" r="2.4" fill="var(--ink-0)" />
            <path d="M9.5 19.5c3.6 4 9.4 4 13 0" stroke="var(--ink-0)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </svg>
        </span>
        <span className="brand__name">בלי מילים</span>
      </div>

      {inGame && (
        <div className="progress" aria-label={`סבב ${round} מתוך ${settings.rounds}`}>
          <span className="progress__label">
            סבב <b>{round}</b>/{settings.rounds}
          </span>
          <span className="progress__dots" aria-hidden>
            {Array.from({ length: totalTurns }, (_, i) => (
              <span
                key={i}
                className="progress__dot"
                data-state={i + 1 < turnNo ? 'done' : i + 1 === turnNo ? 'now' : 'todo'}
                style={vars({ '--c': teams[i % teams.length]?.color })}
              />
            ))}
          </span>
        </div>
      )}

      <div className="header__actions">
        <button
          className="icon-btn"
          onClick={() => dispatch({ type: 'updateSettings', patch: { sound: !settings.sound } })}
          aria-label={settings.sound ? 'השתקה' : 'ביטול השתקה'}
          title={settings.sound ? 'השתקה' : 'ביטול השתקה'}
        >
          {settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        {(inGame || room.open) && (
          <button
            className="icon-btn icon-btn--text"
            data-live={phoneLive}
            onClick={() => {
              if (!room.open) openRoom();
              setShowJoin(true);
            }}
            aria-label="שליטה מהטלפון"
            title="שליטה מהטלפון"
          >
            <Smartphone size={16} />
            {room.code ? <span dir="ltr">{room.code}</span> : <span>טלפון</span>}
          </button>
        )}
        {fullscreen.supported && (
          <button className="icon-btn" onClick={fullscreen.toggle} aria-label="מסך מלא" title="מסך מלא">
            {fullscreen.on ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        )}
        {inGame && (
          <button
            className="icon-btn icon-btn--text"
            data-armed={confirmEnd}
            onClick={() => (confirmEnd ? dispatch({ type: 'endGame' }) : setConfirmEnd(true))}
          >
            <Flag size={16} />
            <span>{confirmEnd ? 'הקישו לאישור' : 'סיום משחק'}</span>
          </button>
        )}
      </div>
      <AnimatePresence>
        {showJoin && room.open && (
          <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowJoin(false)}>
            <motion.div
              className="modal__card"
              role="dialog"
              aria-label="שליטה מהטלפון"
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="panel__head">
                <h2 className="panel__title">שליטה מהטלפון</h2>
                <button className="icon-btn" onClick={() => setShowJoin(false)} aria-label="סגירה">
                  <X size={18} />
                </button>
              </div>
              <JoinPanel />
              <button
                className="link-btn"
                onClick={() => {
                  closeRoom();
                  setShowJoin(false);
                }}
              >
                חזרה לשליטה מהמסך
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
