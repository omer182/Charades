import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import { Play, Smartphone, Star } from 'lucide-react';
import { CARDS, CATEGORY, cardLabel } from '../game/cards';
import { currentCard, isGolden, turnPoints } from '../game/reducer';
import { sound, vibrate } from '../game/sound';
import type { CardResult, TurnEntry } from '../game/types';
import { useHotkeys } from '../hooks/useHotkeys';
import { useRemaining } from '../hooks/useRemaining';
import { usePhoneInControl } from '../net/RoomContext';
import ActionBar from './ActionBar';
import Scoreboard from './Scoreboard';
import TimerRing from './TimerRing';
import CategoryIcon from './CategoryIcon';
import { Kbd, vars } from './ui';
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

function Card({ name, golden, onSwipe, disabled }: { name: string; golden: boolean; onSwipe: (r: CardResult) => void; disabled: boolean }) {
  const card = CARDS[name];
  const category = CATEGORY[card.category];
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
      data-kind={card.image ? 'photo' : 'word'}
      data-golden={golden}
      style={{ x, rotate, ...vars({ '--cat': category.color }) }}
      drag={disabled ? false : 'x'}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
    >
      {golden && (
        <p className="card__ribbon">
          <Star size="1em" fill="currentColor" /> קלף זהב · ניחוש נכון = <bdi dir="ltr">+2</bdi>{' '}
          <Star size="1em" fill="currentColor" />
        </p>
      )}
      {card.image ? (
        <>
          <p className="card__word">{cardLabel(name)}</p>
          <div className="card__photo">
            <img src={card.image} alt="" className="card__blur" draggable={false} aria-hidden />
            <img src={card.image} alt={cardLabel(name)} className="card__img" draggable={false} />
          </div>
        </>
      ) : (
        <>
          <p className="card__word card__word--cat">
            <CategoryIcon id={card.category} /> {category.label}
          </p>
          <div className="card__text">
            <p className="card__big">{cardLabel(name)}</p>
          </div>
        </>
      )}
      <motion.span className="stamp stamp--got" style={{ opacity: gotOpacity }}>ניחשו!</motion.span>
      <motion.span className="stamp stamp--skip" style={{ opacity: skipOpacity }}>דילוג</motion.span>
    </motion.div>
  );
}

/** What the last change to the turn was, so the card flies the right way and a score pops. */
interface Track {
  turn: TurnEntry[];
  dir: Motion;
  pops: { id: number; result: CardResult; golden: boolean }[];
  nextPop: number;
}

