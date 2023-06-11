// InitialCode.js

export const initialCode =`import React from 'react';
import { Button, Typography, Container, Fade } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

const containerStyle = {
  backgroundImage: 'linear-gradient(to right, #6a11cb, #2575fc)',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '16px',
  color: 'white',
};

const buttonStyle = {
  marginTop: '16px',
  fontSize: '15px',
  padding: '10px',
  borderRadius: '50px',
  boxShadow: '0px 5px 10px #888888',
};

function App() {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/about');
  };

  return (
    <Container style={containerStyle}>
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
        endIcon={<InfoIcon />}
        onClick={handleButtonClick}
      >
        Learn More
      </Button>
    </Container>
  );
}

function About() {
  const navigate = useNavigate();

  const handleReturnHomeClick = () => {
    navigate('/');
  };

  return (
    <Container style={containerStyle}>
      <Fade in={true} timeout={2000}>
        <Typography variant="h4">About Us</Typography>
      </Fade>
      <Fade in={true} timeout={3000}>
        <Typography variant="h6">
          This is the About page. Here you can learn more about us!
        </Typography>
      </Fade>
      <Button
        style={buttonStyle}
        variant="contained"
        color="primary"
        endIcon={<HomeIcon />}
        onClick={handleReturnHomeClick}
      >
        Return to Home
      </Button>
    </Container>
  );
}

function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Main;`;