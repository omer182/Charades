import React, { useState } from "react";
import {
  Button, Card, CardContent, TextField, Typography,
  IconButton, Box, Stack, Zoom,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const NEON_PALETTE = [
  { color: "#c6ff3d", name: "Acid Lime" },
  { color: "#3df0ff", name: "Cyan Pulse" },
  { color: "#ff3d8a", name: "Hot Pink" },
  { color: "#ff8a3d", name: "Tangerine" },
  { color: "#d63dff", name: "Magenta" },
  { color: "#6366f1", name: "Indigo" },
];

const TeamsManager = ({ teams, setTeams, activeTeamIndex = -1 }) => {
  const [newTeamName, setNewTeamName] = useState("");

  const addTeam = () => {
    if (newTeamName.trim() !== "" && teams.length < 6) {
      const palette = NEON_PALETTE[teams.length % NEON_PALETTE.length];
      setTeams([...teams, {
        name: newTeamName.trim(),
        score: 0,
        color: palette.color,
        colorName: palette.name,
      }]);
      setNewTeamName("");
    }
  };

  const removeTeam = (index) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  const updateScore = (index, delta) => {
    setTeams(teams.map((team, i) =>
      i === index ? { ...team, score: Math.max(0, team.score + delta) } : team
    ));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') addTeam();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: 'rgba(244,244,248,0.5)',
              textTransform: 'uppercase',
            }}
          >
            Teams
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: teams.length >= 6 ? '#ff8a3d' : 'rgba(244,244,248,0.4)',
            }}
          >
            {teams.length}<Box component="span" sx={{ color: 'rgba(244,244,248,0.25)' }}>/6</Box>
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            placeholder={teams.length >= 6 ? 'Max teams reached' : 'Add team name'}
            variant="outlined"
            value={newTeamName}
            size="small"
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={teams.length >= 6}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={addTeam}
            disabled={teams.length >= 6 || !newTeamName.trim()}
            sx={{
              minWidth: 44,
              width: 44,
              height: 40,
              p: 0,
              '&.Mui-disabled': {
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(244,244,248,0.25)',
                boxShadow: 'none',
              },
            }}
          >
            <AddCircleIcon fontSize="small" />
          </Button>
        </Stack>
      </CardContent>

      {teams.length > 0 ? (
        <CardContent sx={{ pt: 0, flex: 1, overflow: 'auto', '&:last-child': { pb: 2 } }}>
          <Stack spacing={1}>
            {teams.map((team, index) => {
              const isActive = index === activeTeamIndex;
              return (
                <Zoom in key={`${team.name}-${index}`} timeout={250 + index * 80}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      p: 1.25,
                      borderRadius: 3,
                      position: 'relative',
                      background: isActive
                        ? `linear-gradient(135deg, ${team.color}1f, ${team.color}0a)`
                        : 'rgba(255,255,255,0.025)',
                      border: isActive
                        ? `1px solid ${team.color}55`
                        : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: isActive
                        ? `0 0 24px -6px ${team.color}80, inset 0 1px 0 rgba(255,255,255,0.05)`
                        : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                      transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                      '&:hover': !isActive && {
                        background: `linear-gradient(135deg, ${team.color}12, transparent)`,
                        borderColor: `${team.color}40`,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: team.color,
                          boxShadow: `0 0 10px ${team.color}, 0 0 2px ${team.color}`,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          color: '#f4f4f8',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                        }}
                      >
                        {team.name}
                      </Typography>
                      {isActive && (
                        <Box
                          sx={{
                            ml: 'auto',
                            px: 0.75,
                            py: 0.15,
                            borderRadius: 999,
                            background: `${team.color}22`,
                            border: `1px solid ${team.color}66`,
                            fontSize: '0.58rem',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            color: team.color,
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                            animation: 'pulse-soft 1.8s ease-in-out infinite',
                          }}
                        >
                          On stage
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateScore(index, -1)}
                        sx={{
                          width: 26, height: 26,
                          color: 'rgba(244,244,248,0.5)',
                          '&:hover': { background: 'rgba(255, 61, 138, 0.12)', color: '#ff3d8a' },
                        }}
                      >
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </IconButton>

                      <Typography
                        sx={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: team.score > 0 ? team.color : 'rgba(244,244,248,0.5)',
                          textShadow: team.score > 0 ? `0 0 12px ${team.color}80` : 'none',
                          minWidth: 28,
                          textAlign: 'center',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {team.score}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={() => updateScore(index, 1)}
                        sx={{
                          width: 26, height: 26,
                          color: 'rgba(244,244,248,0.5)',
                          '&:hover': { background: 'rgba(198, 255, 61, 0.12)', color: '#c6ff3d' },
                        }}
                      >
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => removeTeam(index)}
                        sx={{
                          width: 26, height: 26,
                          ml: 0.25,
                          color: 'rgba(244,244,248,0.3)',
                          '&:hover': { background: 'rgba(255, 61, 138, 0.1)', color: '#ff3d8a' },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Zoom>
              );
            })}
          </Stack>
        </CardContent>
      ) : (
        <CardContent sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: '50%',
              mx: 'auto', mb: 1.5,
              border: '1px dashed rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(244,244,248,0.35)',
              fontSize: 20,
            }}
          >
            +
          </Box>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: 'rgba(244,244,248,0.5)',
              fontWeight: 500,
            }}
          >
            Add your first team above.
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default TeamsManager;
