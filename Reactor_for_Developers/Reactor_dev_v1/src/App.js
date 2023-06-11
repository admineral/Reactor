import React, { useState, useEffect } from "react";

// other imports...
import { initialCode } from "./utils/InitialCode";
import SandpackComponent from "./utils/SandpackComponent";
import ChatBox from "./utils/ChatBox";

function App() {

  const [code, setCode] = useState(initialCode);
  const [isSandpackLoading, setIsSandpackLoading] = useState(false);
  const windowHeight = window.innerHeight;
  const [dependencies, setDependencies] = useState({});
  const chatboxHeight = 400;

  const cleanDependencyString = (dep) => dep.replace(/^[\s-]+|[\s-]+$/g, '');

  const addDependency = (dep) => {
    dep = cleanDependencyString(dep);
    if (dep && dep !== "__none__" && dep !== "None") {
      let [packageName, version] = dep.split(":");
      version = version || "latest"; 
      setDependencies((prevDependencies) => ({
        ...prevDependencies,
        [packageName]: version,
      }));
      setIsSandpackLoading(true); 
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSandpackLoading(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, [dependencies]);


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      
      <SandpackComponent
        code={code}
        setCode={setCode}
        windowHeight={windowHeight}
        chatboxHeight= {chatboxHeight}
        dependencies={dependencies}
      />
     
      <ChatBox
        code={code}
        setCode={setCode}
        isSandpackLoading={isSandpackLoading}
        addDependency={addDependency}
        dependencies={dependencies}
      />
    </div>
  );
}

export default App;
