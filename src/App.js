import React, { useState, useEffect } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/theme-monokai";
import { TextField, Box, Button } from "@mui/material";
import axios from "axios";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import Draggable from "react-draggable";

const API_KEY = "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";

const initialCode = `
function LandingPage() {
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleButtonClick = () => {
    setButtonClicked(true);
  };

  const containerStyle = {
    backgroundImage: 'linear-gradient(to right, #6a11cb, #2575fc)',
    minHeight: 'calc(100vh - 200px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2rem',
    color: 'white',
  };

  const buttonStyle = {
    background: 'white',
    color: 'blue',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: '1rem',
  };

  return (
    <div style={containerStyle}>
      <h1>Welcome to Our Website</h1>
      <p>
        We provide top-notch services and solutions for our customers. Explore our offerings and find the best fit for your needs!
      </p>
      <button onClick={handleButtonClick} style={buttonStyle}>
        {buttonClicked ? 'Thanks for clicking!' : 'Learn More'}
      </button>
    </div>
  );
}
`;

function App() {
  const [code, setCode] = useState(initialCode);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [previousCode, setPreviousCode] = useState("");



  const [editorWidth, setEditorWidth] = useState('50%');

  const [showFullResponse, setShowFullResponse] = useState(false);

  const applyCode = (newCode) => {
  setPreviousCode(code);
  setCode(newCode);
  };
  
  const revertCode = () => {
    if (previousCode) {
      setCode(previousCode);
      setPreviousCode("");
    } else {
      alert("No previous code to revert to.");
    }
  };



  const toggleFullResponse = () => {
    setShowFullResponse(!showFullResponse);
  };


  const onDrag = (e, ui) => {
    const newWidth = ui.node.previousSibling.clientWidth + ui.deltaX;
    setEditorWidth(`${newWidth}px`);
  };

  const callChatGptApi = async (prompt) => {
    try {
      const formattedPrompt = `I am using react-live with AceEditor to build a web application. My current code is:\n${code}\n\nUser: ${prompt}\n\nChatGPT, please provide me the code to achieve this, answer with full code:`;

      const response = await axios.post(
        'https://api.openai.com/v1/engines/text-davinci-003/completions',
        {
          prompt: formattedPrompt,
          max_tokens: 2000,
          n: 1,
          stop: null,
          temperature: 0.5,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
        }
      );

      if (response.data.choices && response.data.choices.length > 0) {
        const chatGptResponse = response.data.choices[0].text.trim();
        setMessages([...messages, { sender: 'ChatGPT', text: chatGptResponse }]);
        // Update the code based on the ChatGPT response
        // You can add logic to parse the response and update the code accordingly
        setIsWaitingForResponse(false);
      }
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      setIsWaitingForResponse(false);
    }
  };


  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setMessages([...messages, { sender: "user", text: chatInput }]);
    setChatInput("");
    setIsWaitingForResponse(true);
    await callChatGptApi(chatInput);
  };


  const windowHeight = window.innerHeight;
  const chatboxHeight = 200;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ display: "flex", height: windowHeight - chatboxHeight }}>
        <div id="editor" style={{ width: editorWidth, position: "relative" }}>
          <AceEditor
            mode="jsx"
            theme="monokai"
            fontSize={14}
            value={code}
            onChange={setCode}
            width="100%"
            height="100%"
          />
          <Draggable axis="x" onDrag={onDrag}>
            <div
              style={{
                cursor: "col-resize",
                width: "10px",
                height: "100%",
                backgroundColor: "gray",
                zIndex: 1,
                position: "absolute",
                top: 0,
                right: "-5px",
              }}
            />
          </Draggable>
        </div>
        <Box
          display="flex"
          flex={1}
          border={1}
          borderColor="grey.300"
          overflow="auto"
        >
          <LiveProvider code={code} scope={{ React, useState, useEffect }}>
            <LivePreview />
            <LiveError />
          </LiveProvider>
        </Box>
      </div>
      <Box display="flex" flexDirection="column" height={chatboxHeight} border={1} borderColor="grey.300" overflow="auto">
        <Box flexGrow={1} p={1}>
          {messages.map((message, index) => (
            <div key={index} style={{ marginBottom: "0.5rem" }}>
              <strong>{message.sender}:</strong>
              {message.sender !== "ChatGPT" && message.text}
              {message.sender === "ChatGPT" && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => applyCode(message.text)}
                    style={{ marginLeft: "1rem" }}
                  >
                    Apply Code
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={toggleFullResponse}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    {showFullResponse ? "Hide Full Response" : "Show Full Response"}
                  </Button>
                  {showFullResponse && (
                    <pre style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>
                      {message.text}
                    </pre>
                  )}
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
          <Box display="flex" p={1}>
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
  <Button
    variant="contained"
    color="secondary"
    style={{ marginLeft: "1rem" }}
    onClick={revertCode}
  >
    Revert Code
  </Button>
</Box>
        </form>
      </Box>
    </div>
  );

}

export default App;





