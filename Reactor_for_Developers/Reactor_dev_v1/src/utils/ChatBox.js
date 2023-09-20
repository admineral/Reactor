import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, IconButton, Snackbar } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import Message from './Message';
import UndoIcon from '@mui/icons-material/Undo';

const ChatBox = ({ code, setCode, isSandpackLoading, addDependency, dependencies }) => {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const chatHistoryRef = useRef(null);
  const [codeHistory, setCodeHistory] = useState([code]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessages([...messages, { sender: "user", text: chatInput }]);
    setChatInput("");
    console.log("Chat submitted to server");

    try {
      const rawResponse = await fetch('/api/chatGpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          chatInput
        })
      });

      if (!rawResponse.ok) {
        throw new Error(`Server responded with ${rawResponse.status}`);
      }

      console.log("Received response from server");
      const reader = rawResponse.body.getReader();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const textChunk = new TextDecoder("utf-8").decode(value);
        textBuffer += textChunk;
        
        console.log("Received chunk from server:", textChunk);
      }

      // Here, further process the final textBuffer, extract code, dependencies, etc.
      console.log("Final textBuffer received:", textBuffer);

    } catch (error) {
      console.error("Error while processing chat:", error);
      setSnackbarMessage('Something went wrong!');
      setSnackbarOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyCode = (extractedCode) => {
    if (extractedCode) {
      setCodeHistory([...codeHistory, extractedCode]); // add new code to history
      setCode(extractedCode);
    }
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      const { scrollHeight } = chatHistoryRef.current;
      chatHistoryRef.current.scrollTo(0, scrollHeight);
    }
  }, [messages]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={380}
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
        {messages.map((message, index) => <Message key={index} message={message} applyCode={applyCode} isSandpackLoading={isSandpackLoading} />)}
      </Box>
      <form onSubmit={handleChatSubmit}>
        <Box display="flex" p={1} alignItems="center" mt={1}>
                  <IconButton onClick={revertCode} style={{ color: "#007BFF", marginRight: "1rem" }} disabled={codeHistory.length <= 1}>
            <UndoIcon />
          </IconButton>
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
