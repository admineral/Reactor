import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Select, MenuItem } from "@mui/material";

// other imports...
import { initialCode } from "./utils/InitialCode";
import { fetchChatGptResponseTurbo } from './utils/callChatGptApi_turbo';
import { fetchChatGptResponse } from './utils/callChatGptApi';
import SandpackComponent from "./utils/SandpackComponent";

function App() {
  const [code, setCode] = useState(initialCode);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [previousCode, setPreviousCode] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt3.5-turbo");
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

  const toggleFullResponse = (index) => {
    setMessages((messages) =>
      messages.map((message, i) => {
        if (i === index) {
          return { ...message, showFullResponse: !message.showFullResponse };
        } else {
          return message;
        }
      })
    );
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setMessages([...messages, { sender: "user", text: chatInput, showFullResponse: false }]);
    setChatInput("");
    setIsWaitingForResponse(true);
    try {
      let chatGptResponse;
      let apiResponse;
      let extractedCode = null;
      let extractedAnswer = null;
      if (selectedModel === "gpt3.5-turbo") {
        const response = await fetchChatGptResponseTurbo(code, chatInput);
        chatGptResponse = response.answer;
        apiResponse = response.apiResponse;
        extractedCode = response.code;
        extractedAnswer = response.extractedAnswer;
      } else {
        chatGptResponse = await fetchChatGptResponse(code, chatInput);
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "ChatGPT",
          text: chatGptResponse,
          showFullResponse: false,
          extractedCode,
          apiResponse,
          extractedAnswer,
        },
      ]);
      setIsWaitingForResponse(false);
      if (extractedAnswer) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "ChatGPT",
            text: extractedAnswer,
            showFullResponse: false,
            extractedCode: null,
            apiResponse: null,
            isExtractedAnswer: true,
          },
        ]);
      }
    } catch (error) {
      setIsWaitingForResponse(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "ChatGPT",
          text: `An error occurred: ${error.message}`,
          isError: true,
          showFullResponse: false,
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

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

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
                  {!message.isError && (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => applyCode(message.extractedCode)}
                        style={{ marginLeft: "1rem" }}
                      >
                        Apply Code
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => toggleFullResponse(index)}
                        style={{ marginLeft: "0.5rem" }}
                      >
                        {message.showFullResponse ? "Hide Full Response" : "Show Full Response"}
                      </Button>
                      {message.showFullResponse && (
                        <>
                          <pre style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>
                            {message.text}
                          </pre>
                          {message.apiResponse && (
                            <pre style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>
                              {JSON.stringify(message.apiResponse, null, 2)}
                            </pre>
                          )}
                        </>
                      )}
                      {!message.showFullResponse && message.isExtractedAnswer && (
                        <pre style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>
                          {message.text}
                        </pre>
                      )}
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


          {isWaitingForResponse && (
            <div>
              <strong>ChatGPT:</strong> thinking...
            </div>
          )}
        </Box>
        <form onSubmit={handleChatSubmit}>
          <Box display="flex" p={1} alignItems="center">
            <Select value={selectedModel} onChange={handleModelChange} style={{ marginRight: "8px" }}>
              <MenuItem value="gpt3.5-turbo">GPT-3.5 Turbo</MenuItem>
              <MenuItem value="text-davinci-003">Text Davinci</MenuItem>
            </Select>
            <TextField
              fullWidth
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              variant="outlined"
              size="small"
              label="Type your message"
            />
            <Button type="submit" variant="contained" color="primary" style={{ marginLeft: "1rem" }}>
              Send
            </Button>
          </Box>
        </form>
      </Box>
    </div>
  );
}

export default App;

