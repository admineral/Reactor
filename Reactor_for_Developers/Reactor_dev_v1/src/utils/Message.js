import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { BeatLoader } from 'react-spinners';

const Message = ({ message, applyCode, isSandpackLoading }) => (
  <Box my={1} style={{ wordWrap: "break-word" }}>
    <Box
      p={2}
      bgcolor={message.sender === "ChatGPT" ? "#545454" : "#007BFF"}
      color={message.sender === "ChatGPT" ? "#FFFFFF" : "white"}
      borderRadius={16}
      display="inline-block"
      maxWidth="70%"
    >
      <Typography variant="body2">{message.text}</Typography>
    </Box>
    {message.sender === "ChatGPT" && (
      <Box display="flex" alignItems="center">
        {!message.isError && message.isLoading && !message.isFullResponseReady && (
          <BeatLoader color="#007BFF" size={10} margin={2} />
        )}
        {!message.isError && !message.isLoading && message.isFullResponseReady && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => applyCode(message.extractedCode)}
            style={{ marginLeft: "1rem", marginTop: "0.5rem", backgroundColor: "#007BFF", color: "white" }}
            disabled={!message.extractedCode || isSandpackLoading}
          >
            Apply Code
          </Button>
        )}
      </Box>
    )}
    {message.isError && (
      <Typography variant="body2" color="error" style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>
        {message.text}
      </Typography>
    )}
  </Box>
);

export default Message;
