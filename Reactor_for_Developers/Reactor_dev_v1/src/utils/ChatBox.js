import React, { useState, useRef } from "react";

const Message = ({ message = {}, applyCode, isSandpackLoading }) => (
  <div className="my-2 break-words">
    <div className={`p-2 rounded-xl inline-block max-w-7/12 
      ${message.sender === "ChatGPT" ? 'bg-gray-700 text-white' : 'bg-blue-500 text-white'}`}>
      <p className="text-sm">{message.text}</p>
    </div>
    {message.sender === "ChatGPT" && (
      <div className="flex items-center">
        {!message.isError && message.isLoading && !message.isFullResponseReady && (
          <div className="w-4 h-4 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        )}
        {!message.isError && !message.isLoading && message.isFullResponseReady && (
          <button
            onClick={() => applyCode(message.extractedCode)}
            className={`ml-4 mt-2 bg-blue-500 text-white rounded px-4 py-2 text-lg 
              ${!message.extractedCode || isSandpackLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!message.extractedCode || isSandpackLoading}
          >
            Apply Code
          </button>
        )}
      </div>
    )}
    {message.isError && (
      <p className="text-sm text-red-500 whitespace-pre-wrap mt-2">{message.text}</p>
    )}
  </div>
);

const ChatBox = () => {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const chatHistoryRef = useRef(null);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const newMessage = { role: "user", content: chatInput };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    console.log("Chat message sent:", chatInput);
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: updatedMessages })
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
  
      const responseData = await response.text(); // Handle the streaming response as text
      setMessages([...updatedMessages, { role: "ChatGPT", content: responseData }]);
      console.log("AI response received:", responseData);
  
    } catch (error) {
      console.error("Error during chat processing:", error);
      setSnackbarMessage('Error processing chat. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setIsProcessing(false);
      setChatInput("");
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-gray-800 p-2 rounded shadow space-y-4">
      <div 
        className="flex-grow p-1 overflow-auto max-h-[calc(100%-56px)] bg-gray-700 rounded"
        ref={chatHistoryRef}
      >
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
      </div>

      <form onSubmit={handleChatSubmit} className="flex p-1 items-center space-x-4">
        <input
          className="flex-grow rounded border px-3 py-2 bg-gray-700 text-white placeholder-white"
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your message"
        />
        <button 
          type="submit" 
          className="text-blue-500 p-2 rounded-full hover:bg-blue-500 hover:text-white"
          disabled={isProcessing}
        >
          ➔
        </button>
      </form>

      {snackbarOpen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white py-2 px-4 rounded">
          {snackbarMessage}
        </div>
      )}
    </div>
  );
}

export default ChatBox;

