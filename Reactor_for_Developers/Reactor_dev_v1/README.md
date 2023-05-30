# ChatGPT Code Assistant Application

This application is a code assistant that interacts with the OpenAI GPT-3.5 Turbo model to help users modify and understand their React code. It features a chat interface for user interactions and a code editing interface with live preview. Here's a walkthrough of how the different parts of the code work.

## Installation and Setup

To install dependencies, run:
```bash
npm install
```

Then, to start the application, run:
```bash
npm start
```

Make sure to include your OpenAI API key in a `.env` file, using the key `REACT_APP_API_KEY`.

## Code Explanation

The main component is `App` which manages the main states and logic of the application. 

### Key Imports
```javascript
import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Select, MenuItem } from "@mui/material";
import { initialCode } from "./utils/InitialCode";
import { fetchChatGptResponseTurbo } from './utils/callChatGptApi_turbo';
import { fetchChatGptResponse } from './utils/callChatGptApi';
import SandpackComponent from "./utils/SandpackComponent";
```

### States
The application makes use of several state variables:
- `code`: Stores the current code in the editor.
- `chatInput`: Stores the user's current input in the chatbox.
- `messages`: An array of all the chat messages.
- `isWaitingForResponse`: A flag to track whether the app is waiting for a response from the GPT-3.5 Turbo model.
- `previousCode`: Stores the previous code to allow reverting changes.
- `selectedModel`: Stores the selected AI model for code generation.

### Helper Functions
The `applyCode` function is used to apply the suggested code changes from the model, while `revertCode` is used to undo these changes. The `toggleFullResponse` function toggles whether the full response from the model (including the full API response) is shown.

### Chat and API Calls
The `handleChatSubmit` function handles the chat form submission. It sends the user's input to the OpenAI API and adds the responses to the chat history.

## `fetchChatGptResponseTurbo` Function
This is the function that interacts with the OpenAI API. It sends the current code and user input to the GPT-3.5 Turbo model and receives its response.

## `SandpackComponent`
This is the component for the code editing interface. It uses the Sandpack library from CodeSandbox for the live code editing and previewing features. It features a live code editor and a preview screen, both of which update in real-time as the user types. The SandpackComponent accepts the following props:
- `code`: The code to display in the editor.
- `updateCode`: The function to call when the code in the editor changes.
- `revertCode`: The function to call when the 'Revert Code' button is clicked.
- `windowHeight` and `chatboxHeight`: Used to correctly size the Sandpack component.
  
# Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
