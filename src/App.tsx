import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useGame } from './hooks/useGame';
import { RoomContext } from './net/RoomContext';
import { useWakeLock } from './hooks/useWakeLock';
import { standings } from './game/reducer';
import { sound } from './game/sound';
import Header from './components/Header';
import Lobby from './components/Lobby';
import GetReady from './components/GetReady';
import Stage from './components/Stage';
import TurnEnd from './components/TurnEnd';
import GameOver from './components/GameOver';

const HOUSE_COLOR = '#ffd23f';

export default function App() {
  const { state, dispatch, room, openRoom, closeRoom } = useGame();
  const { phase, teams, teamIndex, settings } = state;

  const accent =
    phase === 'lobby'
      ? HOUSE_COLOR
      : phase === 'gameOver'
        ? (standings(teams)[0]?.team.color ?? HOUSE_COLOR)
        : (teams[teamIndex]?.color ?? HOUSE_COLOR);

  useEffect(() => {
    document.documentElement.style.setProperty('--team', accent);
  }, [accent]);

  useEffect(() => sound.setEnabled(settings.sound), [settings.sound]);

  useEffect(() => {
    const unlock = () => sound.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useWakeLock(phase === 'ready' || phase === 'playing' || phase === 'turnEnd');

  const screen = {
    lobby: <Lobby state={state} dispatch={dispatch} />,
    ready: <GetReady state={state} dispatch={dispatch} />,
    playing: <Stage state={state} dispatch={dispatch} />,
    turnEnd: <TurnEnd state={state} dispatch={dispatch} />,
    gameOver: <GameOver state={state} dispatch={dispatch} />,
  }[phase];

  return (
    <RoomContext.Provider value={{ room, openRoom, closeRoom }}>
      <div className="app" data-phase={phase}>
        <div className="backdrop" aria-hidden />
        <Header state={state} dispatch={dispatch} />
        <main className="main">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={phase}
              className="screen"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {screen}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </RoomContext.Provider>
  );
}
