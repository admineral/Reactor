import React, { useState, useRef } from "react";
import { Box, TextField, IconButton, Snackbar } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import Message from './Message';

const ChatBox = () => {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const chatHistoryRef = useRef(null);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessages([...messages, { sender: "user", text: chatInput }]);
    console.log("Chat message sent:", chatInput);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: chatInput })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const responseData = await response.json();
      setMessages([...messages, { sender: "user", text: chatInput }, { sender: "ai", text: responseData.message }]);
      console.log("AI response received:", responseData.message);

    } catch (error) {
      console.error("Error during chat processing:", error);
      setSnackbarMessage('Error processing chat. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setIsProcessing(false);
      setChatInput("");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={400}
      bgcolor="#333333"
      boxShadow={2}
      borderRadius={2}
      p={2}
      justifyContent="space-between"
    >
      <Box
        flexGrow={1}
        p={1}
        overflow="auto"
        style={{ maxHeight: "calc(100% - 56px)" }}
        ref={chatHistoryRef}
        bgcolor="#2C2C2C"
        borderRadius={2}
      >
        {messages.map((message, index) => (
          <Message key={index} sender={message.sender} text={message.text} />
        ))}
      </Box>

      <form onSubmit={handleChatSubmit}>
        <Box display="flex" p={1} alignItems="center">
          <TextField
            fullWidth
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            variant="outlined"
            size="small"
            label="Type your message"
            InputProps={{ style: { color: 'white' } }}
            InputLabelProps={{ style: { color: 'white' } }}
          />
          <IconButton type="submit" style={{ color: "#007BFF", marginLeft: "1rem" }} disabled={isProcessing}>
            <SendIcon />
          </IconButton>
        </Box>
      </form>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} />
    </Box>
  );
}

export default ChatBox;
