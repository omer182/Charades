import { useEffect, useState } from 'react';
import { Flag, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
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
        <span className="brand__name">charades</span>
      </div>

      {inGame && (
        <div className="progress" aria-label={`Round ${round} of ${settings.rounds}`}>
          <span className="progress__label">
            Round <b>{round}</b>/{settings.rounds}
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
          aria-label={settings.sound ? 'Mute sounds' : 'Unmute sounds'}
          title={settings.sound ? 'Mute' : 'Unmute'}
        >
          {settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        {fullscreen.supported && (
          <button className="icon-btn" onClick={fullscreen.toggle} aria-label="Toggle fullscreen" title="Fullscreen">
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
            <span>{confirmEnd ? 'Tap to confirm' : 'End game'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
