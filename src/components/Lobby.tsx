import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Plus, Sparkles, Trash2 } from 'lucide-react';
import { CARD_NAMES, CARD_URLS, newDeck } from '../game/cards';
import { shuffle } from '../game/deck';
import { MAX_TEAMS } from '../game/reducer';
import { useHotkeys } from '../hooks/useHotkeys';
import { Field, Kbd, Segmented, Stepper, Switch, vars } from './ui';
import type { ScreenProps } from './types';

const TURN_LENGTHS = [30, 45, 60, 90, 120] as const;
const SAMPLE_TEAMS = ['Lions', 'Owls', 'Sharks', 'Foxes'];

const formatSeconds = (s: number) => (s < 60 ? `${s}s` : s % 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s / 60} min`);

export default function Lobby({ state, dispatch }: ScreenProps) {
  const { teams, settings } = state;
  const [name, setName] = useState('');
  const [fan] = useState(() => shuffle(CARD_NAMES).slice(0, 3));
  const canStart = teams.length > 0 && CARD_NAMES.length > 0;

  const add = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'addTeam', name });
    setName('');
  };

  const start = () => canStart && dispatch({ type: 'startGame', deck: newDeck() });
  useHotkeys({ Enter: start }, canStart);

  return (
    <section className="lobby">
      <div className="lobby__hero">
        <div className="fan" aria-hidden>
          {fan.map((card, i) => (
            <motion.img
              key={card}
              src={CARD_URLS[card]}
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
          <Sparkles size={14} /> Game night · {CARD_NAMES.length} picture cards
        </p>
        <h1 className="hero-title">
          Act it <span className="hero-title__pop">out.</span>
        </h1>
        <p className="lede">
          One player mimes the card, their team shouts guesses. Score as many as you can before the
          buzzer — then pass the phone to the next team.
        </p>
      </div>

      <div className="lobby__panel">
        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Teams</h2>
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
                    aria-label={`Change ${team.name}'s color`}
                    title="Change color"
                  />
                  <input
                    className="team-row__name"
                    defaultValue={team.name}
                    aria-label="Team name"
                    maxLength={24}
                    onBlur={(e) => dispatch({ type: 'renameTeam', id: team.id, name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  />
                  <button
                    type="button"
                    className="team-row__remove"
                    onClick={() => dispatch({ type: 'removeTeam', id: team.id })}
                    aria-label={`Remove ${team.name}`}
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
                placeholder={teams.length === 0 ? 'Name your first team…' : 'Add another team…'}
                aria-label="New team name"
                maxLength={24}
                autoFocus
              />
              <button className="add-team__btn" type="submit" disabled={!name.trim()} aria-label="Add team">
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
              or just give me two teams
            </button>
          )}
        </div>

        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Rules</h2>
          </div>
          <Field label="Rounds" hint="Every team plays once per round">
            <Stepper label="rounds" value={settings.rounds} min={1} max={10} onChange={(rounds) => dispatch({ type: 'updateSettings', patch: { rounds } })} />
          </Field>
          <Field label="Turn length">
            <Segmented
              label="Turn length"
              value={settings.turnSeconds}
              options={TURN_LENGTHS}
              format={formatSeconds}
              onChange={(turnSeconds) => dispatch({ type: 'updateSettings', patch: { turnSeconds } })}
            />
          </Field>
          <Field label="Skipping costs a point" hint={settings.skipPenalty ? 'Skip = −1' : 'Skip freely'}>
            <Switch label="Skip penalty" checked={settings.skipPenalty} onChange={(skipPenalty) => dispatch({ type: 'updateSettings', patch: { skipPenalty } })} />
          </Field>
        </div>

        <button className="cta" onClick={start} disabled={!canStart}>
          {teams.length === 0 ? 'Add a team to start' : 'Start the game'}
          <ArrowRight size={20} />
        </button>
        <p className="hint-line">
          During a turn: <Kbd>→</Kbd> got it · <Kbd>←</Kbd> skip · <Kbd>Z</Kbd> undo · <Kbd>P</Kbd> pause — or swipe the card.
        </p>
      </div>
    </section>
  );
}
