import React from "react";
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from "@codesandbox/sandpack-react";
import { monokaiPro } from "@codesandbox/sandpack-themes";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";

const SandpackComponent = ({ code, updateCode, revertCode, windowHeight, chatboxHeight }) => {
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
        },
      }}
      code={code}
      updateCode={newCode => updateCode(newCode)}
    >
      <SandpackLayout>
        <SandpackCodeEditor
          style={{ flex: 1, height: windowHeight - chatboxHeight }}
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
            <button onClick={revertCode}>
              Revert Code
            </button>
          }
        />
      </SandpackLayout>
    </SandpackProvider>
  );
};

export default SandpackComponent;
