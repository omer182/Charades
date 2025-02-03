import React, { useState, useEffect } from 'react';
import './Timer.css';
import { Button } from "@mui/material"; // Import the CSS file
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
        setTime(initialTime)
        onTimeUp(); // Trigger the callback when time is up
      }
    }
    return () => clearInterval(timerInterval);
  }, [initialTime, isTimerActive, time, onTimeUp]);

  const pauseTimer = () => setIsTimerActive(!isTimerActive);
  const resetTimer = () => {
    setTime(initialTime);
    setIsTimerActive(false);
  }

  const handleCustomTimerChange = (value) => {
    if (!isNaN(value) && value > 0) {
      setTime(Number(value));
      setTimer(Number(value));
      if (onTimerChange) onTimerChange(Number(value)); // Notify the parent of the time change
    }
  };

  return (
    <Card className="timer-container">
      <div className="timer-header">Timer</div>
      <div className="timer-display">
        {time}s
      </div>
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
            sx={{ padding: '2px 6px', minWidth: 'auto' }}
        >
          Reset
        </Button>
      </div>
      <div className="timer-input-container" >
        {[30,60,120,180].map((value) => (
        <Button
            variant="outlined"
            sx={{ padding: '2px 6px', minWidth: 'auto' }}
            size='small'
            onClick={() => handleCustomTimerChange(value)}
        >
          {value}
        </Button>
        ))}

        <input
            value={timer}
            onFocus={(event) => event.target.select()}
            onChange={(e) => handleCustomTimerChange(e.target.value)}
            className="input"
            placeholder="Set Timer"
        />
      </div>
    </Card>
  );
};

export default Timer;
