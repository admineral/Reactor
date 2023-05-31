import React, { useState, useEffect } from "react";
import { Box, TextField, Button } from "@mui/material";

// other imports...
import { initialCode } from "./utils/InitialCode";
import { fetchChatGptResponseTurbo } from './utils/callChatGptApi_turbo';
import SandpackComponent from "./utils/SandpackComponent";




function App() {

  const [code, setCode] = useState(initialCode);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [previousCode, setPreviousCode] = useState("");
  const chatHistoryRef = React.useRef(null);
  const windowHeight = window.innerHeight;
  const chatboxHeight = 200;

  const applyCode = (newCode) => {
    if (newCode) {
      setPreviousCode(code);
      setCode(newCode);
    }
  };
  const revertCode = () => {
    if (previousCode) {
      setCode(previousCode);
      setPreviousCode("");
    } else {
      alert("No previous code to revert to.");
    }
  };




  const handleChatSubmit = async (e) => {
      e.preventDefault();
      setMessages([...messages, { sender: "user", text: chatInput }]);
      setChatInput("");
      setIsWaitingForResponse(true);

      try {
        let buffer = "";
        let stopStreaming = false;
        let previousBuffer = "";

        const updateUI = (content) => {
            if (stopStreaming) {
              return;
            }

            buffer += content;

            // Look for "{__CodeStart__}" 
            const answerEndCodeStartIndex = buffer.indexOf('{__CodeStart__}');

            // If '{__CodeStart__} is in buffer, trim the buffer and set stopStreaming to true
            if (answerEndCodeStartIndex !== -1) {
              buffer = buffer.substring(0, answerEndCodeStartIndex);
              stopStreaming = true;
            }

            // Only update the UI if the buffer has changed
            if (buffer !== previousBuffer) {
              previousBuffer = buffer;

              setMessages((prevMessages) => {
                const lastMessageIndex = prevMessages.length - 1;
                const lastMessage = prevMessages[lastMessageIndex];

                if (lastMessage?.sender === "ChatGPT") {
                  const updatedMessages = [...prevMessages];
                  updatedMessages[lastMessageIndex] = {
                    ...lastMessage,
                    text: buffer,
                    isResponseReady: stopStreaming,
                  };
                  return updatedMessages;
                } else {
                  return [
                    ...prevMessages,
                    {
                      sender: "ChatGPT",
                      text: buffer,
                      isResponseReady: stopStreaming,
                    },
                  ];
                }
              });
            }
          };

        const response = await fetchChatGptResponseTurbo(code, chatInput, updateUI);
        const extractedCode = response.code;

        // At this point, check the last message in the UI and append the extractedCode
        setMessages((prevMessages) => {
            const lastMessageIndex = prevMessages.length - 1;
            const lastMessage = prevMessages[lastMessageIndex];

            if (lastMessage?.sender === "ChatGPT") {
              const updatedMessages = [...prevMessages];
              updatedMessages[lastMessageIndex] = {
                ...lastMessage,
                extractedCode,
                isResponseReady: true,
              };
              return updatedMessages;
            }
          });

        // after fetchChatGptResponseTurbo has completed
        setIsWaitingForResponse(false);
      } catch (error) {
        setIsWaitingForResponse(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "ChatGPT",
            text: `An error occurred: ${error.message}`,
            isError: true,
            
          },
        ]);
      }
    };





  useEffect(() => {
    if (chatHistoryRef.current) {
      const { scrollHeight } = chatHistoryRef.current;
      chatHistoryRef.current.scrollTo(0, scrollHeight);
    }
  }, [messages]);


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <SandpackComponent
        code={code}
        setCode={setCode}
        updateCode={setCode}
        revertCode={revertCode}
        windowHeight={windowHeight}
        chatboxHeight={chatboxHeight}
      />
      <Box
        display="flex"
        flexDirection="column"
        height={chatboxHeight}
        border={1}
        borderColor="grey.300"
      >
        <Box flexGrow={1} p={1} overflow="auto" style={{ maxHeight: "calc(100% - 56px)" }} ref={chatHistoryRef}>
          {messages.map((message, index) => (
            <div key={index} style={{ marginBottom: "0.5rem" }}>
              {message.sender === "ChatGPT" && (
                <>
                  <strong>ChatGPT: </strong>
                  {message.text}
                  {!message.isError && message.isResponseReady && (
                    <>
                      <Button

                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => applyCode(message.extractedCode)}
                        style={{ marginLeft: "1rem" }}
                        disabled={!message.extractedCode} 
                      >
                        Apply Code

                      </Button>
                    </>
                  )}
                  {message.isError && (
                    <pre style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>
                      {message.text}
                    </pre>
                  )}
                </>
              )}
              {message.sender !== "ChatGPT" && (
                <>
                  <strong>{message.sender}: </strong>
                  {message.text}
                </>
              )}
            </div>
          ))}


          {isWaitingForResponse && (!messages[messages.length - 1]?.extractedCode || messages[messages.length - 1]?.sender !== 'ChatGPT')&& (
            <div>
              <strong>ChatGPT:</strong> thinking...
            </div>
          )}
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
            />
             <Button type="submit" variant="contained" color="primary" style={{ marginLeft: "1rem" }} disabled={isWaitingForResponse}>
              Send
            </Button>
          </Box>
        </form>
      </Box>
    </div>
  );
}

export default App;

