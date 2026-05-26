import React, { useState, useEffect, useCallback } from "react";
import "./Charade.css";
import Timer from "./Components/Timer/Timer";
import {
  Button,
  Typography,
  IconButton,
  Box,
  Container,
  Tooltip,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
} from "@mui/material";
import UndoIcon from '@mui/icons-material/Undo';
import { Check, Close, RestartAlt, Settings, Pause, PlayArrow } from "@mui/icons-material";
import Modal from "./Components/Modal/Modal";
import TeamsManager from "./Components/TeamsManager/TeamsManager";
import difficultyData from "../data/difficulty.json";

const importAll = (r) =>
  r.keys().map((key) => ({
    src: r(key),
    name: key.replace(/^\.\//, "").replace(/\.[^.]+$/, ""),
  }));
const images = importAll(require.context('../../pictures/result', false, /\.(jpg|jpeg|png|gif)$/));

const DIFFICULTY_MAP = (() => {
  const map = {};
  ["easy", "medium", "hard"].forEach((level) => {
    (difficultyData[level] || []).forEach((name) => { map[name] = level; });
  });
  return map;
})();

const DIFFICULTY_PATTERN = ["easy", "easy", "easy", "medium", "medium", "hard", "easy", "easy"];

const shuffleInPlace = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const buildBalancedDeck = (allImages) => {
  const byLevel = { easy: [], medium: [], hard: [] };
  allImages.forEach((img) => {
    const level = DIFFICULTY_MAP[img.name] || "medium";
    byLevel[level].push(img);
  });

  const pools = {
    easy: shuffleInPlace([...byLevel.easy]),
    medium: shuffleInPlace([...byLevel.medium]),
    hard: shuffleInPlace([...byLevel.hard]),
  };

  const drawFrom = (level) => {
    if (pools[level].length === 0) {
      const source = byLevel[level];
      if (source.length === 0) return null;
      pools[level] = shuffleInPlace([...source]);
    }
    return pools[level].shift();
  };

  const deck = [];
  for (let i = 0; i < allImages.length; i++) {
    const slot = DIFFICULTY_PATTERN[i % DIFFICULTY_PATTERN.length];
    let pick = drawFrom(slot);
    if (!pick) {
      pick = drawFrom("medium") || drawFrom("easy") || drawFrom("hard");
    }
    if (!pick) break;
    deck.push(pick.src);
  }
  return deck;
};

const TOP_BAR_HEIGHT = 68;

const GlassCard = ({ children, sx, glow, ...props }) => (
  <MuiCard
    sx={{
      position: 'relative',
      overflow: 'visible',
      ...(glow && {
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: -1,
          borderRadius: 'inherit',
          padding: 1,
          background: `linear-gradient(135deg, ${glow}66, transparent 60%)`,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        },
      }),
      ...sx,
    }}
    {...props}
  >
    {children}
  </MuiCard>
);

