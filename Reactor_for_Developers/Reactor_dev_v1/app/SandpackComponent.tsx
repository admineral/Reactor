"use client"

import React, { useState } from "react";
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview, SandpackFileExplorer } from "@codesandbox/sandpack-react";
import { monokaiPro } from "@codesandbox/sandpack-themes";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";

const SandpackComponent = ({ code, updateCode, windowHeight, chatboxHeight, dependencies }) => {
  const [showFileExplorer, setShowFileExplorer] = useState(false);

  const toggleFileExplorer = () => {
    setShowFileExplorer(prev => !prev);
  }

  return (
    <SandpackProvider
      template="react"
      theme={monokaiPro}
      files={{
        '/App.js': { code },
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
          ...dependencies,
        },
      }}
      code={code}
      updateCode={newCode => updateCode(newCode)}
    >
      <SandpackLayout>
        {showFileExplorer && <SandpackFileExplorer />}
        <SandpackCodeEditor
          style={{ flex: 1, height: windowHeight - chatboxHeight, width: '1000px' }}
          showLineNumbers={true}
          showTabs={true}
          showInlineErrors={true}
          wrapContent={true}
          extensions={[autocompletion()]}
          extensionsKeymap={[completionKeymap]}
        />
        <SandpackPreview
          style={{ flex: 1, height: windowHeight - chatboxHeight }}
          showRefreshButton={true}
          showOpenInCodeSandbox={false}
          actionsChildren={
            <button onClick={toggleFileExplorer}>
              {showFileExplorer ? 'Hide Files' : 'Show Files'}
            </button>
          }
        />
      </SandpackLayout>
    </SandpackProvider>
  );
};

export default SandpackComponent;