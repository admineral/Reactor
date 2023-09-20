import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, IconButton, Snackbar } from "@mui/material";
import { fetchChatGptResponseTurbo } from './callChatGptApi_turbo';
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

  const revertCode = () => {
    if (codeHistory.length > 1) {
      const newCodeHistory = [...codeHistory];
      newCodeHistory.pop(); // remove current code
      setCodeHistory(newCodeHistory); // update code history
      setCode(newCodeHistory[newCodeHistory.length - 1]); // set the last code as the current code
    }
  };

  const updateMessage = (buffer) => {
    setMessages((prevMessages) => {
      const lastMessageIndex = prevMessages.length - 1;
      const lastMessage = prevMessages[lastMessageIndex];

      if (lastMessage?.sender === "ChatGPT") {
        const updatedMessages = [...prevMessages];
        updatedMessages[lastMessageIndex] = {
          ...lastMessage,
          text: buffer,
        };
        return updatedMessages;
      } else {
        return [
          ...prevMessages,
          {
            sender: "ChatGPT",
            text: buffer,
            isLoading: true,
            isFullResponseReady: false,
          },
        ];
      }
    });
  }

  const addNewDependencies = (extractedDependencies) => {
    if (extractedDependencies) {
      let newDependencies = extractedDependencies.split("\n");
      newDependencies.forEach(dep => {
        addDependency(dep);
      });
    }
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessages([...messages, { sender: "user", text: chatInput }]);
    setChatInput("");

    let buffer = "";
    let stopStreaming = false;
    let previousBuffer = "";

    const updateUI = (content) => {
      if (stopStreaming) {
        return;
      }

      buffer += content;
      const answerEndCodeStartIndex = buffer.indexOf('{__CodeStart__}');
      if (answerEndCodeStartIndex !== -1) {
        buffer = buffer.substring(0, answerEndCodeStartIndex);
        stopStreaming = true;
      }

      if (buffer !== previousBuffer) {
        previousBuffer = buffer;
        updateMessage(buffer);
      }
    };

    try {
      const responseStream = await fetchChatGptResponseTurbo(code, chatInput, updateUI);

      for await (const chunk of responseStream) {
        updateUI(chunk);
      }

      const response = await responseStream.collect();
      const extractedCode = response.code;
      const extractedDependencies = response.dependencies;

      addNewDependencies(extractedDependencies);

      setMessages((prevMessages) => {
          const lastMessageIndex = prevMessages.length - 1;
          const lastMessage = prevMessages[lastMessageIndex];

          if (lastMessage?.sender === "ChatGPT") {
            const updatedMessages = [...prevMessages];
            updatedMessages[lastMessageIndex] = {
              ...lastMessage,
              extractedCode,
              isLoading: false,
              isFullResponseReady: true,
            };
            return updatedMessages;
          }
        });
    } catch (error) {
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
