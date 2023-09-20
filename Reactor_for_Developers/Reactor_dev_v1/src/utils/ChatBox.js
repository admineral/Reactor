import React, { useState, useRef } from "react";
import Message from './Message';

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
    setMessages([...messages, { sender: "user", text: chatInput }]);
    console.log("Chat message sent:", chatInput);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: chatInput })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const responseData = await response.json();
      setMessages([...messages, { sender: "user", text: chatInput }, { sender: "ai", text: responseData.message }]);
      console.log("AI response received:", responseData.message);

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
          <Message key={index} sender={message.sender} text={message.text} />
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
          ➔ {/* Consider using an SVG or a suitable font-icon for the send icon */}
        </button>
      </form>

      {/* For snackbar, consider using a library or a custom component with Tailwind CSS */}
      {snackbarOpen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white py-2 px-4 rounded">
          {snackbarMessage}
        </div>
      )}
    </div>
  );
}

export default ChatBox;
