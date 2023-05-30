export const fetchChatGptResponseTurbo = async (code, chatInput) => {
  try {
    const systemMessage = "You're a helpful AI that provides code assistance and explanations in a manner understandable to a five-year-old.";
    const userCodeMessage = `Here is my current React code snippet: \n\n${code}\n\nI have the following dependencies installed: "@mui/material, @material-ui/core, @mui/icons-material, @emotion/styled, @material-ui/icons, @emotion/react, and "react-router-dom": "^6.11.2"". I would like to use these dependencies to create a modern and visually appealing appearance for my application.`;
    const userChangeRequestMessage = `I need to make the following changes or additions to my code: ${chatInput}. Please respond with the updated code that incorporates these changes or additions. Format your response as follows:\n\nResponse: [Your answer here]\nCode: [Your code here]`;

    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: userCodeMessage },
      { role: "user", content: userChangeRequestMessage }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 2000,
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

    const chatGptResponse = data.choices[0].message['content'].trim();
    const { extractedAnswer, extractedCode } = extractAnswerAndCode(chatGptResponse);
    return { answer: extractedAnswer, code: extractedCode, apiResponse: data }; // Include the full API response
  } catch (error) {
    throw error;
  }
};
const extractAnswerAndCode = (response) => {
  const answerRegex = /Response:\s*([\s\S]*?)\nCode:/;
  const codeRegex = /Code:\s*([\s\S]*)/;
  const answerMatches = response.match(answerRegex);
  const codeMatches = response.match(codeRegex);
  const extractedAnswer = answerMatches && answerMatches.length > 1 ? answerMatches[1].trim() : '';
  let extractedCode = codeMatches && codeMatches.length > 1 ? codeMatches[1].trim() : '';
  extractedCode = extractedCode.replace(/^```|```|javascript/g, ""); // Remove leading and trailing backticks (```) and "javascript" prefix
  return { extractedAnswer, extractedCode };
};






