import React, { useState, useEffect } from 'react';
import {Button} from '@mui/material';
import './Modal.css';

const Modal = ({ isOpen, isGameOver, winningTeam, nextTeam, roundScore, onNextTeam, onGameOver }) => {
    const [countdown, setCountdown] = useState(null);

    const handleReadyClick = () => {
        setCountdown(3);
    };

    useEffect(() => {
        if (countdown !== null) {
            if (countdown === 0) {
                onNextTeam();  // Trigger onNextTeam when countdown reaches 0
                setCountdown(null);  // Reset countdown
            } else {
                const interval = setInterval(() => {
                    setCountdown(prev => prev - 1);
                }, 1000);

                return () => clearInterval(interval);  // Clear interval when component unmounts or countdown changes
            }
        }
    }, [countdown, onNextTeam]);

    return isOpen ? (
        <div className="overlay">
            <div className="modal">
                <div className="modal-content">
                    {isGameOver ? (
                        <>
                            <h2>Game Over!</h2>
                            <h3>Winning Team: {winningTeam?.name}</h3>
                            <h3>Final Score: {winningTeam?.score}</h3>
                        </>
                    ) : (
                        <>
                            <h2>Time is Up!</h2>
                            <h3>Round Score: {roundScore}</h3>
                            <h3>Up Next: {nextTeam}</h3>
                        </>
                    )}
                </div>
                <Button
                    variant="contained"
                    sx={{
                        background: 'linear-gradient(135deg, #a1c76d 30%, #6a9f36 90%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #8aa756 30%, #4e7b2a 90%)'
                        },
                        width: '120px'
                    }}
                    onClick={isGameOver ? onGameOver : handleReadyClick}
                >
                    {isGameOver ? 'Play Again' : (countdown !== null ? countdown : 'Ready')}
                </Button>
            </div>
        </div>
    ) : null;
};

export default Modal;
