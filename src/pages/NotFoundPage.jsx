import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f9f9f9",
        px: 2,
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: "bold", color: "primary.main" }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 2, color: "text.secondary" }}>
        Oops! The page you are looking for doesn’t exist.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate("/")}
        sx={{ borderRadius: "8px", textTransform: "none" }}
      >
        Go Home
      </Button>
    </Box>
  );
};

export default NotFoundPage;
