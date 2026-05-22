import React, { useState, useEffect } from 'react';
import {
  Button, Box, Typography, Backdrop, Fade, Paper,
  CircularProgress, IconButton, Stack,
} from '@mui/material';
import {
  EmojiEvents, PlayArrow, Replay,
  Add as AddIcon, Remove as RemoveIcon,
} from '@mui/icons-material';
import Confetti from './Confetti';
import './Modal.css';

const Modal = ({
  isOpen, isGameOver, winningTeam, nextTeam, nextTeamColor,
  roundScore, onNextTeam, onGameOver, currentRound, numOfRounds,
  teams, updateScore,
}) => {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!isOpen) setCountdown(null);
  }, [isOpen]);

  useEffect(() => {
    if (countdown !== null) {
      if (countdown === 0) {
        onNextTeam();
        setCountdown(null);
      } else {
        const id = setInterval(() => setCountdown((p) => p - 1), 1000);
        return () => clearInterval(id);
      }
    }
  }, [countdown, onNextTeam]);

  const sortedTeams = teams ? [...teams].sort((a, b) => b.score - a.score) : [];
  const accent = nextTeamColor || '#c6ff3d';
  const isLastRound = typeof currentRound === 'number' && typeof numOfRounds === 'number' && currentRound === numOfRounds;

  return (
    <Backdrop sx={{ zIndex: 2000 }} open={isOpen}>
      <Confetti active={isOpen && isGameOver} accent={winningTeam?.color} />
      <Fade in={isOpen} timeout={400}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 1100,
            px: { xs: 2, md: 4 },
          }}
        >
          {/* Standings — left rail */}
          {!isGameOver && teams && teams.length > 0 && (
            <Paper
              sx={{
                width: { xs: '100%', md: 320 },
                p: 2.5,
                background: 'rgba(13, 13, 24, 0.7)',
                backdropFilter: 'blur(28px) saturate(140%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  color: 'rgba(244,244,248,0.5)',
                  textTransform: 'uppercase',
                  mb: 2,
                }}
              >
                Standings
              </Typography>
              <Stack spacing={1}>
                {sortedTeams.map((team, index) => (
                  <Box
                    key={team.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      p: 1.25,
                      borderRadius: 2.5,
                      background: index === 0
                        ? `linear-gradient(135deg, ${team.color}22, ${team.color}08)`
                        : 'rgba(255,255,255,0.025)',
                      border: index === 0
                        ? `1px solid ${team.color}55`
                        : '1px solid rgba(255,255,255,0.05)',
                      boxShadow: index === 0
                        ? `0 0 20px -6px ${team.color}55`
                        : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: index === 0 ? team.color : 'rgba(244,244,248,0.4)',
                          width: 18,
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <Box
                        sx={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: team.color,
                          boxShadow: `0 0 8px ${team.color}`,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: '#f4f4f8',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {team.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateScore(teams.findIndex((t) => t.name === team.name), -1)}
                        sx={{
                          width: 22, height: 22,
                          color: 'rgba(244,244,248,0.4)',
                          '&:hover': { background: 'rgba(255,61,138,0.15)', color: '#ff3d8a' },
                        }}
                      >
                        <RemoveIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: team.score > 0 ? team.color : 'rgba(244,244,248,0.5)',
                          minWidth: 24,
                          textAlign: 'center',
                          textShadow: team.score > 0 ? `0 0 10px ${team.color}70` : 'none',
                        }}
                      >
                        {team.score}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateScore(teams.findIndex((t) => t.name === team.name), 1)}
                        sx={{
                          width: 22, height: 22,
                          color: 'rgba(244,244,248,0.4)',
                          '&:hover': { background: 'rgba(198,255,61,0.15)', color: '#c6ff3d' },
                        }}
                      >
                        <AddIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}

          {/* Main panel */}
          <Paper
            sx={{
              flex: 1,
              maxWidth: 520,
              minWidth: { xs: 280, md: 420 },
              p: { xs: 3, md: 4.5 },
              background: 'rgba(13, 13, 24, 0.78)',
              backdropFilter: 'blur(32px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Aurora accent inside panel */}
            <Box
              sx={{
                position: 'absolute',
                inset: -100,
                background: isGameOver
                  ? `radial-gradient(40% 40% at 50% 0%, ${winningTeam?.color || '#c6ff3d'}33, transparent 60%)`
                  : `radial-gradient(40% 40% at 50% 0%, ${accent}33, transparent 60%)`,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {isGameOver ? (
                <Box>
                  <Box
                    sx={{
                      width: 84, height: 84,
                      mx: 'auto', mb: 2.5,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `linear-gradient(135deg, ${winningTeam?.color || '#c6ff3d'}, ${winningTeam?.color || '#c6ff3d'}66)`,
                      boxShadow: `0 0 0 1px ${winningTeam?.color || '#c6ff3d'}, 0 0 48px -6px ${winningTeam?.color || '#c6ff3d'}aa`,
                      animation: 'confetti-pop 0.6s ease',
                    }}
                  >
                    <EmojiEvents sx={{ fontSize: 42, color: '#07070d' }} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.3em',
                      color: 'rgba(244,244,248,0.5)',
                      textTransform: 'uppercase',
                      mb: 1.5,
                    }}
                  >
                    Game over
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: { xs: '2rem', md: '2.6rem' },
                      letterSpacing: '-0.025em',
                      lineHeight: 1.1,
                      color: winningTeam?.color || '#c6ff3d',
                      textShadow: `0 0 40px ${winningTeam?.color || '#c6ff3d'}55`,
                      mb: 1,
                    }}
                  >
                    {winningTeam?.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.92rem',
                      color: 'rgba(244,244,248,0.6)',
                      mb: 3,
                    }}
                  >
                    wins with{' '}
                    <Box component="span" sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f4f4f8' }}>
                      {winningTeam?.score}
                    </Box>{' '}
                    points
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onGameOver}
                    size="large"
                    startIcon={<Replay />}
                    sx={{ px: 4, py: 1.4, fontSize: '1rem' }}
                  >
                    Play again
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.3em',
                      color: '#ff3d8a',
                      textTransform: 'uppercase',
                      mb: 1.5,
                    }}
                  >
                    Time's up
                  </Typography>

                  {typeof currentRound === 'number' && typeof numOfRounds === 'number' && (
                    <Typography sx={{ color: 'rgba(244,244,248,0.5)', fontSize: '0.88rem', mb: 2.5 }}>
                      Round{' '}
                      <Box component="span" sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f4f4f8' }}>
                        {currentRound}
                      </Box>
                      {' '}of{' '}
                      <Box component="span" sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f4f4f8' }}>
                        {numOfRounds}
                      </Box>
                      {isLastRound && (
                        <Box component="span" sx={{ ml: 1.5, color: '#ff8a3d', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em' }}>
                          · FINAL ROUND
                        </Box>
                      )}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      mb: 3.5,
                      p: 3,
                      borderRadius: 4,
                      background: roundScore > 0
                        ? 'linear-gradient(135deg, rgba(198,255,61,0.12), rgba(198,255,61,0.02))'
                        : 'rgba(255,255,255,0.03)',
                      border: roundScore > 0
                        ? '1px solid rgba(198,255,61,0.3)'
                        : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: roundScore > 0
                        ? '0 0 32px -8px rgba(198,255,61,0.4)'
                        : 'none',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.25em',
                        color: 'rgba(244,244,248,0.4)',
                        textTransform: 'uppercase',
                        mb: 0.5,
                      }}
                    >
                      Round score
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: { xs: '4rem', md: '5.2rem' },
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                        color: roundScore > 0 ? '#c6ff3d' : 'rgba(244,244,248,0.5)',
                        textShadow: roundScore > 0 ? '0 0 40px rgba(198,255,61,0.6)' : 'none',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {roundScore > 0 ? `+${roundScore}` : roundScore}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.25em',
                        color: 'rgba(244,244,248,0.4)',
                        textTransform: 'uppercase',
                        mb: 0.75,
                      }}
                    >
                      Up next
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25 }}>
                      <Box
                        sx={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: accent,
                          boxShadow: `0 0 14px ${accent}`,
                        }}
                      />
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: { xs: '1.5rem', md: '1.85rem' },
                          letterSpacing: '-0.02em',
                          color: accent,
                          textShadow: `0 0 24px ${accent}55`,
                        }}
                      >
                        {nextTeam}
                      </Typography>
                    </Box>
                  </Box>

                  {countdown !== null ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ color: 'rgba(244,244,248,0.5)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        Starting in
                      </Typography>
                      <Box sx={{ position: 'relative', width: 84, height: 84 }}>
                        <CircularProgress
                          variant="determinate"
                          value={(countdown / 3) * 100}
                          size={84}
                          thickness={3}
                          sx={{
                            color: accent,
                            '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            fontSize: '2.4rem',
                            color: accent,
                            textShadow: `0 0 20px ${accent}80`,
                          }}
                        >
                          {countdown}
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setCountdown(3)}
                      size="large"
                      startIcon={<PlayArrow />}
                      sx={{ px: 4, py: 1.4, fontSize: '1rem' }}
                    >
                      Ready to continue
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Backdrop>
  );
};

export default Modal;
