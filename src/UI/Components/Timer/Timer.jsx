import React, { useState, useEffect } from 'react';
import './Timer.css'; // Import the CSS file

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
  }, [isTimerActive, time, onTimeUp]);

  const startTimer = () => setIsTimerActive(true);
  const pauseTimer = () => setIsTimerActive(false);
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
    <div className="timer-container">
      <div className="timer-header">Timer</div>
      <div className="timer-display">
        {time}s
      </div>
      <div className="timer-controls">
        <button onClick={startTimer}>Start</button>
        <button onClick={pauseTimer}>Pause</button>
        <button onClick={resetTimer}>Reset</button>
      </div>
      <div className="timer-input-container">
        <button onClick={() => handleCustomTimerChange(30)}>30</button>
        <button onClick={() => handleCustomTimerChange(60)}>60</button>
        <button onClick={() => handleCustomTimerChange(120)}>120</button>
        <button onClick={() => handleCustomTimerChange(180)}>180</button>

        <input
            // type=""
            value={timer}
            onFocus={(event) => event.target.select()}
            onChange={(e) => handleCustomTimerChange(e.target.value)}
            className="input"
            placeholder="Set Timer"
        />
      </div>
    </div>
  );
};

export default Timer;
