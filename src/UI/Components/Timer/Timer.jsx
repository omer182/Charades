import React, { useState, useEffect } from 'react';
import './Timer.css';
import {Box, Button, Slider} from "@mui/material"; // Import the CSS file
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {Pause} from "@mui/icons-material";

const Card = ({ className, children }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

const Timer = ({ initialTime, onTimeUp, onTimerChange, isActive }) => {
  const [time, setTime] = useState(initialTime); // Set the initial time
  const [isTimerActive, setIsTimerActive] = useState(isActive);
  const [timer, setTimer] = useState(initialTime); // Default 60 seconds

  useEffect(() => {
    setIsTimerActive(isActive); // Update the timer state when isActive changes
  }, [isActive]);

  useEffect(() => {
    setTime(initialTime); // Reset the timer when initialTime changes
    setTimer(initialTime); // Reset the timer when initialTime changes
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
        onTimeUp(); // Trigger the callback when time is up
      }
    }
    return () => clearInterval(timerInterval);
  }, [initialTime, isTimerActive, time, onTimeUp]);

  const pauseTimer = () => setIsTimerActive(!isTimerActive);
  const resetTimer = () => {
    setTime(initialTime);
    setTimer(initialTime);
    setIsTimerActive(false);
  }

  const handleCustomTimerChange = (value) => {
    if (!isNaN(value) && value > 0) {
      setTime(Number(value));
      setTimer(Number(value));
      if (onTimerChange) onTimerChange(Number(value)); // Notify the parent of the time change
    }
  };

    const handleSliderChange = (event, value) => {
    setTime(value);
    setTimer(value);
    }

    // Convert time to MM:SS format
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
    };

  return (
    <Card className="timer-container">
      <Box
          sx={{
            display: "inline-block",
            backgroundColor: "#222",
            color: "#fff",
            fontSize: "32px",
            fontWeight: "bold",
            padding: "10px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            fontFamily: "monospace",
            mb: '10px'
          }}
      >
        {formatTime(time)}
      </Box>
      <div className="timer-controls">
        <Button
            disabled={!isActive}
            color={isTimerActive ? 'error' : 'success'}
            variant="contained"
            onClick={pauseTimer}
            sx={{ padding: '2px 6px', minWidth: 'auto' }}
        >
          {isTimerActive ? <Pause /> : <PlayArrowIcon />}
        </Button>
        <Button
            variant="contained"
            onClick={resetTimer}
            color="primary"
            sx={{
                background: "linear-gradient(90deg, #55c5f2, #1ba7de, #0a75a6)",
                padding: '2px 6px',
                minWidth: 'auto'
            }}
        >
          Reset
        </Button>
      </div>
      <div className="timer-input-container" >
        <div className='timer-slider'>
          <Slider
              aria-label="Timer"
              defaultValue={60}
              value={timer}
              valueLabelDisplay="auto"
              size='small'
              step={30}
              marks={true}
              color="primary"
              min={30}
              max={120}
              onChange={handleSliderChange}
          />
        </div>
        {/*<input*/}
        {/*    value={timer}*/}
        {/*    onFocus={(event) => event.target.select()}*/}
        {/*    onChange={(e) => handleCustomTimerChange(e.target.value)}*/}
        {/*    className="input"*/}
        {/*    placeholder="Set Timer"*/}
        {/*/>*/}
      </div>
    </Card>
  );
};

export default Timer;
