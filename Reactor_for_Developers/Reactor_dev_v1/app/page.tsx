// app/page.tsx

"use client";

import { useRef } from "react";
import { useState, useEffect } from "react";
import { useChat } from "ai/react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { Icon, GithubIcon, LoadingCircle, SendIcon } from "./icons";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";
import { initialCode } from "./utils/InitialCode";
import { examples } from "./utils/examples";

import SandpackComponent from "./SandpackComponent";
import ChatComponent from "./ChatComponent"; // Import the new ChatComponent

export default function Chat() {
  
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [chatStarted, setChatStarted] = useState(false); // Zustand hinzufügen

  const [currentCode, setCurrentCode] = useState(initialCode);

  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        va.track("Rate limited");
        return;
      } else {
        va.track("Chat initiated");
        setChatStarted(true); 
      }
    },
    onError: (error) => {
      va.track("Chat errored", {
        input,
        error: error.message,
      });
    },
  });

  const disabled = isLoading || input.length === 0;

  return (
    <main className="flex flex-col items-center justify-between pb-40">
      {chatStarted && (
        <SandpackComponent 
          code={currentCode}  
          updateCode={(newCode: string) => setCurrentCode(newCode)} 
          windowHeight={900} 
          chatboxHeight={500} 
          dependencies={{}} 
        />
      )}
      <ChatComponent 
        messages={messages} 
        input={input} 
        setInput={setInput} 
        handleSubmit={handleSubmit} 
        isLoading={isLoading} 
        disabled={disabled} 
        formRef={formRef} 
        inputRef={inputRef} 
      />
    </main>
  );
}