import React, { useState } from "react";
import {
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    IconButton,
    Box,
    Stack, Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#33FFF5"]; // Cycle through colors

const TeamsManager = ({ teams, setTeams }) => {
    const [newTeamName, setNewTeamName] = useState("");
    const [error, setError] = useState(false);

    const addTeam = () => {
        if (teams.length >= 6) {
            setError(true);
            return;
        }

        if (newTeamName.trim() !== "") {
            const color = colors[teams.length % colors.length]; // Assign a cycling color
            setTeams([...teams, { name: newTeamName, score: 0, color }]);
            setNewTeamName("");
            setError(false); // Reset error if adding is successful
        }
    };

    const removeTeam = (index) => {
        const updatedTeams = teams.filter((_, i) => i !== index);
        setTeams(updatedTeams);
        setError(false);
    };

    const updateScore = (index, delta) => {
        const updatedTeams = teams.map((team, i) =>
            i === index ? { ...team, score: Math.max(0, team.score + delta) } : team
        );
        setTeams(updatedTeams);
    };

    return (
        <Box sx={{ borderRadius: 5 }}>
            {/* Add Team Section */}
            <Card>
                <CardContent>
                    <Typography variant="h6" textAlign='center'>Teams</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            label="Team Name"
                            variant="outlined"
                            value={newTeamName}
                            size='small'
                            onChange={(e) => setNewTeamName(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={addTeam}
                            disabled={teams.length >= 6}
                        >
                            <AddCircleIcon/>
                        </Button>
                    </Stack>
                </CardContent>
            <Divider variant="middle" />
            {/* Team List */}
            {teams.length > 0 && (
                <CardContent>
                    <Stack spacing={2}>
                        {teams.map((team, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    borderLeft: `6px solid ${team.color}`,
                                    p: 2,
                                    height: 12,
                                    borderRadius: 1,
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                <Typography variant="body1">{team.name}</Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent='flex-end'>

                                    <IconButton size='small' onClick={() => updateScore(index, -1)}>
                                        <RemoveIcon />
                                    </IconButton>
                                    <Typography variant="h6">{team.score}</Typography>
                                    <IconButton size='small'  onClick={() => updateScore(index, 1)}>
                                        <AddCircleIcon/>
                                    </IconButton>
                                    <IconButton color="error" onClick={() => removeTeam(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </CardContent>
            )}
            </Card>
        </Box>
    );
};

export default TeamsManager;
