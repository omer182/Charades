import React, { useState } from "react";
import { FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";

const GenreSelector = ({ genres, selectedGenre, setSelectedGenre }) => {
  const [customGenre, setCustomGenre] = useState("");

  const handleGenreChange = (event) => {
    const value = event.target.value;
    if (value === "custom") {
      setSelectedGenre(customGenre || ""); // Use the custom input value
    } else {
      setSelectedGenre(value);
      setCustomGenre(""); // Reset custom input when selecting predefined
    }
  };

  const handleCustomGenreChange = (event) => {
    const value = event.target.value;
    setCustomGenre(value);
    setSelectedGenre(value); // Update selected genre dynamically
  };

  return (
    <FormControl fullWidth>
      <Select value={genres.includes(selectedGenre) ? selectedGenre : "custom"} onChange={handleGenreChange}>
        {genres.map((genre) => (
          <MenuItem key={genre} value={genre}>
            {genre.charAt(0).toUpperCase() + genre.slice(1)}
          </MenuItem>
        ))}
        <MenuItem value="custom">Custom Genre</MenuItem>
      </Select>

      {/* Free text input for custom genres */}
      {(!genres.includes(selectedGenre) || selectedGenre === "custom") && (
        <TextField
          fullWidth
          label="Enter your own genre"
          variant="outlined"
          value={customGenre}
          onChange={handleCustomGenreChange}
          margin="dense"
          autoFocus
        />
      )}
    </FormControl>
  );
};

export default GenreSelector;