const CharadesGame = () => {
  const loadGameState = () => {
    try {
      const savedState = localStorage.getItem('charadesGameState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return {
          teams: parsed.teams || [],
          currentImageIndex: parsed.currentImageIndex || 0,
          isGameActive: parsed.isGameActive || false,
          currentRound: parsed.currentRound || 1,
          currentTeamIndex: parsed.currentTeamIndex || 0,
          customTimer: parsed.customTimer || 60,
          roundScore: parsed.roundScore || 0,
          numOfRounds: parsed.numOfRounds || 3,
          isGameOver: parsed.isGameOver || false,
          winningTeam: parsed.winningTeam || null,
        };
      }
    } catch (error) {
      console.log('Error loading game state:', error);
    }
    return {
      teams: [], currentImageIndex: 0, isGameActive: false, currentRound: 1,
      currentTeamIndex: 0, customTimer: 60, roundScore: 0, numOfRounds: 3,
      isGameOver: false, winningTeam: null,
    };
  };

  const initialState = loadGameState();
  const [teams, setTeams] = useState(initialState.teams);
  const [currentImageIndex, setCurrentImageIndex] = useState(initialState.currentImageIndex);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [isGameActive, setIsGameActive] = useState(initialState.isGameActive);
  const [currentRound, setCurrentRound] = useState(initialState.currentRound);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(initialState.currentTeamIndex);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [customTimer, setCustomTimer] = useState(initialState.customTimer || 60);
  const [roundScore, setRoundScore] = useState(initialState.roundScore);
  const [numOfRounds, setNumOfRounds] = useState(initialState.numOfRounds);
  const [isGameOver, setIsGameOver] = useState(initialState.isGameOver);
  const [winningTeam, setWinningTeam] = useState(initialState.winningTeam);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);
  const [roundEndSound] = useState(new Audio('/round-end-dramatic.mp3'));
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    setShuffledImages(buildBalancedDeck(images));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('charadesGameState', JSON.stringify({
        teams, currentImageIndex, isGameActive, currentRound, currentTeamIndex,
        customTimer, roundScore, numOfRounds, isGameOver, winningTeam,
      }));
    } catch (error) {
      console.log('Error saving game state:', error);
    }
  }, [teams, currentImageIndex, isGameActive, currentRound, currentTeamIndex, customTimer, roundScore, numOfRounds, isGameOver, winningTeam]);

  const updateScore = (index, delta) => {
    const updatedTeams = teams.map((team, i) => {
      if (i === index) {
        setRoundScore((prev) => Math.max(0, prev + Number(delta)));
        return { ...team, score: Math.max(0, team.score + Number(delta)) };
      }
      return team;
    });
    setTeams(updatedTeams);
  };

  const nextImage = () => {
    updateScore(currentTeamIndex, 1);
    setCurrentImageIndex((p) => (p < shuffledImages.length - 1 ? p + 1 : 0));
  };

  const skipImage = (delta) => {
    updateScore(currentTeamIndex, delta);
    setCurrentImageIndex((p) => (p < shuffledImages.length - 1 ? p + 1 : 0));
  };

  const previousImage = () => {
    setCurrentImageIndex((p) => (p > 0 ? p - 1 : shuffledImages.length - 1));
  };

  const startGame = () => {
    if (teams.length === 0) {
      alert("Please add at least one team before starting the game.");
      return;
    }
    setPendingStart(true);
    setIsSettingsOpen(true);
  };

  const beginGame = () => {
    setIsGameActive(true);
    setIsTimerActive(true);
    setCurrentImageIndex(0);
  };

  const restart = () => {
    localStorage.removeItem('charadesGameState');
    setIsGameActive(false);
    setCurrentRound(1);
    setCurrentTeamIndex(0);
    setTeams([]);
    setCustomTimer(60);
    setIsTimerActive(false);
    setIsModalOpen(false);
    setShuffledImages(buildBalancedDeck(images));
    setIsGameOver(false);
    setNumOfRounds(3);
    setRoundScore(0);
    setWinningTeam(null);
    setTimerKey((p) => p + 1);
  };

  const handleGameOver = useCallback(() => {
    const winner = teams.reduce((prev, current) => (prev.score > current.score ? prev : current));
    setWinningTeam(winner);
    setIsGameOver(true);
    setIsModalOpen(true);
  }, [teams]);

  const handleTimerEnd = useCallback(() => {
    setIsTimerActive(false);
    roundEndSound.volume = 1.0;
    roundEndSound.play().catch((e) => console.log('Audio playback failed:', e));
    if (currentRound === numOfRounds && currentTeamIndex === teams.length - 1) {
      handleGameOver();
    } else {
      setIsModalOpen(true);
    }
  }, [currentRound, numOfRounds, currentTeamIndex, teams.length, roundEndSound, handleGameOver]);

  const closeModal = () => setIsModalOpen(false);

  const nextTeam = () => {
    closeModal();
    const nextIndex = currentTeamIndex + 1;
    if (nextIndex < teams.length) {
      setCurrentTeamIndex(nextIndex);
      setRoundScore(0);
    } else {
      setCurrentRound((p) => p + 1);
      setCurrentTeamIndex(0);
      setRoundScore(0);
    }
    setIsTimerActive(true);
    setShuffledImages(buildBalancedDeck(images));
    setCurrentImageIndex(0);
  };

  const handleCustomTimerChange = (time) => setCustomTimer(Number(time));

  const handlePlayAgain = () => {
    localStorage.removeItem('charadesGameState');
    setIsGameActive(false);
    setCurrentRound(1);
    setCurrentTeamIndex(0);
    setIsTimerActive(false);
    setIsModalOpen(false);
    setIsGameOver(false);
    setRoundScore(0);
    setWinningTeam(null);
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => {
    setIsSettingsOpen(false);
    setPendingStart(false);
  };
  const confirmSettings = () => {
    setIsSettingsOpen(false);
    if (pendingStart) {
      setPendingStart(false);
      beginGame();
    }
  };

  const currentTeam = teams[currentTeamIndex];
  const currentTeamColor = currentTeam?.color || '#c6ff3d';

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Top bar — minimal glass strip */}
      <Box
        sx={{
          height: TOP_BAR_HEIGHT,
          px: { xs: 2.5, md: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(7, 7, 13, 0.55)',
          backdropFilter: 'blur(18px) saturate(150%)',
          WebkitBackdropFilter: 'blur(18px) saturate(150%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32, height: 32, borderRadius: '10px',
              background: 'linear-gradient(135deg, #c6ff3d 0%, #3df0ff 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px -4px rgba(198,255,61,0.6)',
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: '#07070d',
                fontFamily: 'var(--font-display)',
              }}
            >
              ◆
            </Box>
          </Box>
          <Typography
            sx={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.15rem',
              letterSpacing: '-0.01em',
              color: '#f4f4f8',
            }}
          >
            charades
          </Typography>
          <Box
            sx={{
              ml: 1, px: 1, py: 0.25,
              borderRadius: 999,
              background: 'rgba(198,255,61,0.08)',
              border: '1px solid rgba(198,255,61,0.3)',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#c6ff3d',
              textTransform: 'uppercase',
            }}
          >
            v2
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Settings" arrow>
            <IconButton
              onClick={openSettings}
              sx={{
                width: 38, height: 38,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f4f4f8',
                '&:hover': {
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.18)',
                },
              }}
            >
              <Settings sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main grid */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'stretch',
          height: `calc(100vh - ${TOP_BAR_HEIGHT}px)`,
          width: '100vw',
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
          gap: { xs: 2, md: 3 },
          boxSizing: 'border-box',
        }}
      >
        {/* Left rail */}
        <Box
          sx={{
            width: { xs: '100%', md: 360, lg: 400 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: '100%',
            minHeight: 0,
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: 0.5 }}>
            <TeamsManager
              teams={teams}
              setTeams={setTeams}
              activeTeamIndex={isGameActive ? currentTeamIndex : -1}
            />
          </Box>

          <GlassCard glow={currentTeamColor} sx={{ flexShrink: 0 }}>
            <MuiCardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Timer
                key={timerKey}
                onTimeUp={handleTimerEnd}
                onTimerChange={handleCustomTimerChange}
                initialTime={customTimer}
                isActive={isTimerActive}
                accentColor={currentTeamColor}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={teams.length === 0 || isGameActive}
                  onClick={startGame}
                  fullWidth
                  startIcon={<PlayArrow />}
                  sx={{
                    height: 44,
                    fontSize: '0.9rem',
                    '&.Mui-disabled': {
                      background: isGameActive
                        ? 'linear-gradient(135deg, #c6ff3d 0%, #9bd200 100%)'
                        : 'rgba(255,255,255,0.06)',
                      color: isGameActive ? '#07070d' : 'rgba(244,244,248,0.35)',
                      opacity: isGameActive ? 0.85 : 1,
                      boxShadow: 'none',
                    },
                  }}
                >
                  {isGameActive ? 'In Progress' : 'Start Game'}
                </Button>
                <Tooltip title={isTimerActive ? 'Pause' : 'Resume'} arrow>
                  <span>
                    <IconButton
                      onClick={() => setIsTimerActive((p) => !p)}
                      disabled={!isGameActive}
                      sx={{
                        width: 44, height: 44,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f4f4f8',
                        '&:hover': { background: 'rgba(255,255,255,0.1)' },
                        '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
                      }}
                    >
                      {isTimerActive ? <Pause sx={{ fontSize: 18 }} /> : <PlayArrow sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Restart game" arrow>
                  <IconButton
                    onClick={restart}
                    sx={{
                      width: 44, height: 44,
                      background: 'rgba(255, 61, 138, 0.1)',
                      border: '1px solid rgba(255, 61, 138, 0.25)',
                      color: '#ff3d8a',
                      '&:hover': {
                        background: 'rgba(255, 61, 138, 0.18)',
                        borderColor: 'rgba(255, 61, 138, 0.5)',
                      },
                    }}
                  >
                    <RestartAlt sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </MuiCardContent>
          </GlassCard>
        </Box>

        {/* Main stage */}
        <GlassCard
          glow={isGameActive ? currentTeamColor : '#6366f1'}
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            p: { xs: 2, md: 3.5 },
            background: 'rgba(11, 11, 20, 0.55)',
          }}
        >
          {isGameActive ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 2 }}>
              {/* Stage header */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: currentTeamColor,
                      boxShadow: `0 0 14px ${currentTeamColor}`,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '0.22em',
                      color: 'rgba(244,244,248,0.5)',
                      textTransform: 'uppercase',
                      display: { xs: 'none', lg: 'block' },
                    }}
                  >
                    Now playing
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      color: '#f4f4f8',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentTeam?.name || 'No team'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 1,
                    justifySelf: 'center',
                    px: 1.75,
                    py: 0.5,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '0.22em',
                      color: 'rgba(244,244,248,0.5)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Round
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#f4f4f8',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {currentRound}
                    <Box component="span" sx={{ color: 'rgba(244,244,248,0.35)' }}>/{numOfRounds}</Box>
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 1,
                    justifySelf: 'end',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      color: 'rgba(244,244,248,0.4)',
                      textTransform: 'uppercase',
                      display: { xs: 'none', md: 'block' },
                    }}
                  >
                    Round score
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '1.4rem',
                      color: roundScore > 0 ? '#c6ff3d' : '#f4f4f8',
                      textShadow: roundScore > 0 ? '0 0 16px rgba(198,255,61,0.5)' : 'none',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {roundScore}
                  </Typography>
                </Box>
              </Box>

              {/* Image stage */}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: `inset 0 0 0 1px ${currentTeamColor}22, 0 0 60px -20px ${currentTeamColor}55`,
                  animation: 'float-in 0.4s ease',
                }}
                key={currentImageIndex}
              >
                <Box
                  component="img"
                  src={shuffledImages[currentImageIndex]}
                  alt="Charades"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>

              {/* Action buttons */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: { xs: 1.5, md: 2.5 },
                  flexShrink: 0,
                }}
              >
                <Tooltip title="Previous card" arrow>
                  <IconButton
                    onClick={previousImage}
                    sx={{
                      width: 56, height: 56,
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#9da3b4',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.08)',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: '#f4f4f8',
                      },
                    }}
                  >
                    <UndoIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Got it!  +1 point" arrow>
                  <IconButton
                    onClick={nextImage}
                    sx={{
                      width: 72, height: 72,
                      borderRadius: 20,
                      background: 'linear-gradient(135deg, #c6ff3d 0%, #9bd200 100%)',
                      color: '#07070d',
                      boxShadow: '0 0 0 1px rgba(198,255,61,0.4), 0 12px 36px -8px rgba(198,255,61,0.65)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #d8ff66 0%, #afe800 100%)',
                        boxShadow: '0 0 0 1px rgba(198,255,61,0.6), 0 16px 44px -6px rgba(198,255,61,0.85)',
                      },
                    }}
                  >
                    <Check sx={{ fontSize: 32, fontWeight: 800 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Skip  -1 point" arrow>
                  <IconButton
                    onClick={() => skipImage(-1)}
                    sx={{
                      width: 56, height: 56,
                      borderRadius: 16,
                      background: 'rgba(255, 61, 138, 0.1)',
                      border: '1px solid rgba(255, 61, 138, 0.3)',
                      color: '#ff3d8a',
                      '&:hover': {
                        background: 'rgba(255, 61, 138, 0.2)',
                        borderColor: 'rgba(255, 61, 138, 0.6)',
                        boxShadow: '0 0 24px -4px rgba(255,61,138,0.6)',
                      },
                    }}
                  >
                    <Close sx={{ fontSize: 24 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 3,
                animation: 'float-in 0.5s ease',
              }}
            >
              <Box
                sx={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  background: 'linear-gradient(135deg, #c6ff3d 0%, #3df0ff 50%, #d63dff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 80px rgba(198,255,61,0.2)',
                }}
              >
                Ready to play?
              </Box>
              <Typography
                sx={{
                  color: 'rgba(244,244,248,0.55)',
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  maxWidth: 480,
                  lineHeight: 1.6,
                }}
              >
                {teams.length === 0
                  ? 'Add at least one team in the panel on the left to get started.'
                  : `${teams.length} team${teams.length > 1 ? 's' : ''} ready. Hit Start Game when everyone is in.`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['◆ team-based', '◆ timed rounds', `◆ ${images.length} cards`].map((label) => (
                  <Box
                    key={label}
                    sx={{
                      px: 1.5, py: 0.5,
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      color: 'rgba(244,244,248,0.6)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </GlassCard>
      </Container>

      <Modal
        isOpen={isModalOpen}
        isGameOver={isGameOver}
        winningTeam={winningTeam}
        onNextTeam={nextTeam}
        nextTeam={teams[(currentTeamIndex + 1) % teams.length]?.name}
        nextTeamColor={teams[(currentTeamIndex + 1) % teams.length]?.color}
        roundScore={roundScore}
        onGameOver={handlePlayAgain}
        currentRound={currentRound}
        numOfRounds={numOfRounds}
        setNumOfRounds={setNumOfRounds}
        teams={teams}
        updateScore={updateScore}
      />

      {/* Settings dialog */}
      <Dialog open={isSettingsOpen} onClose={closeSettings} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.3rem',
            letterSpacing: '-0.01em',
            color: '#f4f4f8',
            pb: 1,
          }}
        >
          {pendingStart ? 'Game settings' : 'Settings'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pt: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(244,244,248,0.5)', textTransform: 'uppercase' }}>
                  Rounds
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', color: '#c6ff3d' }}>
                  {numOfRounds}
                </Typography>
              </Box>
              <Slider value={numOfRounds} step={1} marks min={2} max={10} onChange={(_, v) => setNumOfRounds(v)} />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(244,244,248,0.5)', textTransform: 'uppercase' }}>
                  Timer (seconds)
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', color: '#c6ff3d' }}>
                  {customTimer}s
                </Typography>
              </Box>
              <Slider
                value={customTimer}
                step={30}
                marks
                min={30}
                max={180}
                onChange={(_, v) => handleCustomTimerChange(v)}
                disabled={isTimerActive}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
          {pendingStart && (
            <Button onClick={closeSettings} variant="outlined" sx={{ flex: 1 }}>
              Cancel
            </Button>
          )}
          <Button
            onClick={confirmSettings}
            variant="contained"
            color="primary"
            startIcon={pendingStart ? <PlayArrow /> : null}
            sx={{ flex: pendingStart ? 1.5 : 1 }}
          >
            {pendingStart ? 'Start game' : 'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharadesGame;
