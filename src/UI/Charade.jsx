import React, { useState, useEffect } from "react";
import "./Charade.css";
import Timer from "./Components/Timer/Timer";
import qr from '../assets/qr.svg'
import logo from '../assets/logo2.png'
import {Button, Slider, Typography} from "@mui/material";
import UndoIcon from '@mui/icons-material/Undo';
import {Check, Close, RestartAlt} from "@mui/icons-material";
import Modal from "./Components/Modal/Modal";
import TeamsManager from "./Components/TeamsManager/TeamsManager";

const importAll = (r) => r.keys().map(r);

const images = importAll(require.context('../../pictures/result', false, /\.(jpg|jpeg|png|gif)$/));

const Card = ({ className, children }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

const CardContent = ({ className, children }) => {
  return <div className={`card-content ${className}`}>{children}</div>;
};

const CharadesGame = () => {
  const [teams, setTeams] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [customTimer, setCustomTimer] = useState(60); // Default 60 seconds
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [roundScore, setRoundScore] = useState(0); // Add roundScore state to track score per round
  const [numOfRounds, setNumOfRounds] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winningTeam, setWinningTeam] = useState(null);

  useEffect(() => {
    const imagePaths = images.map((img) => img); // Extract the image path (Webpack adds `.default`)
    setShuffledImages(shuffleArray(imagePaths));
  }, []);


  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const updateScore = (index, delta) => {
    const updatedTeams = teams.map((team, i) => {
      if (i === index) {
    console.log({team, delta});
        setRoundScore((prevScore) => Math.max(0, prevScore + Number(delta))); // Update the round score
        return { ...team, score: Math.max(0, team.score + Number(delta)) };
      }
      return team;
    });
    setTeams(updatedTeams);
  };

  const nextImage = () => {
    updateScore(currentTeamIndex, 1);
    setCurrentImageIndex((prevIndex) =>
      prevIndex < shuffledImages.length - 1 ? prevIndex + 1 : 0
    );
  };

  const skipImage = (delta) => {
    updateScore(currentTeamIndex, delta);
    setCurrentImageIndex((prevIndex) =>
      prevIndex < shuffledImages.length - 1 ? prevIndex + 1 : 0
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : shuffledImages.length - 1
    );
  };

  const startGame = () => {
    if (teams.length === 0) {
      alert("Please add at least one team before starting the game.");
      return;
    }
    setIsGameActive(true);
    setIsTimerActive(true);
    setCurrentImageIndex(0);
  };

  const restart = () => {
    setIsGameActive(false);
    setCurrentRound(1);
    setCurrentTeamIndex(0);
    setTeams([]);
    setCustomTimer(60);
    setIsTimerActive(false);
    setIsModalOpen(false);
    setShuffledImages(shuffleArray(images.map((img) => img)));
    setIsGameOver(false);
    setNumOfRounds(5);
  }

  const handleGameOver = () => {
      const winningTeam = teams.reduce((prev, current) =>
          prev.score > current.score ? prev : current
      );

      setWinningTeam(winningTeam);
      setIsGameOver(true);
      setIsModalOpen(true); // Open modal instead of using alert
  };


  const handleTimerEnd = () => {
    setIsTimerActive(false); // Stop the timer

    if (currentRound === numOfRounds && currentTeamIndex === teams.length - 1) {
      handleGameOver();
    } else {
      setIsModalOpen(true);
    }
  }

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextTeam = () => {
    closeModal();
    const nextIndex = currentTeamIndex + 1;

    if (nextIndex < teams.length) {
      // Move to the next team
      setCurrentTeamIndex(nextIndex);
      setRoundScore(0);
    } else {
      // All teams have played, advance to the next round
      setCurrentRound((prevRound) => prevRound + 1);
      setCurrentTeamIndex(0);
      setRoundScore(0);
    }
    setIsTimerActive(true); // Start the timer for the next team
    skipImage(0); // Skip to the next image
  };

  const handleCustomTimerChange = (time) => {
    setCustomTimer(Number(time)); // Update the timer for the game
  };

  const handlePlayAgain = () => {
    setIsGameActive(false);
    setCurrentRound(1);
    setCurrentTeamIndex(0);
    setIsTimerActive(false);
    setIsModalOpen(false);
    setIsGameOver(false);
  }

  return (
    <div className="charades-game">
      <div className="top-bar">
        {/*<h1 className="game-title">Charades</h1>*/}
        <img
            className="logo"
            src={logo}
            alt="logo"
        />
        <img
            className="qr"
            src={qr}
            alt="qr"
            onClick={() => setIsQrModalOpen(true)} // Open the modal
            style={{cursor: "pointer"}} // Indicate clickable behavior
        />
      </div>
      <div className="game">
        <div className="left-panel">
          <TeamsManager teams={teams} setTeams={setTeams} />
          <div className='game-settings'>
            <Card>
              <Typography id="discrete-slider" gutterBottom>
                  Number of Rounds: {numOfRounds}
              </Typography>
              <Slider
                  aria-label="Custom marks"
                  defaultValue={numOfRounds}
                  disabled={isGameActive}
                  step={1}
                  marks={true}
                  sx={{ color: '#1ba7de'}}
                  min={2}
                  max={10}
                  onChange={(e, value) => setNumOfRounds(value)}
              />
            </Card>
            <div className="timer-section">
              <Timer
                onTimeUp={handleTimerEnd}
                onTimerChange={handleCustomTimerChange}
                initialTime={customTimer}
                isActive={isTimerActive}
              />
              <div className={"game-buttons"}>
                <Button
                    sx={{
                        background: 'linear-gradient(135deg, #a1c76d 30%, #6a9f36 90%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #8aa756 30%, #4e7b2a 90%)'
                        },
                    }}
                    disabled={teams.length === 0 || isGameActive}
                    onClick={startGame}
                    // color='success'
                    variant='contained'
                    className={'game-buttons button'}
                >
                  Start
                </Button>
                <Button
                    disabled={!isGameActive}
                    onClick={restart}
                    variant='contained'
                    sx={{ backgroundColor: '#1ba7de'}}
                    className={'game-buttons button'}
                >
                  <RestartAlt/>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Card className="game-card">
          {isGameActive && (
              <CardContent className="game-card-content">
                <div className="game-header">
                  <h3 className="section-title">Round {currentRound}</h3>
                  <h3>
                    Current Team:{" "}
                    <strong>{teams[currentTeamIndex]?.name || "No Team"}</strong>
                  </h3>
                </div>
                <img
                  src={shuffledImages[currentImageIndex]}
                  alt="Charades"
                  className="charades-image"
                />
                <div className="image-controls">
                  <Button
                      sx={{ backgroundColor: '#1ba7de'}}
                      size='large' variant='contained' onClick={previousImage}>
                    <UndoIcon />
                  </Button>
                  {/*<Button variant='contained' onClick={previousImage}>Previous</Button>*/}
                  <Button size='large' variant='contained' color='success' onClick={nextImage}>
                    <Check />
                  </Button>
                  <Button
                      size='large' variant='contained' color='error' onClick={() => skipImage(-1)}>
                    <Close />
                  </Button>
                </div>
              </CardContent>
            )}
        </Card>
      </div>
      <Modal
        isOpen={isModalOpen}
        isGameOver={isGameOver}
        winningTeam={winningTeam}
        onNextTeam={nextTeam}
        nextTeam={teams[(currentTeamIndex + 1) % teams.length]?.name}
        roundScore={roundScore}
        onGameOver={handlePlayAgain}
      />
      {isQrModalOpen && (
          <div className="qr-modal">
            <button className="close-button" onClick={() => setIsQrModalOpen(false)}>
              X
            </button>
            <img src={qr} alt="Enlarged QR Code" className="enlarged-qr" />
          </div>
      )}
    </div>
  );
};

export default CharadesGame;
