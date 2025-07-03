import React, { useState, useEffect } from 'react';
import './Timer.css';
import { Box, Typography, LinearProgress, Chip, Button } from "@mui/material";
import { AccessTime } from "@mui/icons-material";

const Timer = ({ initialTime, onTimeUp, onTimerChange, isActive }) => {
  const [time, setTime] = useState(initialTime);
  const [isTimerActive, setIsTimerActive] = useState(isActive);
  const [timer, setTimer] = useState(initialTime);

  useEffect(() => {
    setIsTimerActive(isActive);
  }, [isActive]);

  useEffect(() => {
    setTime(initialTime);
    setTimer(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let timerInterval;
    if (isTimerActive && time > 0) {
      timerInterval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsTimerActive(false);
      if (onTimeUp) {
        setTime(timer)
        onTimeUp();
      }
    }
    return () => clearInterval(timerInterval);
  }, [initialTime, isTimerActive, time, onTimeUp, timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const getProgressColor = () => {
    const percentage = (time / timer) * 100;
    if (percentage > 60) return '#10b981'; // Green
    if (percentage > 30) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getTimeColor = () => {
    const percentage = (time / timer) * 100;
    if (percentage > 60) return 'success.main';
    if (percentage > 30) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box sx={{ 
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 2,
      p: 1.5,
      border: '1px solid rgba(139, 92, 246, 0.2)',
      backdropFilter: 'blur(8px)'
    }}>
      {/* Time Display */}
      <Box sx={{ textAlign: 'center', mb: 1.5 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #1e293b, #334155)',
            color: getTimeColor(),
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 800,
            padding: { xs: '18px 28px', md: '24px 40px' },
            borderRadius: 2,
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.3)",
            fontFamily: "monospace",
            mb: 1,
            border: `2px solid ${getProgressColor()}40`,
            transition: 'all 0.3s ease',
            minWidth: 120
          }}
        >
          {formatTime(time)}
        </Box>
        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={(time / timer) * 100}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${getProgressColor()}, ${getProgressColor()}CC)`,
              borderRadius: 3,
              transition: 'all 0.3s ease'
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default Timer;
