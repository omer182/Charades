import React, { useState, useEffect } from 'react';
import './Timer.css'; // Import the CSS file

const Timer = ({ initialTime, onTimeUp, onTimerChange, isActive }) => {
  const [time, setTime] = useState(initialTime); // Set the initial time
  const [isTimerActive, setIsTimerActive] = useState(isActive);

  console.log(isTimerActive)
  useEffect(() => {
    setIsTimerActive(isActive); // Update the timer state when isActive changes
  }, [isActive]);

  useEffect(() => {
    setTime(initialTime); // Reset the timer when initialTime changes
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
  const resetTimer = () => setTime(initialTime);

  const handleCustomTimerChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && value > 0) {
      setTime(Number(value));
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
        <input
          type="number"
          value={time}
          onChange={handleCustomTimerChange}
          className="input"
          placeholder="Set Timer"
        />
      </div>
    </div>
  );
};

export default Timer;
