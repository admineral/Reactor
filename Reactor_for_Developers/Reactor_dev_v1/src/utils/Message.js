import React from 'react';

const Message = ({ message, applyCode, isSandpackLoading }) => (
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
            className={`ml-4 mt-2 bg-blue-500 text-white rounded px-2 py-1 text-sm 
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

export default Message;
