import React, { useState, useEffect } from "react";
import "./Charade.css";
import Timer from "./Components/Timer/Timer";
import qr from '../assets/qr.svg'
import logo from '../assets/logo.svg'
import {Button} from "@mui/material";
import UndoIcon from '@mui/icons-material/Undo';
import {Check, Close} from "@mui/icons-material";
import Modal from "./Components/Modal/Modal";

const importAll = (r) => r.keys().map(r);

const images = importAll(require.context('../../pictures/result', false, /\.(jpg|jpeg|png|gif)$/));
const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#33FFF5"]; // Add more colors if needed

const Card = ({ className, children }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

const CardContent = ({ className, children }) => {
  return <div className={`card-content ${className}`}>{children}</div>;
};

// const Modal = ({ isOpen, nextTeam, roundScore, onNextTeam }) => {
//   return isOpen ? (
//     <div className="overlay">
//       <Card className="modal">
//         <div className="modal-content">
//           <h2>Time is Up!</h2>
//           <h3>Round Score: {roundScore}</h3>
//           <h3>Up Next: {nextTeam}</h3>
//         </div>
//         <Button variant='contained' color='success' onClick={onNextTeam}>Ready</Button>
//       </Card>
//     </div>
//   ) : null
// };

const CharadesGame = () => {
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
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

  const addTeam = () => {
    if (newTeamName.trim() !== "") {
      const color = colors[teams.length % colors.length]; // Cycle through colors
      setTeams([...teams, { name: newTeamName, score: 0, color }]);
      setNewTeamName("");
    }
  };

  const removeTeam = (index) => {
    const updatedTeams = teams.filter((team, i) => i !== index);
    setTeams(updatedTeams);
  }

  const updateScore = (index, delta) => {
    const updatedTeams = teams.map((team, i) => {
      if (i === index) {
    console.log({team, delta});
        setRoundScore((prevScore) => prevScore + Number(delta)); // Update the round score
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
    setNewTeamName("");
    setCustomTimer(60);
    setIsTimerActive(false);
    setIsModalOpen(false);
    setShuffledImages(shuffleArray(images.map((img) => img)));
  }

  const handleTimerEnd = () => {
    setIsModalOpen(true);
    setIsTimerActive(false); // Start the timer for the next team
  };

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
          <div className="teams-section">
            <Card className="team-card">
              <CardContent>
                <h2 className="section-title">Create a Team</h2>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Team Name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="input"
                  />
                  <Button variant='contained' onClick={addTeam}>Add Team</Button>
                </div>
              </CardContent>
            </Card>
            {teams.length > 0 && (
              <Card className="team-list-card">
                <CardContent>
                  <h2 className="section-title">Teams</h2>
                  <ul className="team-list">
                    {teams.map((team, index) => (
                      <li
                          key={index}
                          className="team-item"
                          style={{ borderLeft: `5px solid ${team.color}` }}
                      >
                        <Button color='error' onClick={() => removeTeam(index)}>X</Button>
                        <span className="team-name">{team.name}</span>
                        <div className="score-controls">
                          <Button onClick={() => updateScore(index, -1)}>-</Button>
                          <span className="team-score">{team.score}</span>
                          <Button onClick={() => updateScore(index, 1)}>+</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="timer-section">
            <Timer
              onTimeUp={handleTimerEnd}
              onTimerChange={handleCustomTimerChange}
              initialTime={customTimer}
              isActive={isTimerActive}
            />
            <div className={"game-buttons"}>
              <Button
                  disabled={teams.length === 0}
                  onClick={startGame}
                  color='success'
                  variant='contained'
                  className={'game-buttons button'}
              >
                Start
              </Button>
              <Button
                  disabled={!isGameActive}
                  onClick={restart}
                  variant='contained'
                  className={'game-buttons button'}
              >
                Restart
              </Button>
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
                  <Button  size='large' variant='contained' onClick={previousImage}>
                    <UndoIcon />
                  </Button>
                  {/*<Button variant='contained' onClick={previousImage}>Previous</Button>*/}
                  <Button size='large' variant='contained' color='success' onClick={nextImage}>
                    <Check />
                  </Button>
                  <Button  size='large' variant='contained' color='error' onClick={() => skipImage(-1)}>
                    <Close />
                  </Button>
                </div>
              </CardContent>
            )}
        </Card>
      </div>
      <Modal
        isOpen={isModalOpen}
        onNextTeam={nextTeam}
        nextTeam={teams[(currentTeamIndex + 1) % teams.length]?.name}
        roundScore={roundScore}
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
