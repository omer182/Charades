import React, { useState, useEffect, useCallback } from "react";
import "./Charade.css";
import Timer from "./Components/Timer/Timer";
import { useThemeMode } from '../index';
import {
  Button, 
  TextField,
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
  Slider
} from "@mui/material";
import UndoIcon from '@mui/icons-material/Undo';
import { Check, Close, RestartAlt, DarkMode, LightMode, Settings, Pause, PlayArrow } from "@mui/icons-material";
import Modal from "./Components/Modal/Modal";
import TeamsManager from "./Components/TeamsManager/TeamsManager";

const importAll = (r) => r.keys().map(r);

const images = importAll(require.context('../../pictures/result', false, /\.(jpg|jpeg|png|gif)$/));

const ModernCard = ({ className, children, sx, ...props }) => {
  return (
    <MuiCard 
      className={`modern-card ${className || ''}`}
      sx={{
        backdropFilter: "blur(16px)",
        background: "rgba(255, 255, 255, 0.95)",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        borderRadius: 2,
        transition: "box-shadow 0.3s ease",
        '&:hover': {
          boxShadow: "0 6px 20px 0 rgba(139, 92, 246, 0.3)"
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiCard>
  );
};

const ModernCardContent = ({ className, children, sx, ...props }) => {
  return (
    <MuiCardContent 
      className={`modern-card-content ${className || ''}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        p: 1.5,
        '&:last-child': { pb: 1.5 },
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiCardContent>
  );
};

const CharadesGame = () => {
  const { isDarkMode, toggleTheme } = useThemeMode();
  
  // Load initial state from localStorage or use defaults
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
          numOfRounds: parsed.numOfRounds || 5,
          isGameOver: parsed.isGameOver || false,
          winningTeam: parsed.winningTeam || null,
        };
      }
    } catch (error) {
      console.log('Error loading game state:', error);
    }
    return {
      teams: [],
      currentImageIndex: 0,
      isGameActive: false,
      currentRound: 1,
      currentTeamIndex: 0,
      customTimer: 60,
      roundScore: 0,
      numOfRounds: 5,
      isGameOver: false,
      winningTeam: null,
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
  const [roundEndSound] = useState(new Audio('/round-end-dramatic.mp3'));
  const [timerKey, setTimerKey] = useState(0);

  const TOP_BAR_HEIGHT = 64; // px
  const VERTICAL_PADDING = 2; // px, matches md:2 (theme.spacing(2))

  useEffect(() => {
    const imagePaths = images.map((img) => img);
    setShuffledImages(shuffleArray(imagePaths));
  }, []);

  // Save game state whenever relevant state changes
  useEffect(() => {
    saveGameState();
  }, [teams, currentImageIndex, isGameActive, currentRound, currentTeamIndex, customTimer, roundScore, numOfRounds, isGameOver, winningTeam]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Save game state to localStorage
  const saveGameState = () => {
    try {
      const gameState = {
        teams,
        currentImageIndex,
        isGameActive,
        currentRound,
        currentTeamIndex,
        customTimer,
        roundScore,
        numOfRounds,
        isGameOver,
        winningTeam,
      };
      localStorage.setItem('charadesGameState', JSON.stringify(gameState));
    } catch (error) {
      console.log('Error saving game state:', error);
    }
  };

  const updateScore = (index, delta) => {
    const updatedTeams = teams.map((team, i) => {
      if (i === index) {
        setRoundScore((prevScore) => Math.max(0, prevScore + Number(delta)));
        return { ...team, score: Math.max(0, team.score + Number(delta)) };
      }
      return team;
    });
    setTeams(updatedTeams);
  };

  const nextImage = () => {
    updateScore(currentTeamIndex, 1);
    setCurrentImageIndex((prevIndex) =>
      prevIndex < shuffledImages.length - 1 ? prevIndex + 1 : 0
    );
  };

  const skipImage = (delta) => {
    updateScore(currentTeamIndex, delta);
    setCurrentImageIndex((prevIndex) =>
      prevIndex < shuffledImages.length - 1 ? prevIndex + 1 : 0
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : shuffledImages.length - 1
    );
  };

  const startGame = () => {
    if (teams.length === 0) {
      alert("Please add at least one team before starting the game.");
      return;
    }
    setIsGameActive(true);
    setIsTimerActive(true);
    setCurrentImageIndex(0);
  };

  const restart = () => {
    // Clear localStorage
    localStorage.removeItem('charadesGameState');
    
    setIsGameActive(false);
    setCurrentRound(1);
    setCurrentTeamIndex(0);
    setTeams([]);
    setCustomTimer(60);
    setIsTimerActive(false);
    setIsModalOpen(false);
    setShuffledImages(shuffleArray(images.map((img) => img)));
    setIsGameOver(false);
    setNumOfRounds(5);
    setRoundScore(0);
    setWinningTeam(null);
    setTimerKey((prev) => prev + 1);
  }

  const handleGameOver = useCallback(() => {
    const winningTeam = teams.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );

    setWinningTeam(winningTeam);
    setIsGameOver(true);
    setIsModalOpen(true);
  }, [teams]);

  const handleTimerEnd = useCallback(() => {
    setIsTimerActive(false);
    
    // Play round end sound
    roundEndSound.volume = 1.0;
    roundEndSound.play().catch(error => {
      console.log('Audio playback failed:', error);
    });

    if (currentRound === numOfRounds && currentTeamIndex === teams.length - 1) {
      handleGameOver();
    } else {
      setIsModalOpen(true);
    }
  }, [currentRound, numOfRounds, currentTeamIndex, teams.length, roundEndSound]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextTeam = () => {
    closeModal();
    const nextIndex = currentTeamIndex + 1;

    if (nextIndex < teams.length) {
      setCurrentTeamIndex(nextIndex);
      setRoundScore(0);
    } else {
      setCurrentRound((prevRound) => prevRound + 1);
      setCurrentTeamIndex(0);
      setRoundScore(0);
    }
    setIsTimerActive(true);
    skipImage(0);
  };

  const handleCustomTimerChange = (time) => {
    setCustomTimer(Number(time));
  };

  const handlePlayAgain = () => {
    // Clear localStorage
    localStorage.removeItem('charadesGameState');
    
    setIsGameActive(false);
    setCurrentRound(1);
    setCurrentTeamIndex(0);
    setIsTimerActive(false);
    setIsModalOpen(false);
    setIsGameOver(false);
    setRoundScore(0);
    setWinningTeam(null);
  }

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)'
          : 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 50%, #f3e8ff 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{
        width: '100vw',
        height: TOP_BAR_HEIGHT,
        py: 2,
        px: { xs: 2, md: 0 },
        background: isDarkMode
          ? 'linear-gradient(90deg, #6d28d9 0%, #a78bfa 100%)'
          : 'linear-gradient(90deg, #c4b5fd 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src="/eye-face.png" alt="Charades Icon" style={{ width: 40, height: 40, objectFit: 'contain', marginRight: 8 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: 1,
              color: isDarkMode ? '#fff' : '#312e81',
              textShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.18)' : '0 2px 8px rgba(139,92,246,0.08)',
              userSelect: 'none',
            }}
          >
            Charades!
          </Typography>
        </Box>
        <Box sx={{
          position: 'absolute',
          right: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Tooltip title="Settings">
            <IconButton
              onClick={openSettings}
              sx={{
                background: 'linear-gradient(45deg, #6b7280, #4b5563)',
                color: 'white',
                width: 36,
                height: 36,
                p: 0,
                minWidth: 0,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(107, 114, 128, 0.2)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
                }
              }}
            >
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Container maxWidth={false} disableGutters sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'flex-start' },
        justifyContent: 'center',
        height: { xs: `calc(100vh - ${TOP_BAR_HEIGHT}px)`, md: `calc(100vh - ${TOP_BAR_HEIGHT}px - ${VERTICAL_PADDING * 2}px)` },
        width: '100vw',
        px: { xs: 0, md: 2 },
        py: { xs: 0, md: VERTICAL_PADDING },
        gap: { xs: 2, md: 4 },
        boxSizing: 'border-box',
        position: 'relative',
      }}>
        {/* Left Panel */}
        <Box sx={{
          width: { xs: '100%', md: 340, lg: 380 },
          minWidth: 260,
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: { xs: 2, md: 0 },
          zIndex: 2,
          height: '100%',
        }}>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <TeamsManager teams={teams} setTeams={setTeams} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <ModernCard sx={{ flexShrink: 0 }}>
              <ModernCardContent sx={{ p: 1, gap: 0.5 }}>
                <Timer
                  key={timerKey}
                  onTimeUp={handleTimerEnd}
                  onTimerChange={handleCustomTimerChange}
                  initialTime={customTimer}
                  isActive={isTimerActive}
                />
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                  <Button
                    variant="contained"
                    disabled={teams.length === 0 || isGameActive}
                    onClick={startGame}
                    fullWidth
                    size="small"
                    sx={{
                      background: 'linear-gradient(45deg, #10b981, #059669)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      py: 0.5,
                      minHeight: 32,
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                      }
                    }}
                  >
                    Start Game
                  </Button>
                  <IconButton
                    onClick={() => setIsTimerActive((prev) => !prev)}
                    size="small"
                    sx={{
                      background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                      }
                    }}
                  >
                    {isTimerActive ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                  </IconButton>
                  <IconButton
                    onClick={restart}
                    size="small"
                    sx={{
                      background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:disabled': {
                        background: 'rgba(0,0,0,0.1)',
                        color: 'rgba(0,0,0,0.3)'
                      }
                    }}
                  >
                    <RestartAlt fontSize="small" />
                  </IconButton>
                </Box>
              </ModernCardContent>
            </ModernCard>
          </Box>
        </Box>
        {/* Main Game Area */}
        <Box sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 4,
          boxShadow: 3,
          p: { xs: 1, md: 4 },
          overflow: 'auto',
          zIndex: 1
        }}>
          {isGameActive ? (
            <ModernCardContent sx={{ height: '100%', justifyContent: 'space-between' }}>
              {/* Compact Game Header */}
              <Box sx={{ 
                textAlign: 'center',
                background: isDarkMode 
                  ? 'linear-gradient(45deg, #8b5cf6, #06b6d4)' 
                  : 'linear-gradient(45deg, #c4b5fd, #67e8f9)',
                borderRadius: 2,
                p: 1,
                color: isDarkMode ? 'white' : '#374151',
                mb: 1
              }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Round {currentRound} | {teams[currentTeamIndex]?.name || "No Team"}
                </Typography>
              </Box>

              {/* Compact Game Image */}
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                mb: 1,
                maxHeight: 'calc(100% - 120px)',
                overflow: 'hidden'
              }}>
                <Box
                  component="img"
                  src={shuffledImages[currentImageIndex]}
                  alt="Charades"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    objectFit: 'contain'
                  }}
                />
              </Box>

              {/* Compact Game Controls */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 1
              }}>
                <Tooltip title="Previous Image">
                  <IconButton
                    onClick={previousImage}
                    sx={{
                      background: 'linear-gradient(45deg, #6b7280, #4b5563)',
                      color: 'white',
                      width: 40,
                      height: 40,
                      boxShadow: '0 2px 8px rgba(107, 114, 128, 0.3)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(107, 114, 128, 0.4)',
                      }
                    }}
                  >
                    <UndoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Correct! (+1 Point)">
                  <IconButton
                    onClick={nextImage}
                    sx={{
                      background: 'linear-gradient(45deg, #10b981, #059669)',
                      color: 'white',
                      width: 40,
                      height: 40,
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                      }
                    }}
                  >
                    <Check fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Skip (-1 Point)">
                  <IconButton
                    onClick={() => skipImage(-1)}
                    sx={{
                      background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                      color: 'white',
                      width: 40,
                      height: 40,
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                      }
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </ModernCardContent>
          ) : (
            <ModernCardContent sx={{ 
              height: '100%', 
              justifyContent: 'center', 
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                🎭 Ready to Play?
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Add teams and click "Start Game" to begin!
              </Typography>
              <Box
                sx={{
                  fontSize: '3rem',
                  opacity: 0.6,
                  transition: 'opacity 0.3s ease',
                  '&:hover': {
                    opacity: 1
                  }
                }}
              >
                🎬
              </Box>
            </ModernCardContent>
          )}
        </Box>
      </Container>

      {/* Game Modal */}
      <Modal
        isOpen={isModalOpen}
        isGameOver={isGameOver}
        winningTeam={winningTeam}
        onNextTeam={nextTeam}
        nextTeam={teams[(currentTeamIndex + 1) % teams.length]?.name}
        roundScore={roundScore}
        onGameOver={handlePlayAgain}
        currentRound={currentRound}
        numOfRounds={numOfRounds}
        setNumOfRounds={setNumOfRounds}
        teams={teams}
        updateScore={updateScore}
      />

      {/* Settings Modal */}
      <Dialog 
        open={isSettingsOpen} 
        onClose={closeSettings}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: isDarkMode 
              ? 'rgba(15, 23, 42, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 700
        }}>
          ⚙️ Game Settings
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Rounds Setting */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Number of Rounds
              </Typography>
              <Box sx={{ px: 1 }}>
                <Typography gutterBottom sx={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 500,
                  textAlign: 'center',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 65, 81, 0.8)'
                }}>
                  {numOfRounds} rounds
                </Typography>
                <Slider
                  value={numOfRounds}
                  step={1}
                  marks
                  min={2}
                  max={10}
                  onChange={(e, value) => setNumOfRounds(value)}
                  sx={{
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
                      height: 20,
                      width: 20,
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: 'rgba(139, 92, 246, 0.5)',
                      height: 4,
                    },
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.75rem',
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 65, 81, 0.6)'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Timer Setting */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Timer Duration
              </Typography>
              <Box sx={{ px: 1 }}>
                <Typography gutterBottom sx={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 500,
                  textAlign: 'center',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 65, 81, 0.8)'
                }}>
                  {customTimer} seconds
                </Typography>
                <Slider
                  value={customTimer}
                  step={30}
                  marks
                  min={30}
                  max={180}
                  onChange={(e, value) => handleCustomTimerChange(value)}
                  disabled={isTimerActive}
                  sx={{
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
                      height: 20,
                      width: 20,
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: 'rgba(139, 92, 246, 0.5)',
                      height: 4,
                    },
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.75rem',
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 65, 81, 0.6)'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Theme Setting */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Theme
              </Typography>
              <Button
                variant="outlined"
                onClick={toggleTheme}
                fullWidth
                startIcon={isDarkMode ? <LightMode /> : <DarkMode />}
                sx={{
                  borderColor: 'rgba(139, 92, 246, 0.5)',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 65, 81, 0.8)',
                  '&:hover': {
                    borderColor: 'rgba(139, 92, 246, 0.7)',
                    background: 'rgba(139, 92, 246, 0.1)',
                  }
                }}
              >
                Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
              </Button>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button 
            onClick={closeSettings}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #a78bfa, #22d3ee)',
              }
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharadesGame;
