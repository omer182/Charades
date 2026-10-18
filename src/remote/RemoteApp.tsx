import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import { ArrowLeft, Check, Crown, Play, Star, Trophy, WifiOff, X } from 'lucide-react';
import ActionBar from '../components/ActionBar';
import CategoryIcon from '../components/CategoryIcon';
import TimerRing from '../components/TimerRing';
import { vars } from '../components/ui';
import { CARDS, CATEGORY, cardLabel } from '../game/cards';
import { currentCard, isFinalTurn, isGolden, standings, turnPoints, type Action } from '../game/reducer';
import { vibrate } from '../game/sound';
import type { CardResult, GameState } from '../game/types';
import { useRemaining } from '../hooks/useRemaining';
import { CODE_PATTERN } from '../net/protocol';
import { RoomClient } from '../net/roomClient';

// One remote per page; created on first render and kept for the page's life.
let client: RoomClient | null = null;
const remoteFor = (code: string) => (client ??= new RoomClient('remote', code, () => null));

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

/** The host's phone: runs turns for the big screen it joined with the QR. */
export default function RemoteApp({ code }: { code: string }) {
  const room = useMemo(() => remoteFor(code), [code]);
  const { status, state } = useSyncExternalStore(room.subscribe, room.getSnapshot);
  const dispatch = useCallback((action: Action) => room.dispatch(action), [room]);

  useEffect(() => {
    document.documentElement.style.setProperty('--team', state ? (state.teams[state.teamIndex]?.color ?? '#ffd23f') : '#ffd23f');
  }, [state]);

  return (
    <div className="remote">
      <header className="remote__head">
        <span className="remote__brand">בלי מילים</span>
        <span className="remote__room" data-status={status}>
          {status === 'live' ? 'מחובר' : status === 'not-found' ? 'לא נמצא' : <><WifiOff size={14} /> מתחבר</>} ·{' '}
          <span dir="ltr">{code}</span>
        </span>
      </header>
      <main className="remote__main">
        {status === 'not-found' ? (
          <NotFound code={code} />
        ) : !state ? (
          <p className="remote__note">מתחברים למסך…</p>
        ) : (
          <Phase state={state} dispatch={dispatch} cueGo={() => room.cue({ type: 'go' })} />
        )}
      </main>
    </div>
  );
}

function NotFound({ code }: { code: string }) {
  const [value, setValue] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = value.trim().toUpperCase();
    if (CODE_PATTERN.test(next)) location.assign(`/r/${next}`);
  };
  return (
    <form className="remote__card" onSubmit={submit}>
      <h1 className="remote__title">לא מצאנו את החדר <bdi dir="ltr">{code}</bdi></h1>
      <p className="remote__note">בדקו את הקוד שמופיע על המסך ונסו שוב.</p>
      <input
        className="add-team__input remote__code-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ABCD"
        maxLength={4}
        dir="ltr"
        autoCapitalize="characters"
        aria-label="קוד החדר"
      />
      <button className="cta" type="submit" disabled={!CODE_PATTERN.test(value.trim().toUpperCase())}>
        הצטרפות <ArrowLeft size={20} />
      </button>
    </form>
  );
}

function Phase({ state, dispatch, cueGo }: { state: GameState; dispatch: (a: Action) => void; cueGo: () => void }) {
  const team = state.teams[state.teamIndex];

  switch (state.phase) {
    case 'lobby':
      return (
        <div className="remote__card">
          <h1 className="remote__title">מחוברים! 🎉</h1>
          <p className="remote__note">אתם השופטים: מהטלפון תסמנו ניחוש ודילוג. את הקבוצות והקטגוריות בוחרים על המסך.</p>
        </div>
      );

    case 'ready':
      return (
        <div className="remote__card" style={vars({ '--c': team?.color })}>
          <p className="remote__eyebrow">
            סבב {state.round} מתוך {state.settings.rounds}
          </p>
          <p className="remote__note">הבאים בתור</p>
          <h1 className="remote__title remote__title--team">{team?.name}</h1>
          <button className="cta cta--team" onClick={cueGo}>
            <Play size={20} fill="currentColor" /> מוכנים, להתחיל ספירה
          </button>
        </div>
      );

    case 'playing':
      return <Turn state={state} dispatch={dispatch} />;

    case 'turnEnd':
      return <Review state={state} dispatch={dispatch} />;

    case 'gameOver': {
      const leaders = standings(state.teams).filter((r) => r.isLeader);
      return (
        <div className="remote__card">
          <Crown size={36} className="remote__crown" />
          <p className="remote__note">{leaders.length > 1 ? 'תיקו!' : 'והמנצחים הם'}</p>
          <h1 className="remote__title">{leaders.map((l) => l.team.name).join(' ו־')}</h1>
          <p className="remote__note">משחק חוזר מתחילים מהמסך.</p>
        </div>
      );
    }
  }
}

