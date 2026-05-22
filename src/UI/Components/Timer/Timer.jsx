import React, { useState, useEffect, useMemo } from 'react';
import './Timer.css';
import { Box, Typography, LinearProgress } from '@mui/material';

const Timer = ({ initialTime, onTimeUp, isActive, accentColor = '#c6ff3d' }) => {
  const [time, setTime] = useState(initialTime);
  const [isTimerActive, setIsTimerActive] = useState(isActive);
  const [duration, setDuration] = useState(initialTime);

  const tickAudio = useMemo(() => {
    try {
      const sampleRate = 44100;
      const length = sampleRate * 0.08;
      const frequency = 880;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = audioContext.createBuffer(1, length, sampleRate);
      const data = audioBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        const envelope = Math.exp(-i / (sampleRate * 0.03));
        data[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.3 * envelope;
      }
      return { audioContext, audioBuffer };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => { setIsTimerActive(isActive); }, [isActive]);

  useEffect(() => {
    setTime(initialTime);
    setDuration(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isTimerActive || time <= 0) return undefined;
    const id = setInterval(() => {
      setTime((prev) => {
        const next = prev - 1;
        if (next <= 10 && next > 0 && tickAudio) {
          try {
            const source = tickAudio.audioContext.createBufferSource();
            source.buffer = tickAudio.audioBuffer;
            source.connect(tickAudio.audioContext.destination);
            source.start();
          } catch (e) {
            // ignore audio failures
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isTimerActive, time, tickAudio]);

  useEffect(() => {
    if (time === 0 && isTimerActive) {
      setIsTimerActive(false);
      if (onTimeUp) {
        setTime(duration);
        onTimeUp();
      }
    }
  }, [time, isTimerActive, onTimeUp, duration]);

  const minutes = Math.floor(time / 60);
  const secs = time % 60;
  const percentage = duration > 0 ? (time / duration) * 100 : 0;

  const urgencyColor =
    percentage > 60 ? accentColor :
    percentage > 30 ? '#ff8a3d' :
                      '#ff3d8a';

  const isCritical = percentage <= 30 && isTimerActive;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
        <Typography
          sx={{
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: 'rgba(244,244,248,0.45)',
            textTransform: 'uppercase',
          }}
        >
          Time remaining
        </Typography>
        {isTimerActive && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: isCritical ? '#ff3d8a' : 'rgba(244,244,248,0.4)',
              textTransform: 'uppercase',
            }}
          >
            <Box
              sx={{
                width: 6, height: 6, borderRadius: '50%',
                background: isCritical ? '#ff3d8a' : '#c6ff3d',
                animation: 'pulse-soft 1.2s ease-in-out infinite',
              }}
            />
            Live
          </Box>
        )}
      </Box>

      <Box
        sx={{
          textAlign: 'center',
          py: 1,
          position: 'relative',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          fontSize: { xs: '3.4rem', md: '4.2rem' },
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: urgencyColor,
          textShadow: `0 0 28px ${urgencyColor}80, 0 0 60px ${urgencyColor}40`,
          fontVariantNumeric: 'tabular-nums',
          transition: 'color 0.3s ease, text-shadow 0.3s ease',
          animation: isCritical ? 'pulse-soft 0.8s ease-in-out infinite' : 'none',
        }}
      >
        {minutes}
        <Box component="span" sx={{ opacity: 0.5, mx: 0.25 }}>:</Box>
        {secs < 10 ? `0${secs}` : secs}
      </Box>

      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 4,
          borderRadius: 999,
          mt: 1,
          backgroundColor: 'rgba(255,255,255,0.06)',
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${urgencyColor}, ${urgencyColor}99)`,
            borderRadius: 999,
            boxShadow: `0 0 12px ${urgencyColor}80`,
            transition: 'transform 0.6s linear, background 0.3s ease',
          },
        }}
      />
    </Box>
  );
};

export default Timer;
