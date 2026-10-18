const R = 44;
const C = 2 * Math.PI * R;

export default function TimerRing({ remainingMs, totalMs, paused }: { remainingMs: number; totalMs: number; paused: boolean }) {
  const seconds = Math.ceil(remainingMs / 1000);
  const fraction = totalMs > 0 ? remainingMs / totalMs : 0;
  const level = seconds <= 5 ? 'critical' : seconds <= 10 ? 'warn' : 'ok';
  const label = seconds >= 60 ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : String(seconds);

  return (
    <div className="timer" data-level={level} data-paused={paused} role="timer" aria-label={`${seconds} seconds left`}>
      <svg viewBox="0 0 100 100" className="timer__svg" aria-hidden>
        <circle cx="50" cy="50" r={R} className="timer__track" />
        <circle
          cx="50"
          cy="50"
          r={R}
          className="timer__arc"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fraction)}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className="timer__num">{label}</span>
    </div>
  );
}
