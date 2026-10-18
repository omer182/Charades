import { motion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import type { ScreenProps } from './types';
import { vars } from './ui';

/** Live scores; the active team is lit. ± lets the host fix a miscount at any time. */
export default function Scoreboard({ state, dispatch }: ScreenProps) {
  const { teams, teamIndex } = state;
  return (
    <aside className="scoreboard" aria-label="ניקוד">
      {teams.map((team, i) => (
        <div key={team.id} className="score-row" data-active={i === teamIndex} style={vars({ '--c': team.color })}>
          <span className="score-row__dot" />
          <span className="score-row__name">{team.name}</span>
          <span className="score-row__adjust">
            <button onClick={() => dispatch({ type: 'adjustScore', id: team.id, delta: -1 })} aria-label={`הורדת נקודה ל${team.name}`}>
              <Minus size={12} />
            </button>
            <button onClick={() => dispatch({ type: 'adjustScore', id: team.id, delta: 1 })} aria-label={`נקודה ל${team.name}`}>
              <Plus size={12} />
            </button>
          </span>
          <motion.span
            key={team.score}
            className="score-row__score"
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {team.score}
          </motion.span>
        </div>
      ))}
    </aside>
  );
}
