import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    Divider
  } from "@mui/material";
  import CloseIcon from '@mui/icons-material/Close';
  
  export default function ChatHistoryDialog({ open, onClose, messages }) {
  

  
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Chat History
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: "80%",
                  p: 1,
                  borderRadius: 2,
                  bgcolor: msg.sender === "user" ? "primary.main" : "grey.300",
                  color: msg.sender === "user" ? "white" : "black",
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    );
  }
  