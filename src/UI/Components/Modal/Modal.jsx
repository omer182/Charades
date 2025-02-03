import React, { useState, useEffect } from 'react';
import { Button, Card } from '@mui/material';

const Modal = ({ isOpen, nextTeam, roundScore, onNextTeam }) => {
    const [countdown, setCountdown] = useState(null);  // State for countdown
    const [, setTimer] = useState(null);  // Timer state

    // Function to handle "Ready" button click
    const handleReadyClick = () => {
        setCountdown(3);  // Start countdown from 3
    };

    // Effect to run the countdown
    useEffect(() => {
        if (countdown !== null) {
            if (countdown === 0) {
                onNextTeam();  // Trigger onNextTeam when countdown reaches 0
                setCountdown(null);  // Reset countdown
            } else {
                const interval = setInterval(() => {
                    setCountdown(prev => prev - 1);
                }, 1000);

                setTimer(interval);  // Store the interval so it can be cleared later
                return () => clearInterval(interval);  // Clear interval when component unmounts or countdown changes
            }
        }
    }, [countdown, onNextTeam]);

    return isOpen ? (
        <div className="overlay">
            <Card className="modal">
                <div className="modal-content">
                    <h2>Time is Up!</h2>
                    <h3>Round Score: {roundScore}</h3>
                    <h3>Up Next: {nextTeam}</h3>
                </div>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleReadyClick}
                >
                    {countdown !== null ? countdown : 'Ready'}  {/* Show countdown or 'Ready' */}
                </Button>
            </Card>
        </div>
    ) : null;
};

export default Modal;
