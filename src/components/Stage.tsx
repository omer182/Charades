import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import { Check, Pause, Play, Undo2, X } from 'lucide-react';
import { CARD_URLS, cardLabel } from '../game/cards';
import { currentCard, turnPoints } from '../game/reducer';
import { sound, vibrate } from '../game/sound';
import type { CardResult } from '../game/types';
import { useHotkeys } from '../hooks/useHotkeys';
import { useRemaining } from '../hooks/useRemaining';
import Scoreboard from './Scoreboard';
import TimerRing from './TimerRing';
import { Kbd } from './ui';
import type { ScreenProps } from './types';

/** Which way the outgoing card flies and the incoming one arrives from. */
interface Motion {
  exit: -1 | 0 | 1;
  enter: -1 | 0 | 1;
}

const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 600;

const cardVariants = {
  initial: ({ enter }: Motion) =>
    enter ? { x: enter * 520, rotate: enter * 18, opacity: 0 } : { y: 40, scale: 0.92, opacity: 0 },
  animate: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  exit: ({ exit }: Motion) =>
    exit ? { x: exit * 620, rotate: exit * 22, opacity: 0 } : { scale: 0.9, opacity: 0 },
};

function Card({ name, onSwipe, disabled }: { name: string; onSwipe: (r: CardResult) => void; disabled: boolean }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-14, 14]);
  const gotOpacity = useTransform(x, [30, SWIPE_DISTANCE], [0, 1]);
  const skipOpacity = useTransform(x, [-SWIPE_DISTANCE, -30], [1, 0]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) onSwipe('got');
    else if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) onSwipe('skip');
  };

  return (
    <motion.div
      className="card"
      style={{ x, rotate }}
      drag={disabled ? false : 'x'}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
    >
      <p className="card__word" lang="he" dir="rtl">{cardLabel(name)}</p>
      <div className="card__photo">
        <img src={CARD_URLS[name]} alt="" className="card__blur" draggable={false} aria-hidden />
        <img src={CARD_URLS[name]} alt={cardLabel(name)} className="card__img" draggable={false} />
      </div>
      <motion.span className="stamp stamp--got" style={{ opacity: gotOpacity }}>Got it</motion.span>
      <motion.span className="stamp stamp--skip" style={{ opacity: skipOpacity }}>Skip</motion.span>
    </motion.div>
  );
}

export default function Stage({ state, dispatch }: ScreenProps) {
  const { teams, teamIndex, settings, turn, timer, deck, cursor } = state;
  const team = teams[teamIndex];
  const card = currentCard(state);
  const paused = timer.endsAt === null;
  const remaining = useRemaining(timer);
  const [dir, setDir] = useState<Motion>({ exit: 0, enter: 0 });
  const [pops, setPops] = useState<{ id: number; result: CardResult }[]>([]);
  const popId = useRef(0);

  // Buzzer when the clock runs out.
  useEffect(() => {
    if (!paused && remaining <= 0) {
      sound.buzzer();
      vibrate([200, 80, 200]);
      dispatch({ type: 'timeUp' });
    }
  }, [paused, remaining, dispatch]);

  // Tick each of the last ten seconds.
  const seconds = Math.ceil(remaining / 1000);
  useEffect(() => {
    if (!paused && seconds > 0 && seconds <= 10) sound.tick(seconds <= 5);
  }, [seconds, paused]);

  // Preload the next couple of cards.
  useEffect(() => {
    for (let i = 1; i <= 2; i++) {
      const next = deck[(cursor + i) % deck.length];
      if (next) new Image().src = CARD_URLS[next];
    }
  }, [deck, cursor]);

  const mark = (result: CardResult) => {
    if (paused) return;
    setDir({ exit: result === 'got' ? 1 : -1, enter: 0 });
    const id = ++popId.current;
    setPops((p) => [...p, { id, result }]);
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 900);
    if (result === 'got') {
      sound.correct();
      vibrate(30);
    } else {
      sound.skip();
      vibrate([15, 40, 15]);
    }
    dispatch({ type: 'mark', result });
  };

  const undo = () => {
    const last = turn[turn.length - 1];
    if (!last || paused) return;
    setDir({ exit: 0, enter: last.result === 'got' ? 1 : -1 });
    sound.undo();
    dispatch({ type: 'undo' });
  };

  const togglePause = () => dispatch({ type: paused ? 'resume' : 'pause', now: Date.now() });

  useHotkeys({
    ArrowRight: () => mark('got'),
    Space: () => mark('got'),
    Enter: () => mark('got'),
    ArrowLeft: () => mark('skip'),
    KeyS: () => mark('skip'),
    KeyZ: undo,
    Backspace: undo,
    KeyP: togglePause,
    Escape: () => !paused && togglePause(),
  });

  if (!team) return null;
  const points = turnPoints(turn);
  const got = turn.filter((e) => e.result === 'got').length;

  return (
    <section className="stage">
      <Scoreboard state={state} dispatch={dispatch} />

      <div className="stage__main">
        <div className="stage__bar">
          <div className="now-playing">
            <span className="now-playing__label">Now acting</span>
            <span className="now-playing__team">{team.name}</span>
          </div>
          <TimerRing remainingMs={remaining} totalMs={settings.turnSeconds * 1000} paused={paused} />
          <div className="turn-score">
            <span className="turn-score__label">This turn</span>
            <motion.span key={points} className="turn-score__value" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {points > 0 ? `+${points}` : points}
            </motion.span>
            <span className="turn-score__sub">{got} guessed</span>
          </div>
        </div>

        <div className="card-zone" data-urgent={!paused && seconds <= 5}>
          <AnimatePresence custom={dir} initial={false} mode="popLayout">
            {card && (
              <motion.div
                key={`${cursor}-${card}`}
                className="card-slot"
                custom={dir}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              >
                <Card name={card} onSwipe={mark} disabled={paused} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {pops.map((p) => (
              <motion.span
                key={p.id}
                className="pop"
                data-result={p.result}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 0], y: -90, scale: 1.1 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
              >
                {p.result === 'got' ? '+1' : settings.skipPenalty ? '−1' : 'skip'}
              </motion.span>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {paused && (
              <motion.div className="paused" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="paused__title">Paused</p>
                <button className="cta cta--team" onClick={togglePause}>
                  <Play size={20} fill="currentColor" /> Resume
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="actions">
          <button className="act act--small" onClick={undo} disabled={turn.length === 0 || paused} aria-label="Undo last card" title="Undo (Z)">
            <Undo2 size={22} />
          </button>
          <button className="act act--skip" onClick={() => mark('skip')} disabled={paused} aria-label="Skip card">
            <X size={30} strokeWidth={2.6} />
            <span>Skip</span>
          </button>
          <button className="act act--got" onClick={() => mark('got')} disabled={paused} aria-label="Got it">
            <Check size={30} strokeWidth={2.8} />
            <span>Got it</span>
          </button>
          <button className="act act--small" onClick={togglePause} aria-label={paused ? 'Resume' : 'Pause'} title="Pause (P)">
            {paused ? <Play size={22} /> : <Pause size={22} />}
          </button>
        </div>
        <p className="hint-line hint-line--stage">
          <Kbd>←</Kbd> skip · <Kbd>→</Kbd> got it · <Kbd>Z</Kbd> undo · <Kbd>P</Kbd> pause · or swipe
        </p>
      </div>
    </section>
  );
}
