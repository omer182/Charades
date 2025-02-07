import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";

const GameModeSelector = ({ gameMode, setGameMode }) => {
  return (
    <FormControl fullWidth>
      <Select value={gameMode} onChange={(e) => setGameMode(e.target.value)}>
        <MenuItem value="random">
          <div>
            <Typography variant="body1">Unhinged Mode 🐒</Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>(Random)</Typography>
          </div>
        </MenuItem>
        <MenuItem value="genre">
          <div>
            <Typography variant="body1">Genre Snob Mode 🎬</Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>(Genre)</Typography>
          </div>
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default GameModeSelector;
