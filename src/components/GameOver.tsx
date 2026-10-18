import { useState } from 'react';
import { motion } from 'motion/react';
import { Crown, RotateCcw, Users } from 'lucide-react';
import { standings, TEAM_COLORS } from '../game/reducer';
import Confetti from './Confetti';
import { vars } from './ui';
import type { ScreenProps } from './types';

const PODIUM_ORDER = [1, 0, 2]; // silver, gold, bronze — left to right

export default function GameOver({ state, dispatch }: ScreenProps) {
  const rows = standings(state.teams);
  const leaders = rows.filter((r) => r.isLeader);
  const tie = leaders.length > 1;
  const [colors] = useState(() => [...leaders.map((l) => l.team.color), '#ffffff', ...TEAM_COLORS]);
  const podium = PODIUM_ORDER.map((i) => rows[i]).filter(Boolean);
  const rest = rows.slice(3);

  return (
    <section className="finale">
      <Confetti colors={colors} />

      <motion.div
        className="finale__crown"
        initial={{ y: -30, opacity: 0, rotate: -20 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
      >
        <Crown size={44} strokeWidth={2.2} />
      </motion.div>
      <p className="eyebrow">{tie ? "It's a tie!" : 'And the winner is'}</p>
      <motion.h1
        className="finale__winner"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
      >
        {leaders.map((l, i) => (
          <span key={l.team.id} style={{ color: l.team.color }}>
            {i > 0 && <span className="finale__amp"> & </span>}
            {l.team.name}
          </span>
        ))}
      </motion.h1>

      <div className="podium">
        {podium.map(({ team, rank }, i) => (
          <div key={team.id} className="podium__col" style={vars({ '--c': team.color })} data-rank={rank}>
            <span className="podium__name">{team.name}</span>
            <span className="podium__score">{team.score} pts</span>
            <motion.div
              className="podium__block"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.5 + i * 0.15, type: 'spring', stiffness: 120, damping: 16 }}
            >
              <span className="podium__rank">{rank}</span>
            </motion.div>
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <ol className="rest">
          {rest.map(({ team, rank }) => (
            <li key={team.id} style={vars({ '--c': team.color })}>
              <span className="rest__rank">{rank}</span>
              <span className="rest__name">{team.name}</span>
              <span className="rest__score">{team.score}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="finale__actions">
        <button className="cta" onClick={() => dispatch({ type: 'playAgain' })}>
          <RotateCcw size={20} /> Rematch
        </button>
        <button className="ghost-btn" onClick={() => dispatch({ type: 'reset' })}>
          <Users size={18} /> New teams
        </button>
      </div>
    </section>
  );
}
