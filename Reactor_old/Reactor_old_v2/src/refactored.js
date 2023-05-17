import React, { useState, useEffect } from "react";
import { Box, TextField, Button } from "@mui/material";
import { Sandpack, SandpackProvider, SandpackLayout, SandpackCodeEditor } from "@codesandbox/sandpack-react";
import { monokaiPro } from "@codesandbox/sandpack-themes";

const API_KEY = process.env.REACT_APP_API_KEY;

const initialCode = ``;  //initial code here

const callChatGptApi = async (message, code) => {
  const prompt = `
    I am working on a web application using React. My current code snippet is:

    ${code}

    I need to make the following changes or additions to my code:

    User: ${message} .

    For this, I have the following dependencies installed: "@mui/material, @material-ui/core, @mui/icons-material, @emotion/styled, @material-ui/icons, @emotion/react, react-router-dom" .

    ChatGPT, could you provide me with the updated code that incorporates these changes or additions?
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt,
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
      return chatGptResponse;
    } else {
      console.error("Failed to get a response from ChatGPT");
      return null;
    }
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    return null;
  }
};

// Compound component for ChatBox
function ChatBox({ children, onSendMessage, onApplyCode, onToggleFullResponse, onRevertCode }) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessages([...messages, { sender: "user", text: chatInput, showFullResponse: false }]);
    setChatInput("");
    setIsWaitingForResponse(true);
    await onSendMessage(chatInput, messages, setMessages, setIsWaitingForResponse);
  };

  const handleRevert = () => {
    onRevertCode();
  }

  // Provide context to child components
  const childProps = {
    messages,
    chatInput,
    setChatInput,
    isWaitingForResponse,
    handleSubmit,
    handleRevert,
    applyCode: onApplyCode,
    toggleFullResponse: onToggleFullResponse,
  };

  return (
    <>
      {React.Children.map(children, child => {
        return React.cloneElement(child, { ...childProps });
      })}
    </>
  );
}

ChatBox.Messages = function ChatBoxMessages({ messages, applyCode, toggleFullResponse }) {
  const chatHistoryRef = React.useRef(null);
  useEffect(() => {
    if (chatHistoryRef.current) {
      const { scrollHeight } = chatHistoryRef.current;
      chatHistoryRef.current.scrollTo(0, scrollHeight);
    }
  }, [messages]);
  
  return (
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
    </Box>
  );
};

ChatBox.Input = function ChatBoxInput({ chatInput, setChatInput, handleSubmit }) {
  return (
  <form onSubmit={handleSubmit}>
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
    </form>
  );
};

ChatBox.SendButton = function ChatBoxSendButton({ handleSubmit }) {
  return (
    <Button type="submit" variant="contained" color="primary" style={{ marginLeft: "1rem" }}>
      Send
    </Button>
  );
};

ChatBox.RevertButton = function ChatBoxRevertButton({ handleRevert }) {
  return (
    <Button
      variant="contained"
      color="secondary"
      style={{ marginLeft: "1rem" }}
      onClick={handleRevert}
    >
      Revert Code
    </Button>
  );
};


// Component for CodeEditor using Render Props API
function CodeEditor({ children, code, updateCode, windowHeight, chatboxHeight }) {
  return (
    <SandpackProvider>
      <div style={{ display: "flex", height: windowHeight - chatboxHeight, width: "100%" }}>
        <div id="editor" style={{ position: "relative", flex: 1 }}>
          <SandpackLayout style={{ width: "100%" }}>
            <Sandpack 
              template="react"
              theme={monokaiPro}
              code={code}
              updateCode={updateCode}
              files={{
                "/App.js": {code},
              }}
              options={{ 
                editorHeight: windowHeight - chatboxHeight,
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

               }
             }}
           >
             <SandpackCodeEditor />

           </Sandpack>
         </SandpackLayout>
       </div>
     </div>
   </SandpackProvider>
 );
}

function App() {
  const [code, setCode] = useState(initialCode);
  const [previousCode, setPreviousCode] = useState("");
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

  const toggleFullResponse = (index, messages, setMessages) => {
    setMessages(messages.map((message, i) => {
      if(i === index) {
        return {...message, showFullResponse: !message.showFullResponse};
      } else {
        return message;
      }
    }));
  };

const sendMessage = async (message, messages, setMessages, setIsWaitingForResponse) => {
  setIsWaitingForResponse(true);
  // Call the ChatGPT API with the user's message
  const response = await callChatGptApi(message, code);

  if (response) {
    setMessages([...messages, { sender: 'ChatGPT', text: response, showFullResponse: false }]);
  }
  setIsWaitingForResponse(false);
};




  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CodeEditor code={code} updateCode={newCode => setCode(newCode)} windowHeight={windowHeight} chatboxHeight={chatboxHeight}>

        {/* You can pass additional children here if needed */}
      
      </CodeEditor>
      <Box display="flex" flexDirection="column" height={chatboxHeight} border={1} borderColor="grey.300">
        <ChatBox onSendMessage={sendMessage} onRevertCode={revertCode}>
          <ChatBox.Messages applyCode={applyCode} toggleFullResponse={(index) => toggleFullResponse(index, messages, setMessages)} />
          <ChatBox.Input />
          <ChatBox.SendButton />
          <ChatBox.RevertButton />
        </ChatBox>
      </Box>
    </div>
  );
}

export default App;


