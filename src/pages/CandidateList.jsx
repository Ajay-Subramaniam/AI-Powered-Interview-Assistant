import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import dayjs from "dayjs";
import { getAllInterviewees } from "../utils/indexDb";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CandidateList = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    async function fetchInterviewees() {
      const data = await getAllInterviewees();
      setCandidates(data);
    }
    fetchInterviewees()
  }, []);

  const sortedCandidates = candidates
    .filter((c) =>
      c.profile?.name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let aVal, bVal;

      switch (sortKey) {
        case "name":
          aVal = a.profile.name.toLowerCase();
          bVal = b.profile.name.toLowerCase();
          break;
        case "score":
          aVal = a.totalScore || 0;
          bVal = b.totalScore || 0;
          break;
        case "addedAt":
          aVal = new Date(a.addedAt);
          bVal = new Date(b.addedAt);
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

  const handleSortChange = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box
          display="flex"
          gap={2}
          mb={2}
          flexWrap="wrap"
          alignItems="center"
        >
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ minWidth: 'auto' }}
          >
            Back
          </Button>

          <TextField
            size="small"
            placeholder="Search candidate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250 }}
          />
        </Box>


        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortKey === "name"}
                    direction={sortKey === "name" ? sortOrder : "asc"}
                    onClick={() => handleSortChange("name")}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortKey === "score"}
                    direction={sortKey === "score" ? sortOrder : "asc"}
                    onClick={() => handleSortChange("score")}
                  >
                    Score
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortKey === "addedAt"}
                    direction={sortKey === "addedAt" ? sortOrder : "asc"}
                    onClick={() => handleSortChange("addedAt")}
                  >
                    Conducted At
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Profile</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedCandidates.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.profile.name}</TableCell>
                  <TableCell>{c.profile.email}</TableCell>
                  <TableCell align="center">{c.totalScore}</TableCell>
                  <TableCell align="center">
                    {dayjs(c.addedAt).format("YYYY-MM-DD HH:mm")}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/interviewer/${c.id}`)}
                    >
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sortedCandidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No candidates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default CandidateList;
