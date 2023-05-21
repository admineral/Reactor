// callchatGptApi.js


export const fetchChatGptResponse = async (message) => {
    try {
        
        const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
            },
            body: JSON.stringify({
                prompt: message,
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


