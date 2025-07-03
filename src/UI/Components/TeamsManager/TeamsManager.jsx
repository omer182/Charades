import React, { useState } from "react";
import {
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    IconButton,
    Box,
    Stack,
    Divider,
    Zoom
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const colors = [
    { color: "#8b5cf6", name: "Purple Haze" },
    { color: "#06b6d4", name: "Ocean Blue" },
    { color: "#f59e0b", name: "Golden Sun" },
    { color: "#10b981", name: "Emerald Green" },
    { color: "#ef4444", name: "Cherry Red" },
    { color: "#8b5cf6", name: "Violet Dream" }
];

const TeamsManager = ({ teams, setTeams }) => {
    const [newTeamName, setNewTeamName] = useState("");

    const addTeam = () => {
        if (newTeamName.trim() !== "" && teams.length < 6) {
            const colorData = colors[teams.length % colors.length];
            setTeams([...teams, { 
                name: newTeamName.trim(), 
                score: 0, 
                color: colorData.color,
                colorName: colorData.name 
            }]);
            setNewTeamName("");
        }
    };

    const removeTeam = (index) => {
        const updatedTeams = teams.filter((_, i) => i !== index);
        setTeams(updatedTeams);
    };

    const updateScore = (index, delta) => {
        const updatedTeams = teams.map((team, i) =>
            i === index ? { ...team, score: Math.max(0, team.score + delta) } : team
        );
        setTeams(updatedTeams);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            addTeam();
        }
    };

    return (
        <Card sx={{ 
            backdropFilter: "blur(16px)",
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: 3,
            transition: "box-shadow 0.3s ease",
            '&:hover': {
                boxShadow: "0 8px 25px 0 rgba(31, 38, 135, 0.3)"
            }
        }}>
            {/* Header */}
            <CardContent sx={{ pb: 0.5 }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 1.5,
                    gap: 1
                }}>
                    <GroupsIcon sx={{ 
                        fontSize: 20, 
                        background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }} />
                    <Typography variant="body1" sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Teams
                    </Typography>
                </Box>

                {/* Add Team Section */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                    <TextField
                        label="Team Name"
                        variant="outlined"
                        value={newTeamName}
                        size="small"
                        onChange={(e) => setNewTeamName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={teams.length >= 6}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                color: '#000',
                                '& input': {
                                    color: '#000',
                                },
                                '& fieldset': {
                                    borderColor: 'rgba(139, 92, 246, 0.5)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(139, 92, 246, 0.7)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#8b5cf6',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(55, 65, 81, 0.8)',
                                '&.Mui-focused': {
                                    color: '#8b5cf6',
                                }
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={addTeam}
                        disabled={teams.length >= 6 || !newTeamName.trim()}
                        sx={{
                            minWidth: 40,
                            height: 40,
                            ml: 'auto',
                            background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #a78bfa, #22d3ee)',
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.5)',
                            },
                            '&:disabled': {
                                background: 'rgba(0,0,0,0.1)',
                                color: 'rgba(0,0,0,0.3)',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        <AddCircleIcon fontSize="small" />
                    </Button>
                </Stack>

                {teams.length >= 6 && (
                    <Typography variant="caption" sx={{ 
                        color: 'warning.main', 
                        mt: 0.5, 
                        display: 'block',
                        textAlign: 'center'
                    }}>
                        Maximum 6 teams allowed
                    </Typography>
                )}
            </CardContent>

            {/* Team List */}
            {teams.length > 0 && (
                <>
                    <Divider sx={{ 
                        borderColor: 'rgba(139, 92, 246, 0.2)',
                        mx: 2
                    }} />
                    <CardContent sx={{ pt: 1 }}>
                        <Stack spacing={1}>
                            {teams.map((team, index) => (
                                <Zoom 
                                    key={`${team.name}-${index}`} 
                                    in={true} 
                                    timeout={300 + index * 100}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            background: `linear-gradient(45deg, ${team.color}25, ${team.color}15)`,
                                            borderLeft: `3px solid ${team.color}`,
                                            borderRadius: 2,
                                            p: 1,
                                            transition: "box-shadow 0.3s ease",
                                            '&:hover': {
                                                boxShadow: `0 2px 12px ${team.color}40`
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', textShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                                                {team.name}
                                            </Typography>
                                        </Box>
                                        
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => updateScore(index, -1)}
                                                sx={{
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    color: '#ef4444',
                                                    width: 28,
                                                    height: 28,
                                                    '&:hover': {
                                                        background: 'rgba(239, 68, 68, 0.3)',
                                                    }
                                                }}
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                            
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                gap: 0.5,
                                                minWidth: 35,
                                                justifyContent: 'center'
                                            }}>
                                                {team.score > 0 && (
                                                    <EmojiEventsIcon 
                                                        sx={{ 
                                                            fontSize: 14, 
                                                            color: '#f59e0b' 
                                                        }} 
                                                    />
                                                )}
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        fontWeight: 700,
                                                        color: team.color,
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {team.score}
                                                </Typography>
                                            </Box>
                                            
                                            <IconButton 
                                                size="small" 
                                                onClick={() => updateScore(index, 1)}
                                                sx={{
                                                    background: 'rgba(16, 185, 129, 0.2)',
                                                    color: '#10b981',
                                                    width: 28,
                                                    height: 28,
                                                    '&:hover': {
                                                        background: 'rgba(16, 185, 129, 0.3)',
                                                    }
                                                }}
                                            >
                                                <AddCircleIcon fontSize="small" />
                                            </IconButton>
                                            
                                            <IconButton 
                                                size="small"
                                                onClick={() => removeTeam(index)}
                                                sx={{
                                                    color: '#ef4444',
                                                    width: 28,
                                                    height: 28,
                                                    ml: 0.5,
                                                    '&:hover': {
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                    }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                </Zoom>
                            ))}
                        </Stack>
                    </CardContent>
                </>
            )}

            {teams.length === 0 && (
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <GroupsIcon sx={{ 
                        fontSize: 36, 
                        color: 'rgba(139, 92, 246, 0.4)',
                        mb: 1 
                    }} />
                    <Typography variant="body2" sx={{ 
                        color: 'rgba(55, 65, 81, 0.7)',
                        fontStyle: 'italic'
                    }}>
                        No teams yet. Add your first team!
                    </Typography>
                </CardContent>
            )}
        </Card>
    );
};

export default TeamsManager;
