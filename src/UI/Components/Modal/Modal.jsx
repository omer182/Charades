import React, { useState, useEffect } from 'react';
import { 
    Button, 
    Box, 
    Typography, 
    Backdrop, 
    Fade, 
    Paper,
    CircularProgress,
    Chip,
    Stack,
    TextField
} from '@mui/material';
import { 
    EmojiEvents, 
    Timer as TimerIcon, 
    Groups,
    PlayArrow,
    Replay
} from '@mui/icons-material';
import './Modal.css';

const Modal = ({ isOpen, isGameOver, winningTeam, nextTeam, roundScore, onNextTeam, onGameOver, currentRound, numOfRounds, setNumOfRounds }) => {
    const [countdown, setCountdown] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleReadyClick = () => {
        setCountdown(3);
    };

    useEffect(() => {
        if (countdown !== null) {
            if (countdown === 0) {
                onNextTeam();
                setCountdown(null);
            } else {
                const interval = setInterval(() => {
                    setCountdown(prev => prev - 1);
                }, 1000);

                return () => clearInterval(interval);
            }
        }
    }, [countdown, onNextTeam]);

    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: 2000,
                backdropFilter: 'blur(12px)',
                background: 'rgba(0, 0, 0, 0.8)'
            }}
            open={isOpen}
        >
            <Fade in={isOpen} timeout={500}>
                <Paper
                    sx={{
                        position: 'relative',
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 4,
                        p: { xs: 3, md: 5 },
                        textAlign: 'center',
                        minWidth: { xs: 300, md: 450 },
                        maxWidth: { xs: '90vw', md: 500 },
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        color: 'white'
                    }}
                >
                    {isGameOver ? (
                        <Box>
                            {/* Game Over Content */}
                            <Box sx={{ mb: 4 }}>
                                <EmojiEvents 
                                    sx={{ 
                                        fontSize: { xs: 64, md: 80 },
                                        color: '#f59e0b',
                                        mb: 2,
                                        filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3))',
                                        animation: 'bounce 2s infinite'
                                    }} 
                                />
                                <Typography 
                                    variant="h3" 
                                    sx={{ 
                                        fontWeight: 800,
                                        mb: 3,
                                        background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    Game Over!
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Chip
                                    label="🏆 WINNER 🏆"
                                    sx={{
                                        background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        mb: 2,
                                        px: 2,
                                        py: 1
                                    }}
                                />
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: winningTeam?.color || '#f59e0b',
                                        mb: 1,
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    {winningTeam?.name}
                                </Typography>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontWeight: 600
                                    }}
                                >
                                    Final Score: {winningTeam?.score}
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                onClick={onGameOver}
                                size="large"
                                startIcon={<Replay />}
                                sx={{
                                    background: 'linear-gradient(45deg, #10b981, #059669)',
                                    borderRadius: 3,
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #34d399, #10b981)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
                                    }
                                }}
                            >
                                Play Again
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            {/* Show round info with correct numbers */}
                            {typeof currentRound === 'number' && typeof numOfRounds === 'number' && (
                                <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 1 }}>
                                    Round {currentRound} of {numOfRounds}
                                </Typography>
                            )}
                            {/* Only show last round warning if it's the last round */}
                            {typeof currentRound === 'number' && typeof numOfRounds === 'number' && currentRound === numOfRounds && (
                                <Typography variant="h6" sx={{ color: 'warning.main', mt: 2, textAlign: 'center' }}>
                                    ⚠️ This is the last round for this team!
                                </Typography>
                            )}

                            {/* Round End Content */}
                            <Box sx={{ mb: 4 }}>
                                <TimerIcon 
                                    sx={{ 
                                        fontSize: { xs: 56, md: 72 },
                                        color: '#ef4444',
                                        mb: 2,
                                        filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3))'
                                    }} 
                                />
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        fontWeight: 700,
                                        mb: 3,
                                        background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    Time's Up!
                                </Typography>
                            </Box>

                            <Stack spacing={3} sx={{ mb: 4 }}>
                                {/* Round Score */}
                                <Box>
                                    <Chip
                                        label="Round Score"
                                        size="small"
                                        sx={{
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            color: 'white',
                                            mb: 1
                                        }}
                                    />
                                    <Typography 
                                        variant="h3" 
                                        sx={{ 
                                            fontWeight: 800,
                                            color: roundScore > 0 ? '#10b981' : '#6b7280',
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {roundScore}
                                    </Typography>
                                </Box>

                                {/* Next Team */}
                                <Box>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        gap: 1,
                                        mb: 1
                                    }}>
                                        <Groups sx={{ color: '#667eea' }} />
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: 'rgba(255, 255, 255, 0.8)',
                                                fontWeight: 600
                                            }}
                                        >
                                            Up Next:
                                        </Typography>
                                    </Box>
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            fontWeight: 700,
                                            color: '#667eea',
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {nextTeam}
                                    </Typography>
                                </Box>
                            </Stack>

                            {/* Ready Button / Countdown */}
                            {countdown !== null ? (
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            fontWeight: 600
                                        }}
                                    >
                                        Starting in...
                                    </Typography>
                                    <Box sx={{ position: 'relative' }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={(countdown / 3) * 100}
                                            size={80}
                                            thickness={6}
                                            sx={{
                                                color: '#667eea',
                                                '& .MuiCircularProgress-circle': {
                                                    strokeLinecap: 'round',
                                                }
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                        >
                                            <Typography 
                                                variant="h3" 
                                                sx={{ 
                                                    fontWeight: 800,
                                                    color: '#667eea',
                                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                                }}
                                            >
                                                {countdown}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleReadyClick}
                                    size="large"
                                    startIcon={<PlayArrow />}
                                    sx={{
                                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                        borderRadius: 3,
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(103, 126, 234, 0.4)'
                                        }
                                    }}
                                >
                                    Ready to Continue
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Add some CSS animations */}
                    <style>
                        {`
                            @keyframes bounce {
                                0%, 20%, 50%, 80%, 100% {
                                    transform: translateY(0);
                                }
                                40% {
                                    transform: translateY(-10px);
                                }
                                60% {
                                    transform: translateY(-5px);
                                }
                            }
                        `}
                    </style>
                </Paper>
            </Fade>
        </Backdrop>
    );
};

export default Modal;
