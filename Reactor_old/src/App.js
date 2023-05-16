import React, { useState, useEffect } from "react";
import { LiveProvider, LiveEditor, LivePreview, LiveError } from "react-live";
import Draggable from "react-draggable";
import { AppBar, Box, TextField, Toolbar, IconButton, Typography, Button, Grid, Container } from "@mui/material";
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import styled from '@emotion/styled';

const API_KEY = process.env.REACT_APP_API_KEY;

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
  const chatHistoryRef = React.useRef(null);
  const windowHeight = window.innerHeight;
  const chatboxHeight = 200;

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

  const toggleFullResponse = (index) => {
    setMessages(messages.map((message, i) => {
      if(i === index) {
        return {...message, showFullResponse: !message.showFullResponse};
      } else {
        return message;
      }
    }));
  };

  const onDrag = (e, ui) => {
    const newWidth = ui.node.previousSibling.clientWidth + ui.deltaX;
    setEditorWidth(`${newWidth}px`);
  };

  const callChatGptApi = async (prompt) => {
    try {
      const formattedPrompt = `I am using react-live with AceEditor to build a web application. My current code is:\n${code}\n\nUser: ${prompt}\n\nChatGPT, please provide me the code to achieve this, answer with full code:`;

      const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt: formattedPrompt,
          max_tokens: 2000,
          n: 1,
          stop: null,
          temperature: 0.5,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        const chatGptResponse = data.choices[0].text.trim();
        setMessages(prevMessages => [...prevMessages, { sender: 'ChatGPT', text: chatGptResponse, showFullResponse: false }]);
        setIsWaitingForResponse(false);
      }
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      setIsWaitingForResponse(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setMessages([...messages, { sender: "user", text: chatInput, showFullResponse: false }]);
    setChatInput("");
    setIsWaitingForResponse(true);
    await callChatGptApi(chatInput);
  };

  const liveComponentStyle = {
    height: '100%',
    overflow: 'auto',
  };
  
  useEffect(() => {
    if (chatHistoryRef.current) {
      const { scrollHeight } = chatHistoryRef.current;
      chatHistoryRef.current.scrollTo(0, scrollHeight);
    }
  }, [messages]);


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ display: "flex", height: windowHeight - chatboxHeight }}>
        <div id="editor" style={{ width: editorWidth, position: "relative" }}>
          <LiveProvider code={code} scope={{ 
              React, 
              useState, 
              useEffect, 
              AppBar, 
              Box, 
              TextField, 
              Toolbar, 
              IconButton, 
              Typography, 
              Button, 
              Grid, 
              Container,
              Drawer, List, ListItem, ListItemText,
              styled 
            }}
          >
            <LiveEditor onChange={setCode} style={liveComponentStyle} />
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
          </LiveProvider>
        </div>
        <Box
          display="flex"
          flex={1}
          border={1}
          borderColor="grey.300"
          overflow="auto"
        >
          <LiveProvider code={code} scope={{ 
              React, 
              useState, 
              useEffect, 
              AppBar, 
              Box, 
              TextField, 
              Toolbar, 
              IconButton, 
              Typography, 
              Button, 
              Grid, 
              Container,
              Drawer, List, ListItem, ListItemText,
              styled 
            }}
          >
            <LivePreview style={liveComponentStyle}/>
            <LiveError />
          </LiveProvider>
        </Box>
      </div>
      <Box display="flex" flexDirection="column" height={chatboxHeight} border={1} borderColor="grey.300">
        <Box flexGrow={1} p={1} overflow="auto" style={{ maxHeight: "calc(100% - 56px)" }} ref={chatHistoryRef}>
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
                    onClick={() => toggleFullResponse(index)}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    {message.showFullResponse ? "Hide Full Response" : "Show Full Response"}
                  </Button>
                  {message.showFullResponse && (
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





