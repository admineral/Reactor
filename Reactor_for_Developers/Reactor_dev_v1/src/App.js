//App.js

import React, { useState, useEffect } from "react";
import { Box, TextField, Button } from "@mui/material";
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from "@codesandbox/sandpack-react";
import { monokaiPro } from "@codesandbox/sandpack-themes";

import { autocompletion, completionKeymap } from "@codemirror/autocomplete";

// other imports...
import { initialCode } from "./utils/InitialCode";
import { fetchChatGptResponse } from './utils/callChatGptApi';




function App() {
  const [code, setCode] = useState(initialCode);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [previousCode, setPreviousCode] = useState("");
  const chatHistoryRef = React.useRef(null);
  const windowHeight = window.innerHeight;
  const chatboxHeight = 200;
  const Prompt = `
            I am working on a web application using React. My current code snippet is:

            ${code}

            I need to make the following changes or additions to my code:

            User: ${chatInput} .

            For this, I have the following dependencies installed: 
            "@mui/material, @material-ui/core, @mui/icons-material, @emotion/styled, @material-ui/icons, @emotion/react and "react-router-dom": "^6.11.2"" .
            I would like to use these dependencies to create a modern and visually appealing appearance for my application. 
            ChatGPT, could you provide me with the updated code that incorporates these changes or additions? Respond with full code and add comments to the code, a short description at the beginning, commented out and explaining to a 5 year old with comments in the code:
            `;
       
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

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setMessages([...messages, { sender: "user", text: chatInput, showFullResponse: false }]);
    setChatInput("");
    setIsWaitingForResponse(true);
    try {
      const chatGptResponse = await fetchChatGptResponse(Prompt);
      setMessages(prevMessages => [...prevMessages, { sender: 'ChatGPT', text: chatGptResponse, showFullResponse: false }]);
      setIsWaitingForResponse(false);
    } catch (error) {
      setIsWaitingForResponse(false);
      setMessages(prevMessages => [...prevMessages, { sender: 'ChatGPT', text: `An error occurred: ${error.message}`, isError: true, showFullResponse: false }]);
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

       <SandpackProvider 
      template="react" 
      theme={monokaiPro} 
      files={{
                '/App.js': {code},
               

            }} 
            customSetup={{ 
              dependencies: { 
               "@mui/material": "latest",
               "@material-ui/core": "latest",
               "@mui/icons-material": "latest",
               "@emotion/styled": "latest",
               "@material-ui/icons": "latest",
               "react-router-dom": "latest",
               "@emotion/react": "latest",
               "@mui/styles": "latest",
              
              }
            }}
            code={code}
            updateCode={newCode => setCode(newCode)}
            >

            <SandpackLayout>   
            <SandpackCodeEditor 
        
              style={{ flex: 1 , height: windowHeight - chatboxHeight}} 
              showLineNumbers={true}
              showTabs={true}
              showInlineErrors={true}
              wrapContent={true}
              extensions={[autocompletion()]}
              extensionsKeymap={[completionKeymap]}
              
            />

                
                <SandpackPreview 
                style={{ flex: 1,  height: windowHeight - chatboxHeight}} 
          

                showRefreshButton={true}
                showOpenInCodeSandbox={false}
                
                actionsChildren={
                  <button onClick={revertCode}>
                    Revert Code
                  </button>
                }
                                            
                />
                   
            </SandpackLayout>
      </SandpackProvider>






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
              <strong>{message.sender}:</strong>
              {message.sender !== "ChatGPT" && message.text}
              {message.sender === "ChatGPT" && (
                <>
                  {!message.isError && (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => applyCode(message.text)}
                      style={{ marginLeft: "1rem" }}
                    >
                      Apply Code
                    </Button>
                  )}
                  {message.isError ? (
                    <pre style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>
                      {message.text}
                    </pre>
                  ) : (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => toggleFullResponse(index)}
                      style={{ marginLeft: "0.5rem" }}
                    >
                      {message.showFullResponse ? "Hide Full Response" : "Show Full Response"}
                    </Button>
                  )}
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
            </Box>
          </form>
          </Box>
          </div>
          );
          }

export default App;




