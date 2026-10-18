import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Play } from 'lucide-react';
import { currentCard, standings } from '../game/reducer';
import { CARDS } from '../game/cards';
import { sound, vibrate } from '../game/sound';
import { useHotkeys } from '../hooks/useHotkeys';
import { Kbd, vars } from './ui';
import type { ScreenProps } from './types';

const STEPS = ['3', '2', '1', 'יאללה!'];

export default function GetReady({ state, dispatch }: ScreenProps) {
  const { teams, teamIndex, round, settings } = state;
  const team = teams[teamIndex];
  const [step, setStep] = useState<number | null>(null);

  // Warm the cache so the first card is on screen the instant the clock starts.
  const firstImage = CARDS[currentCard(state) ?? '']?.image;
  useEffect(() => {
    if (firstImage) new Image().src = firstImage;
  }, [firstImage]);

  useEffect(() => {
    if (step === null) return;
    sound.count(step === STEPS.length - 1);
    vibrate(step === STEPS.length - 1 ? 60 : 20);
    const id = setTimeout(
      () => (step === STEPS.length - 1 ? dispatch({ type: 'beginTurn', now: Date.now() }) : setStep(step + 1)),
      step === STEPS.length - 1 ? 450 : 700,
    );
    return () => clearTimeout(id);
  }, [step, dispatch]);

  const go = () => step === null && setStep(0);
  useHotkeys({ Space: go, Enter: go });

  if (!team) return null;

  return (
    <section className="ready" style={vars({ '--c': team.color })}>
      <p className="eyebrow">
        סבב {round} מתוך {settings.rounds}
        {round === settings.rounds && <span className="tag tag--hot">סבב אחרון</span>}
      </p>
      <p className="ready__label">הבאים בתור</p>
      <h1 className="ready__team">{team.name}</h1>
      <p className="lede">המציג/ה לוקח/ת את המכשיר. כל השאר — עיניים מהמסך!</p>

      <button className="cta cta--team" onClick={go} disabled={step !== null}>
        <Play size={20} fill="currentColor" /> מוכנים
      </button>
      <p className="hint-line">
        או לחצו <Kbd>Space</Kbd>
      </p>

      {teams.length > 1 && (
        <ol className="mini-standings" aria-label="טבלה">
          {standings(teams).map(({ team: t, rank }) => (
            <li key={t.id} className="mini-standings__item" data-active={t.id === team.id} style={vars({ '--c': t.color })}>
              <span className="mini-standings__rank">{rank}</span>
              <span className="mini-standings__name">{t.name}</span>
              <span className="mini-standings__score">{t.score}</span>
            </li>
          ))}
        </ol>
      )}

      <AnimatePresence>
        {step !== null && (
          <motion.div className="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={step}
                className="countdown__num"
                data-go={step === STEPS.length - 1}
                initial={{ scale: 2.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                {STEPS[step]}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
