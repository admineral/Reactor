import React from "react";
import styled from "styled-components";
import { LiveProvider, LiveEditor, LivePreview, LiveError } from "react-live";
import App from './App';

// export const ViewContainerRoot1 = ({}) => {
//   return (
//     <ViewContainerRoot>
//       <HeaderContainer>
//         <LogoContainer>
//           <LogoText>Reactonauts</LogoText>
//           <LogoImage src="https://file.rendit.io/n/45hcMBJKBqDxVfYlovlB.png" />
//         </LogoContainer>
//         <LiveCodeContainer>
//           <LiveProvider code={code} scope={{ 
//               React, 
//               useState, 
//               useEffect, 
//               AppBar, 
//               Box, 
//               TextField, 
//               Toolbar, 
//               IconButton, 
//               Typography, 
//               Button, 
//               Grid, 
//               Container,
//               Drawer, List, ListItem, ListItemText,
//               styled 
//             }}
//           >
//             <FirstRectangle>
//               <LiveEditor onChange={setCode} style={liveComponentStyle} />
//             </FirstRectangle>
//           </LiveProvider>
//           <SecondRectangle />
//           <ThirdRectangle />
//           <FileNameContainer>filename.js</FileNameContainer>
//         </LiveCodeContainer>
//       </HeaderContainer>
//       <PreviewSectionContainer>
//         <SecondRectangle />
//         <ThirdRectangle />
//         <PreviewTitle>Preview</PreviewTitle>
//         <FileNameContainer>ChatGPT</FileNameContainer>
//       </PreviewSectionContainer>
//     </ViewContainerRoot>
//   );
// };

export const ViewContainerRoot = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 110px 15px 35px;
  box-sizing: border-box;
  background-color: #121214;
`;

export const HeaderContainer = styled.div`
  width: 39.26%;
  position: relative;
  gap: 48px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-self: flex-start;
  align-items: flex-start;
  margin: 0px 0px 101px 0px;
  box-sizing: border-box;
`;

export const LogoContainer = styled.div`
  width: 276px;
  position: relative;
  gap: 9px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
`;
export const LogoText = styled.div`
  position: relative;
  color: #ffffff;
  font-size: 36px;
  font-family: Inter;
  box-sizing: border-box;
`;
export const LogoImage = styled.img`
  width: 54px;
  min-width: 0px;
  min-height: 0px;
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
`;

export const CodeEditorRectangle = styled.div`
  width: 89.66%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-self: flex-end;
  align-items: flex-start;
  padding: 11px 21.2px 657px 21.2px;
  box-sizing: border-box;
`;
export const LiveCodeContainer = styled.div`
width: 100%;
position: relative;
top: 30px,
height: 672; /* adjust this value as needed */
// border-radius: 12px;
// padding: 30px 0px 0px 0px;
overflow: auto;
`;

 export const FileNameContainer = styled.div`
    position: relative;
    color: #ffffff;
    font-size: 20px;
    font-family: Inter;
    box-sizing: border-box;
  `;

  export const FileNameInputStyle = {
    fontSize: "16px",
    color: "white",
    fontFamily: "Inter",
    borderBottom: "2px solid #292c2f",
  };

  export const FirstRectangle = styled.div`
    width: 99.84%;
    height: 692px;
    left: 1px;
    top: 30px;
    position: absolute;
    border-radius: 12px;
    box-sizing: border-box;
    background-color: #202123;
  `;
  export const SecondRectangle = styled.div`
    width: 100%;
    height: 33px;
    left: 0px;
    top: 16px;
    position: absolute;
    box-sizing: border-box;
    background-color: #292c2f;
  `;
  export const ThirdRectangle = styled.div`
    width: 100%;
    height: 33px;
    left: 0px;
    top: 0px;
    position: absolute;
    border-radius: 12px;
    box-sizing: border-box;
    background-color: #292c2f;
  `;

export const LivePreviewContainer = styled.div`
width: 100%;
position: relative;
height: 705px; /* adjust this value as needed */
box-sizing: border-box;
overflow: auto;
`;

export const TabContainer = styled.div`
  position: relative;
  font-size: 20px;
  font-family: Inter;
  left: 0px;
  top: 0px;
  box-sizing: border-box;
`;

export const ChatInputStyle = {
  outline: 'none',
  paddingLeft: '15px',
  height: "35px",
  width: "70%",
  backgroundColor: "#292c2f",
  borderRadius: "4px",
  fontSize: "16px",
  color: "white",
  fontFamily: "Inter",
}

export const PreviewSectionContainer = styled.div`
  height: 800px;
  width: 54.77%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 12px;
  box-sizing: border-box;
  background-color: #202123;
`;

  
export const ChatBoxContainer = styled.div`
  height: 700px;
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-sizing: border-box;
  background-color: #202123;
  overflow: auto;
`;

// export const PreviewTitle = styled.div`
//   width: 75px;
//   height: 24px;
//   left: 18.320770263671875px;
//   top: 11px;
//   position: absolute;
//   color: #ffffff;
//   font-size: 20px;
//   font-family: Inter;
//   box-sizing: border-box;
// `;