export default function Stage({ state, dispatch }: ScreenProps) {
  const { teams, teamIndex, settings, turn, timer, deck, cursor } = state;
  const team = teams[teamIndex];
  const card = currentCard(state);
  const golden = card !== undefined && isGolden(state, card);
  const paused = timer.endsAt === null;
  const remaining = useRemaining(timer);
  const phoneInControl = usePhoneInControl();

  // Taps may come from this screen or a phone, so animation and sound follow the state, not the click.
  // Adjusting state while rendering is React's pattern for reacting to a prop change.
  const [track, setTrack] = useState<Track>({ turn, dir: { exit: 0, enter: 0 }, pops: [], nextPop: 0 });
  if (track.turn !== turn) {
    if (turn.length > track.turn.length) {
      const entry = turn[turn.length - 1];
      setTrack({
        turn,
        dir: { exit: entry.result === 'got' ? 1 : -1, enter: 0 },
        pops: [...track.pops, { id: track.nextPop, result: entry.result, golden: Boolean(entry.golden) }],
        nextPop: track.nextPop + 1,
      });
    } else if (turn.length < track.turn.length) {
      const undone = track.turn[track.turn.length - 1];
      setTrack({ ...track, turn, dir: { exit: 0, enter: undone.result === 'got' ? 1 : -1 } });
    } else {
      setTrack({ ...track, turn });
    }
  }

  // Sounds and buzz for each new call or undo.
  const heard = useRef(turn);
  useEffect(() => {
    const before = heard.current;
    heard.current = turn;
    if (turn.length > before.length) {
      const entry = turn[turn.length - 1];
      if (entry.result === 'got') {
        if (entry.golden) sound.golden();
        else sound.correct();
        vibrate(30);
      } else {
        sound.skip();
        vibrate([15, 40, 15]);
      }
    } else if (turn.length < before.length) {
      sound.undo();
    }
  }, [turn]);

  // Each score pop fades out on its own.
  const lastPop = track.pops.at(-1)?.id;
  useEffect(() => {
    if (lastPop === undefined) return;
    const id = setTimeout(() => setTrack((t) => ({ ...t, pops: t.pops.filter((p) => p.id !== lastPop) })), 900);
    return () => clearTimeout(id);
  }, [lastPop]);

  // Buzzer when the clock runs out.
  useEffect(() => {
    if (!paused && remaining <= 0) {
      sound.buzzer();
      vibrate([200, 80, 200]);
      dispatch({ type: 'timeUp' });
    }
  }, [paused, remaining, dispatch]);

  // Announce a golden card the moment it comes up (and again on resume).
  useEffect(() => {
    if (golden && !paused) sound.goldenReveal();
  }, [golden, paused, cursor]);

  // Tick each of the last ten seconds.
  const seconds = Math.ceil(remaining / 1000);
  useEffect(() => {
    if (!paused && seconds > 0 && seconds <= 10) sound.tick(seconds <= 5);
  }, [seconds, paused]);

  // Preload the next couple of cards.
  useEffect(() => {
    for (let i = 1; i <= 2; i++) {
      const image = CARDS[deck[(cursor + i) % deck.length]]?.image;
      if (image) new Image().src = image;
    }
  }, [deck, cursor]);

  const mark = (result: CardResult) => {
    if (!paused) dispatch({ type: 'mark', result });
  };
  const undo = () => {
    if (turn.length > 0 && !paused) dispatch({ type: 'undo' });
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
  const { dir, pops } = track;

  return (
    <section className="stage">
      <Scoreboard state={state} dispatch={dispatch} />

      <div className="stage__main">
        <div className="stage__bar">
          <div className="now-playing">
            <span className="now-playing__label">מציגים עכשיו</span>
            <span className="now-playing__team">{team.name}</span>
          </div>
          <TimerRing remainingMs={remaining} totalMs={settings.turnSeconds * 1000} paused={paused} />
          <div className="turn-score">
            <span className="turn-score__label">בתור הזה</span>
            <motion.span key={points} className="turn-score__value" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <bdi dir="ltr">{points > 0 ? `+${points}` : points}</bdi>
            </motion.span>
            <span className="turn-score__sub">{got} ניחושים</span>
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
                <Card name={card} golden={golden} onSwipe={mark} disabled={paused} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {pops.map((p) => (
              <motion.span
                key={p.id}
                className="pop"
                data-result={p.result}
                data-golden={p.golden}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 0], y: -90, scale: 1.1 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
              >
                <bdi dir="ltr">{p.result === 'got' ? (p.golden ? '+2' : '+1') : settings.skipPenalty ? '−1' : 'דילוג'}</bdi>
              </motion.span>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {paused && (
              <motion.div className="paused" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="paused__title">בהשהיה</p>
                <button className="cta cta--team" onClick={togglePause}>
                  <Play size={20} fill="currentColor" /> המשך
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {phoneInControl ? (
          <p className="phone-in-control">
            <Smartphone size={18} /> השופט מנהל את התור מהטלפון
          </p>
        ) : (
          <>
            <ActionBar golden={golden} paused={paused} canUndo={turn.length > 0} onMark={mark} onUndo={undo} onTogglePause={togglePause} />
            <p className="hint-line hint-line--stage">
              <Kbd>→</Kbd> ניחשו · <Kbd>←</Kbd> דילוג · <Kbd>Z</Kbd> ביטול · <Kbd>P</Kbd> השהיה · או החליקו
            </p>
          </>
        )}
      </div>
    </section>
  );
}
