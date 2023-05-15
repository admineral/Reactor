import React, { useState, useEffect } from "react";
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-jsx';
import 'ace-builds/src-noconflict/theme-twilight';
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { AppBar, Box, TextField, Toolbar, IconButton, Typography, Button, Grid, Container } from "@mui/material";
import { Drawer, List, ListItem, ListItemText} from '@mui/material';
import { Input, Tab, Tabs, TabList} from '@mui/material';
import styled from 'styled-components';
import './App.css'
import TabPanel from './Tabs';
import a11yProps from './Tabs';

//import styled components from view
import { ChatBoxContainer, TabContainer, ViewContainerRoot } from "./view";
import { HeaderContainer } from './view';
import { LogoContainer } from './view';
import { LogoText } from './view';
import { LogoImage } from './view';
import { CodeEditorRectangle } from './view';
import { LiveCodeContainer } from "./view";
import { FileNameContainer } from './view';
import { FileNameInputStyle } from './view';
import { FirstRectangle } from './view';
import { SecondRectangle } from './view';
import { ThirdRectangle } from './view';
import { LivePreviewContainer } from "./view";
import { PreviewSectionContainer } from './view';
import { ChatInputStyle } from './view';

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
  const chatboxHeight = 700;

  //setup tabs for preview pane + Chat GPT screen
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


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

      await new Promise((resolve) => setTimeout(resolve, 10));
      if (data.choices && data.choices.length > 0) {
        const chatGptResponse = data.choices[0].text.trim();
        setMessages(prevMessages => [...prevMessages, { sender: 'ChatGPT', text: " " + chatGptResponse, showFullResponse: false }]);
        setIsWaitingForResponse(false);
      }
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      setIsWaitingForResponse(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setMessages([...messages, { sender: "user", text: " " + chatInput, showFullResponse: false }]);
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

  document.body.style.backgroundColor = "#141414";
  document.body.style.margin = "0";
  return (
    <><div>
      <ViewContainerRoot>
      <HeaderContainer>
        <LogoContainer>
          <LogoText>Reactonauts</LogoText>
          <LogoImage src="https://file.rendit.io/n/45hcMBJKBqDxVfYlovlB.png" />
        </LogoContainer>
        <CodeEditorRectangle>
            <FirstRectangle>
            <LiveCodeContainer style={{
                height: '672px',
                width: '100%',
                position: 'relative', // Add this style to enable position adjustment
                top: '20px', // Adjust the top position as needed
              }}>
            <AceEditor
                name="code-editor"
                mode="jsx"
                theme="twilight"
                value={code}
                onChange={setCode}
                borderRadius= '12px'
                boxSizing= 'border-box'
                fontFamily= 'monospace'
                fontSize = "16px"
                width="99.8%"
                height="100%"
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                wrapEnabled={true}
                setOptions={{
                  enableBasicAutocompletion: false,
                  enableLiveAutocompletion: false,
                  enableSnippets: false,
                  showLineNumbers: true,
                  tabSize: 2,
                  }}
              />
              </LiveCodeContainer>
                          
            </FirstRectangle>
          {/* </LiveProvider> */}
          <SecondRectangle />
          <ThirdRectangle />
          <FileNameContainer>
            <Input type = 'text' style={FileNameInputStyle} placeholder="File Name" />
          </FileNameContainer>
        </CodeEditorRectangle>
      </HeaderContainer>
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
          <PreviewSectionContainer>
              <SecondRectangle />
              <ThirdRectangle />
              <TabContainer>
                <Tabs value={value} onChange={handleChange} aria-label="Tabs" TabIndicatorProps={{ style: { backgroundColor: "#90caf9"}}}>
                  <Tab label="Preview" {...a11yProps(0)} sx={{
                          typography: 'Inter',
                          color: 'white',
                          fontFamily: "Inter",
                          '&.Mui-selected': {
                            color: '#90caf9',
                            fontFamily: "Inter"
                          }}}/>
                  <Tab label="Chat GPT" {...a11yProps(1)} sx={{
                          typography: 'Inter',
                          color: 'white',
                          fontFamily: "Inter",
                          '&.Mui-selected': {
                            color: '#90caf9',
                            fontFamily: "Inter"
                          }}} />
                </Tabs>
              </TabContainer>
                
            <TabPanel value={value} index={0}>
              <LivePreviewContainer>
                  <LivePreview style={{ liveComponentStyle }} />
              </LivePreviewContainer>
              <LiveError />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <ChatBoxContainer>
            {/* <Box display="flex" flexDirection="column" height={chatboxHeight} border={1} borderColor="grey.300" overflow="auto"> */}
              <Box flexGrow={1} p={1} overflow="auto" style={{maxHeight: "calc(100% - 56px)" }} ref={chatHistoryRef}>
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
            <Box p={1} style={{ display: 'flex', justifyContent: 'center', placeItems: 'center'}}>
              <Button
                  style={{ padding: 0,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer', }}
                  onClick={revertCode}
                >
                  <img src="https://file.rendit.io/n/mNo3dAabgi5Ose8Uy7Ob.png"
                    alt="Undo Image"
                    style={{
                      height: '25px',
                      width: '25px',
                    }}/>
                </Button>

              <input 
                type="text"
                placeholder="Type a message (ex: make button bigger)"
                style={ChatInputStyle} 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} />

              
              <Button type="submit"  style={{
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                    }}>
                      <img src="https://file.rendit.io/n/q5Axl43rqp5SyWyIcZJ1.png"
                        alt="Send Image"
                        style={{
                          height: '25px',
                          width: '25px',
                        }}
                      />
              </Button>
              
            </Box>
          </form>
          </ChatBoxContainer>
            </TabPanel>
            </PreviewSectionContainer>
      </LiveProvider>
      
    </ViewContainerRoot>
    </div>

    {/* <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
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
                  }} />
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
              <LivePreview style={liveComponentStyle} />
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
                label="Type your message" />
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
      </div> */}
    </>
  );
}

export default App;