function Turn({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const { teams, teamIndex, turn, timer, settings } = state;
  const team = teams[teamIndex];
  const card = currentCard(state);
  const info = card ? CARDS[card] : undefined;
  const golden = card !== undefined && isGolden(state, card);
  const paused = timer.endsAt === null;
  const remaining = useRemaining(timer);

  // If the screen is asleep or offline, the phone still ends the turn on time.
  useEffect(() => {
    if (!paused && remaining <= 0) {
      vibrate([200, 80, 200]);
      dispatch({ type: 'timeUp' });
    }
  }, [paused, remaining, dispatch]);

  const mark = (result: CardResult) => {
    if (paused) return;
    vibrate(result === 'got' ? 30 : [15, 40, 15]);
    dispatch({ type: 'mark', result });
  };

  return (
    <div className="remote__turn">
      <div className="remote__bar">
        <span className="remote__team" style={vars({ '--c': team?.color })}>
          {team?.name}
        </span>
        <TimerRing remainingMs={remaining} totalMs={settings.turnSeconds * 1000} paused={paused} />
        <span className="remote__points">
          <bdi dir="ltr">{signed(turnPoints(turn))}</bdi>
        </span>
      </div>

      <div className="remote__word" data-golden={golden} style={vars({ '--cat': info ? CATEGORY[info.category].color : undefined })}>
        {golden && (
          <span className="remote__golden">
            <Star size={14} fill="currentColor" /> קלף זהב · <bdi dir="ltr">+2</bdi>
          </span>
        )}
        {info && (
          <span className="remote__cat">
            <CategoryIcon id={info.category} size={16} /> {CATEGORY[info.category].label}
          </span>
        )}
        <p className="remote__card-word">{card ? cardLabel(card) : '—'}</p>
        {paused && <p className="remote__paused">בהשהיה</p>}
      </div>

      <ActionBar
        golden={golden}
        paused={paused}
        canUndo={turn.length > 0}
        onMark={mark}
        onUndo={() => turn.length > 0 && !paused && dispatch({ type: 'undo' })}
        onTogglePause={() => dispatch({ type: paused ? 'resume' : 'pause', now: Date.now() })}
      />
    </div>
  );
}

function Review({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const { teams, teamIndex, turn } = state;
  const team = teams[teamIndex];
  const next = teams[(teamIndex + 1) % teams.length];
  const final = isFinalTurn(state);

  return (
    <div className="remote__card remote__card--review">
      <p className="remote__eyebrow">נגמר הזמן!</p>
      <h1 className="remote__title">
        {team?.name} <bdi dir="ltr">{signed(turnPoints(turn))}</bdi>
      </h1>
      {turn.length > 0 && <p className="remote__note">טעיתם? הקישו על קלף כדי לתקן</p>}
      <ul className="remote__list">
        {turn.map((entry, i) => (
          <li key={`${entry.card}-${i}`}>
            <button
              className="remote__row"
              data-result={entry.result}
              data-golden={Boolean(entry.golden)}
              onClick={() => dispatch({ type: 'toggleEntry', index: i })}
            >
              {entry.result === 'got' ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
              <span className="remote__row-word">{cardLabel(entry.card)}</span>
              {entry.golden && <Star size={14} fill="currentColor" className="remote__row-star" />}
              <bdi dir="ltr" className="remote__row-delta">{signed(entry.delta)}</bdi>
            </button>
          </li>
        ))}
      </ul>
      <button className="cta cta--next" style={vars({ '--c': final ? undefined : next?.color })} onClick={() => dispatch({ type: 'nextTurn' })}>
        {final ? (
          <>
            <Trophy size={20} /> לתוצאות הסופיות
          </>
        ) : (
          <>
            הבאים בתור: {next?.name} <ArrowLeft size={20} />
          </>
        )}
      </button>
    </div>
  );
}
