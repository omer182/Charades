import { motion } from 'motion/react';
import { ArrowLeft, Check, Star, Trophy, X } from 'lucide-react';
import { CARDS, CATEGORY, cardLabel } from '../game/cards';
import CategoryIcon from './CategoryIcon';
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
  const goldenCount = turn.filter((e) => e.golden).length;
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
          נגמר הזמן!
        </motion.p>
        <h1 className="summary__title">
          <span className="summary__team">{team.name}</span> צברו{' '}
          <bdi dir="ltr" className="summary__points">{points > 0 ? `+${points}` : points}</bdi>
        </h1>
      </header>

      <div className="summary__body">
        <div className="panel summary__cards">
          <div className="panel__head">
            <h2 className="panel__title">בתור הזה</h2>
            {goldenCount > 0 && (
              <span className="gold-tag">
                <Star size={13} fill="currentColor" /> {goldenCount === 1 ? 'קלף זהב אחד' : `${goldenCount} קלפי זהב`}
              </span>
            )}
            {turn.length > 0 && <span className="panel__hint">טעיתם? הקישו על קלף כדי לתקן</span>}
          </div>
          {turn.length === 0 ? (
            <p className="empty">אף קלף בתור הזה. קהל קשוח.</p>
          ) : (
            <ul className="thumbs">
              {turn.map((entry, i) => {
                const card = CARDS[entry.card];
                return (
                <motion.li
                  key={`${entry.card}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                >
                  <button
                    className="thumb"
                    data-result={entry.result}
                    data-golden={Boolean(entry.golden)}
                    style={vars({ '--cat': card ? CATEGORY[card.category].color : undefined })}
                    onClick={() => dispatch({ type: 'toggleEntry', index: i })}
                    aria-label={`${cardLabel(entry.card)}: ${entry.result === 'got' ? 'ניחשו' : 'דילגו'}. הקישו כדי לשנות.`}
                  >
                    {card?.image ? (
                      <img src={card.image} alt="" loading="lazy" />
                    ) : (
                      <span className="thumb__text">{card && <CategoryIcon id={card.category} size={26} />}</span>
                    )}
                    <span className="thumb__word">{cardLabel(entry.card)}</span>
                    {entry.golden && (
                      <span className="thumb__golden">
                        <Star size={12} fill="currentColor" />
                        {entry.result === 'got' ? <bdi dir="ltr">+2</bdi> : 'זהב'}
                      </span>
                    )}
                    <span className="thumb__badge">{entry.result === 'got' ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}</span>
                  </button>
                </motion.li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="panel summary__standings">
          <div className="panel__head">
            <h2 className="panel__title">טבלה</h2>
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
            <Trophy size={20} /> לתוצאות הסופיות
          </button>
        ) : (
          <button className="cta cta--next" style={vars({ '--c': next?.color })} onClick={proceed}>
            הבאים בתור: {next?.name} <ArrowLeft size={20} />
          </button>
        )}
        <p className="hint-line">
          או לחצו <Kbd>Enter</Kbd>
        </p>
      </div>
    </section>
  );
}
