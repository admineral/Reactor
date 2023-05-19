// InitialCode.js




export const initialCode =`import React, { useState } from 'react';
import { Button, Typography, Container, Box, Fade, Tooltip } from '@mui/material';
import styled from '@emotion/styled';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@material-ui/icons/Home';
import { keyframes } from '@emotion/react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

const fadeIn = keyframes\`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
\`;

const StyledContainer = styled(Container)({
  backgroundImage: 'linear-gradient(to right, #6a11cb, #2575fc)',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '16px',
  color: 'white',
  animation: \`\${fadeIn} 2s ease-in-out\`,
});

const StyledButton = styled(Button)({
  marginTop: '16px',
  fontSize: '15px',
  padding: '10px',
  borderRadius: '50px',
  boxShadow: '0px 5px 10px #888888',
});

function App() {
  const navigate = useNavigate();
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleButtonClick = () => {
    setButtonClicked(true);
    navigate('/about');
  };

  return (
    <StyledContainer>
      <Fade in={true} timeout={2000}>
        <Typography variant="h4" component="h1">
          Welcome to Our Website
        </Typography>
      </Fade>
      <Fade in={true} timeout={3000}>
        <Typography variant="h6">
          We provide top-notch services and solutions for our customers. Explore our offerings and find the best fit for your needs!
        </Typography>
      </Fade>
      <Box mt={2}>
        <Tooltip title={buttonClicked ? 'You have clicked the button!' : 'Click to learn more!'} arrow>
          <StyledButton
            variant="contained"
            color="primary"
            endIcon={<InfoIcon />}
            onClick={handleButtonClick}
          >
            {buttonClicked ? 'Thanks for clicking!' : 'Learn More'}
          </StyledButton>
        </Tooltip>
      </Box>
    </StyledContainer>
  );
}

function About() {
  const navigate = useNavigate();
  const handleReturnHomeClick = () => {
    navigate('/');
  };

  return (
    <StyledContainer>
      <Typography variant="h4" component="h1">
        About Us
      </Typography>
      <Typography variant="h6">
        This is the About page. Here you can learn more about us!
      </Typography>
      <Box mt={2}>
        <Tooltip title="Return to Home" arrow>
          <StyledButton
            variant="contained"
            color="primary"
            endIcon={<HomeIcon />}
            onClick={handleReturnHomeClick}
          >
            Return to Home
          </StyledButton>
        </Tooltip>
      </Box>
    </StyledContainer>
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

export default Main;
`;