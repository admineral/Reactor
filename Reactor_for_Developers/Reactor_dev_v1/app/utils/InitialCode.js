// InitialCode.js

export const initialCode =`import React, { useState } from 'react';
import { Button, Typography, Container, Fade } from '@mui/material';

const containerStyle = (gradient) => ({
  backgroundImage: gradient,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '16px',
  color: 'white',
});

const buttonStyle = {
  marginTop: '16px',
  fontSize: '15px',
  padding: '10px',
  borderRadius: '50px',
  boxShadow: '0px 5px 10px #888888',
};

function App() {
  const [gradient, setGradient] = useState('linear-gradient(to right, #6a11cb, #2575fc)');

  const handleButtonClick = () => {
    const randomColor1 = '#' + Math.floor(Math.random()*16777215).toString(16);
    const randomColor2 = '#' + Math.floor(Math.random()*16777215).toString(16);
    const randomGradient = \`linear-gradient(to right, \${randomColor1}, \${randomColor2})\`;
    setGradient(randomGradient);
  };

  return (
    <Container style={containerStyle(gradient)}>
      <Fade in={true} timeout={2000}>
        <Typography variant="h4">Welcome to Our Website</Typography>
      </Fade>
      <Fade in={true} timeout={3000}>
        <Typography variant="h6">
          We provide top-notch services and solutions for our customers. Explore our offerings and find the best fit for your needs!
        </Typography>
      </Fade>
      <Button
        style={buttonStyle}
        variant="contained"
        color="primary"
        onClick={handleButtonClick}
      >
        Change Background
      </Button>
    </Container>
  );
}

export default App;`;