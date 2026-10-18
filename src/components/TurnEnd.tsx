import { motion } from 'motion/react';
import { ArrowRight, Check, Trophy, X } from 'lucide-react';
import { CARD_URLS, cardLabel } from '../game/cards';
import { isFinalTurn, standings, turnPoints } from '../game/reducer';
import { useHotkeys } from '../hooks/useHotkeys';
import { Kbd, vars } from './ui';
import type { ScreenProps } from './types';

export default function TurnEnd({ state, dispatch }: ScreenProps) {
  const { teams, teamIndex, turn } = state;
  const team = teams[teamIndex];
  const final = isFinalTurn(state);
  const next = teams[(teamIndex + 1) % teams.length];
  const points = turnPoints(turn);
  const rows = standings(teams);
  const top = Math.max(1, ...teams.map((t) => t.score));

  const proceed = () => dispatch({ type: 'nextTurn' });
  useHotkeys({ Enter: proceed, Space: proceed });

  if (!team) return null;

  return (
    <section className="summary" style={vars({ '--c': team.color })}>
      <header className="summary__head">
        <motion.p
          className="times-up"
          initial={{ scale: 1.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: -3 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        >
          Time's up!
        </motion.p>
        <h1 className="summary__title">
          <span className="summary__team">{team.name}</span> scored{' '}
          <span className="summary__points">{points > 0 ? `+${points}` : points}</span>
        </h1>
      </header>

      <div className="summary__body">
        <div className="panel summary__cards">
          <div className="panel__head">
            <h2 className="panel__title">This turn</h2>
            {turn.length > 0 && <span className="panel__hint">Tap a card to fix a call</span>}
          </div>
          {turn.length === 0 ? (
            <p className="empty">No cards this turn. Tough crowd.</p>
          ) : (
            <ul className="thumbs">
              {turn.map((entry, i) => (
                <motion.li
                  key={`${entry.card}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                >
                  <button
                    className="thumb"
                    data-result={entry.result}
                    onClick={() => dispatch({ type: 'toggleEntry', index: i })}
                    aria-label={`${cardLabel(entry.card)}: ${entry.result === 'got' ? 'guessed' : 'skipped'}. Tap to change.`}
                  >
                    <img src={CARD_URLS[entry.card]} alt="" loading="lazy" />
                    <span className="thumb__word" lang="he" dir="rtl">{cardLabel(entry.card)}</span>
                    <span className="thumb__badge">{entry.result === 'got' ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel summary__standings">
          <div className="panel__head">
            <h2 className="panel__title">Standings</h2>
          </div>
          <ol className="bars">
            {rows.map(({ team: t, rank }) => (
              <motion.li key={t.id} layout className="bar" style={vars({ '--c': t.color })} data-active={t.id === team.id}>
                <span className="bar__rank">{rank}</span>
                <span className="bar__name">{t.name}</span>
                <span className="bar__track">
                  <motion.span
                    className="bar__fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(Math.max(0, t.score) / top) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
                <span className="bar__score">{t.score}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>

      <div className="summary__foot">
        {final ? (
          <button className="cta" onClick={proceed}>
            <Trophy size={20} /> See final results
          </button>
        ) : (
          <button className="cta cta--next" style={vars({ '--c': next?.color })} onClick={proceed}>
            Next up: {next?.name} <ArrowRight size={20} />
          </button>
        )}
        <p className="hint-line">
          or press <Kbd>Enter</Kbd>
        </p>
      </div>
    </section>
  );
}
