//Call ChatGPT text-davinci-003 API !! (faster)

export const fetchChatGptResponse = async (code, chatInput) => {
    try {
        const prompt = `
            I am working on a web application using React. My current code snippet is:

            ${code}

            I need to make the following changes or additions to my code:

            User: ${chatInput} .

            For this, I have the following dependencies installed: 
            "@mui/material, @material-ui/core, @mui/icons-material, @emotion/styled, @material-ui/icons, @emotion/react and "react-router-dom": "^6.11.2"" .
            I would like to use these dependencies to create a modern and visually appealing appearance for my application. 
            ChatGPT, could you provide me with the updated code that incorporates these changes or additions? Respond with full code and add comments to the code, a short description at the beginning, commented out and explaining to a 5 year old with comments in the code:
        `;
            
        const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
            },
            body: JSON.stringify({
                prompt,
                max_tokens: 2000,
                n: 1,
                stop: null,
                temperature: 0.3,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }),
        });

        if (!response.ok) {
            // Handle response error
            throw new Error(`API response error, status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.choices || data.choices.length === 0) {
            // Handle empty model output
            throw new Error('No output from the model');
        }

        const chatGptResponse = data.choices[0].text.trim();
        return chatGptResponse;
    } catch (error) {
        throw error;
    }
};


