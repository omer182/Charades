import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Plus, Sparkles, Trash2 } from 'lucide-react';
import { CARDS, CATEGORIES, countIn, idsIn, newDeck, PHOTO_IDS } from '../game/cards';
import { forgetPlayed, loadPlayed } from '../game/played';
import { shuffle } from '../game/deck';
import { ALL_CATEGORIES, MAX_TEAMS } from '../game/reducer';
import type { CategoryId } from '../game/types';
import { useHotkeys } from '../hooks/useHotkeys';
import { Field, Kbd, Segmented, Stepper, Switch, vars } from './ui';
import type { ScreenProps } from './types';

const TURN_LENGTHS = [30, 45, 60, 90, 120] as const;
const SAMPLE_TEAMS = ['אריות', 'ינשופים', 'כרישים', 'שועלים'];

const formatSeconds = (s: number) =>
  s < 60 ? `${s} שנ׳` : s % 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : s === 60 ? 'דקה' : `${s / 60} דק׳`;

export default function Lobby({ state, dispatch }: ScreenProps) {
  const { teams, settings } = state;
  const [name, setName] = useState('');
  const [fan] = useState(() => shuffle(PHOTO_IDS).slice(0, 3));
  const { categories } = settings;
  const cardCount = categories.reduce((n, c) => n + countIn(c), 0);
  const canStart = teams.length > 0 && cardCount > 0;
  const [played, setPlayed] = useState(loadPlayed);
  const freshCount = idsIn(categories).filter((id) => !played.has(id)).length;
  const resetPlayed = () => {
    forgetPlayed();
    setPlayed(new Set());
  };

  const toggleCategory = (id: CategoryId) => {
    const next = categories.includes(id) ? categories.filter((c) => c !== id) : ALL_CATEGORIES.filter((c) => c === id || categories.includes(c));
    dispatch({ type: 'updateSettings', patch: { categories: next } });
  };
  const allOn = categories.length === ALL_CATEGORIES.length;

  const add = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'addTeam', name });
    setName('');
  };

  const start = () => canStart && dispatch({ type: 'startGame', ...newDeck(categories) });
  useHotkeys({ Enter: start }, canStart);

  return (
    <section className="lobby">
      <div className="lobby__hero">
        <div className="fan" aria-hidden>
          {fan.map((card, i) => (
            <motion.img
              key={card}
              src={CARDS[card].image}
              alt=""
              className="fan__card"
              style={vars({ '--i': i - 1 })}
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: (i - 1) * 9 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 160, damping: 18 }}
            />
          ))}
        </div>
        <p className="eyebrow">
          <Sparkles size={14} /> ערב משחקים · {Object.keys(CARDS).length} קלפים
        </p>
        <h1 className="hero-title">
          בלי <span className="hero-title__pop">מילים...</span>
        </h1>
        <p className="lede">
          שחקן אחד מציג את הקלף בלי לדבר, והקבוצה שלו צועקת ניחושים. כמה שיותר קלפים לפני הצלצול — ואז
          התור עובר לקבוצה הבאה.
        </p>
      </div>

      <div className="lobby__panel">
        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title">קבוצות</h2>
            <span className="panel__count">
              {teams.length}/{MAX_TEAMS}
            </span>
          </div>

          <ul className="team-list">
            <AnimatePresence initial={false}>
              {teams.map((team) => (
                <motion.li
                  key={team.id}
                  layout
                  className="team-row"
                  style={vars({ '--c': team.color })}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    type="button"
                    className="team-row__swatch"
                    onClick={() => dispatch({ type: 'cycleColor', id: team.id })}
                    aria-label={`החלפת הצבע של ${team.name}`}
                    title="החלפת צבע"
                  />
                  <input
                    className="team-row__name"
                    defaultValue={team.name}
                    aria-label="שם הקבוצה"
                    maxLength={24}
                    onBlur={(e) => dispatch({ type: 'renameTeam', id: team.id, name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  />
                  <button
                    type="button"
                    className="team-row__remove"
                    onClick={() => dispatch({ type: 'removeTeam', id: team.id })}
                    aria-label={`הסרת ${team.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {teams.length < MAX_TEAMS && (
            <form className="add-team" onSubmit={add}>
              <input
                className="add-team__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={teams.length === 0 ? 'שם הקבוצה הראשונה…' : 'עוד קבוצה…'}
                aria-label="שם קבוצה חדשה"
                maxLength={24}
                autoFocus
              />
              <button className="add-team__btn" type="submit" disabled={!name.trim()} aria-label="הוספת קבוצה">
                <Plus size={18} />
              </button>
            </form>
          )}

          {teams.length === 0 && (
            <button
              type="button"
              className="link-btn"
              onClick={() => SAMPLE_TEAMS.slice(0, 2).forEach((n) => dispatch({ type: 'addTeam', name: n }))}
            >
              או פשוט תנו לי שתי קבוצות
            </button>
          )}
        </div>

        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title">קטגוריות</h2>
            <button
              type="button"
              className="panel__action"
              onClick={() => dispatch({ type: 'updateSettings', patch: { categories: allOn ? [] : ALL_CATEGORIES } })}
            >
              {allOn ? 'נקה הכול' : 'בחר הכול'}
            </button>
          </div>
          <div className="chips" role="group" aria-label="קטגוריות">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="chip"
                aria-pressed={categories.includes(c.id)}
                style={vars({ '--c': c.color })}
                onClick={() => toggleCategory(c.id)}
              >
                {c.label}
                <span className="chip__count">{countIn(c.id)}</span>
              </button>
            ))}
          </div>
          <p className="panel__note">
            {cardCount} קלפים במשחק · <span className="gold-text">קלפי זהב</span> שווים פי 2
          </p>
          {played.size > 0 && cardCount > 0 && (
            <p className="panel__note">
              {freshCount === 0
                ? 'שיחקתם כבר בכל הקלפים האלה — המשחק הבא יתחיל אותם מחדש.'
                : freshCount === cardCount
                  ? 'כל הקלפים האלה עוד לא הופיעו.'
                  : `${freshCount} מהם עוד לא הופיעו, והם יגיעו ראשונים.`}{' '}
              <button type="button" className="inline-link" onClick={resetPlayed}>
                איפוס
              </button>
            </p>
          )}
        </div>

        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title">חוקים</h2>
          </div>
          <Field label="סבבים" hint="כל קבוצה משחקת פעם אחת בכל סבב">
            <Stepper label="סבבים" value={settings.rounds} min={1} max={10} onChange={(rounds) => dispatch({ type: 'updateSettings', patch: { rounds } })} />
          </Field>
          <Field label="אורך תור">
            <Segmented
              label="אורך תור"
              value={settings.turnSeconds}
              options={TURN_LENGTHS}
              format={formatSeconds}
              onChange={(turnSeconds) => dispatch({ type: 'updateSettings', patch: { turnSeconds } })}
            />
          </Field>
          <Field label="דילוג עולה נקודה" hint={settings.skipPenalty ? 'דילוג = ‎−1' : 'מדלגים בחינם'}>
            <Switch label="קנס על דילוג" checked={settings.skipPenalty} onChange={(skipPenalty) => dispatch({ type: 'updateSettings', patch: { skipPenalty } })} />
          </Field>
        </div>

        <button className="cta" onClick={start} disabled={!canStart}>
          {teams.length === 0 ? 'הוסיפו קבוצה כדי להתחיל' : cardCount === 0 ? 'בחרו לפחות קטגוריה אחת' : 'מתחילים!'}
          <ArrowLeft size={20} />
        </button>
        <p className="hint-line">
          בזמן תור: <Kbd>→</Kbd> ניחשו · <Kbd>←</Kbd> דילוג · <Kbd>Z</Kbd> ביטול · <Kbd>P</Kbd> השהיה — או החליקו את הקלף.
        </p>
      </div>
    </section>
  );
}
