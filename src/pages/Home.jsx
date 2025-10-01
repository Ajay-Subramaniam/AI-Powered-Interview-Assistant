import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
        sx={{ fontSize: { xs: "1.8rem", md: "2.5rem" } }}
      >
        AI-Powered Interview Assistant
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mt: 4,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/interviewee")}
          sx={{ minWidth: 160 }}
        >
          Interviewee
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          size="large"
          onClick={() => navigate("/interviewer")}
          sx={{ minWidth: 160 }}
        >
          Interviewer
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
