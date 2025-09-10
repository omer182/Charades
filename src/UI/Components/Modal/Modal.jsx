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
    TextField,
    IconButton,
    Divider
} from '@mui/material';
import { 
    EmojiEvents, 
    Timer as TimerIcon, 
    Groups,
    PlayArrow,
    Replay,
    Add as AddIcon,
    Remove as RemoveIcon
} from '@mui/icons-material';
import './Modal.css';

const Modal = ({ isOpen, isGameOver, winningTeam, nextTeam, roundScore, onNextTeam, onGameOver, currentRound, numOfRounds, setNumOfRounds, teams, updateScore }) => {
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

    // Sort teams by score (highest first)
    const sortedTeams = teams ? [...teams].sort((a, b) => b.score - a.score) : [];

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
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        width: '100vw',
                        height: '100vh',
                        position: 'relative',
                        flexDirection: { xs: 'column', md: 'row' }
                    }}
                >
                    {/* Team Scores Modal - Left Side */}
                    {!isGameOver && teams && teams.length > 0 && (
                        <Paper
                            sx={{
                                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: 3,
                                p: { xs: 2.25, md: 3 },
                                textAlign: 'center',
                                minWidth: { xs: 225, md: 280 },
                                maxWidth: { xs: '75vw', md: 320 },
                                maxHeight: '75vh',
                                overflow: 'auto',
                                boxShadow: '0 15px 45px rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                position: { xs: 'static', md: 'absolute' },
                                left: { xs: 'auto', md: 20 },
                                top: { xs: 'auto', md: 20 },
                                transform: { xs: 'none', md: 'none' }
                            }}
                        >
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 700,
                                    mb: 2,
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }}
                            >
                                Current Standings
                            </Typography>
                            <Stack spacing={0.75} sx={{ maxHeight: 400, overflow: 'auto' }}>
                                {sortedTeams.map((team, index) => (
                                    <Box
                                        key={team.name}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: `linear-gradient(45deg, ${team.color}25, ${team.color}15)`,
                                            borderLeft: `3px solid ${team.color}`,
                                            borderRadius: 1.5,
                                            p: 1.125,
                                            position: 'relative'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            {/* Position Badge */}
                                            <Box
                                                sx={{
                                                    width: 18,
                                                    height: 18,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: index === 0 ? 'linear-gradient(45deg, #f59e0b, #d97706)' :
                                                               index === 1 ? 'linear-gradient(45deg, #6b7280, #4b5563)' :
                                                               index === 2 ? 'linear-gradient(45deg, #cd7f32, #b8860b)' :
                                                               'rgba(255, 255, 255, 0.2)',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    fontSize: '0.6rem'
                                                }}
                                            >
                                                {index + 1}
                                            </Box>
                                            
                                            {/* Team Name */}
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: 600,
                                                    color: 'white',
                                                    textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                                                }}
                                            >
                                                {team.name}
                                            </Typography>
                                        </Box>
                                        
                                        {/* Score and Controls */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => updateScore(teams.findIndex(t => t.name === team.name), -1)}
                                                sx={{
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    color: '#ef4444',
                                                    width: 18,
                                                    height: 18,
                                                    '&:hover': {
                                                        background: 'rgba(239, 68, 68, 0.3)',
                                                    }
                                                }}
                                            >
                                                <RemoveIcon sx={{ fontSize: 12 }} />
                                            </IconButton>
                                            
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    fontWeight: 700,
                                                    color: team.color,
                                                    minWidth: 30,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {team.score}
                                            </Typography>
                                            
                                            <IconButton
                                                size="small"
                                                onClick={() => updateScore(teams.findIndex(t => t.name === team.name), 1)}
                                                sx={{
                                                    background: 'rgba(16, 185, 129, 0.2)',
                                                    color: '#10b981',
                                                    width: 18,
                                                    height: 18,
                                                    '&:hover': {
                                                        background: 'rgba(16, 185, 129, 0.3)',
                                                    }
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

                    {/* Main Modal - Center */}
                    <Paper
                        sx={{
                            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 3,
                            p: { xs: 2.25, md: 3.75 },
                            textAlign: 'center',
                            minWidth: { xs: 225, md: 337 },
                            maxWidth: { xs: '75vw', md: 450 },
                            maxHeight: '75vh',
                            overflow: 'auto',
                            boxShadow: '0 15px 45px rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            position: { xs: 'static', md: 'absolute' },
                            left: { xs: 'auto', md: '50%' },
                            top: { xs: 'auto', md: '50%' },
                            transform: { xs: 'none', md: 'translate(-50%, -50%)' }
                        }}
                    >
                    {isGameOver ? (
                        <Box>
                            {/* Game Over Content */}
                            <Box sx={{ mb: 4 }}>
                                <EmojiEvents 
                                    sx={{ 
                                        fontSize: { xs: 48, md: 60 },
                                        color: '#f59e0b',
                                        mb: 1.5,
                                        filter: 'drop-shadow(0 3px 6px rgba(245, 158, 11, 0.3))',
                                        animation: 'bounce 2s infinite'
                                    }} 
                                />
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        fontWeight: 800,
                                        mb: 2.25,
                                        background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        textShadow: '1.5px 1.5px 3px rgba(0,0,0,0.3)'
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
                                        fontSize: { xs: 42, md: 54 },
                                        color: '#ef4444',
                                        mb: 1.5,
                                        filter: 'drop-shadow(0 3px 6px rgba(239, 68, 68, 0.3))'
                                    }} 
                                />
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontWeight: 700,
                                        mb: 2.25,
                                        background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        textShadow: '1.5px 1.5px 3px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    Time's Up!
                                </Typography>
                            </Box>

                            <Stack spacing={2.25} sx={{ mb: 3 }}>
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
                                        variant="h4" 
                                        sx={{ 
                                            fontWeight: 800,
                                            color: roundScore > 0 ? '#10b981' : '#6b7280',
                                            textShadow: '1.5px 1.5px 3px rgba(0,0,0,0.3)'
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
            </Box>
            </Fade>
        </Backdrop>
    );
};

export default Modal;
