// Utility function to check if a string is valid JSON
const isJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

export const fetchChatGptResponseTurbo = async (code, chatInput, updateUI) => {
  try {
    const systemMessage = {
      role: "system",
      content: "You're a helpful AI that provides code assistance and explanations in a manner understandable to a five-year-old."
    };
    const userCodeMessage = {
      role: "user",
      content: `Here is my current React code snippet: \n\n${code}\n\nI have the following dependencies installed: "@mui/material, @material-ui/core, @mui/icons-material, @emotion/styled, @material-ui/icons, @emotion/react, and "react-router-dom": "^6.11.2"". I would like to use these dependencies to create a modern and visually appealing appearance for my application.`
    };
    const userChangeRequestMessage = {
      role: "user",
      content: `I need to make the following changes or additions to my code: ${chatInput}. Could you provide a detailed explanation understandable to a five-year-old, and then the COMPLETE UPDATED CODE that incorporates these changes or additions? Please format your response as follows: [Your explanation here].\n\n{__CodeStart__}\n\n\n[Your entire React code here]\n\n{__CodeEnd__}`
    };

    const messages = [systemMessage, userCodeMessage, userChangeRequestMessage];

    console.log('Sending OpenAI request...');
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
        temperature: 0.2,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true // Enable stream response
      }),
    });

    if (!response.ok) {
      // Handle response error
      throw new Error(`API response error, status: ${response.status}`);
    }

    console.log('Stream started...');
    const reader = response.body.getReader();
    let partialLine = '';
    let buffer = '';
    let extractedCode = null;
    let extractedAnswer = null;
    let CodeStartIndex = -1;

    while (true) {
        console.log('Buffer loading...');
        const { value, done } = await reader.read();

        if (done) {
            console.log('Stream ended...');
            break;
        }

        const textDecoder = new TextDecoder("utf-8");
        const chunk = textDecoder.decode(value);
        const lines = (partialLine + chunk).split('\n');

        // Save the last line in case it's partial
        partialLine = lines.pop();

        for (const line of lines) {
            if (line.startsWith('data:')) {
                const jsonLine = line.slice('data:'.length);
                if (isJSON(jsonLine)) {
                    const parsedChunk = JSON.parse(jsonLine);
                    const content = parsedChunk.choices?.[0]?.delta?.content;

                    if (content) {
                      // Add content to the buffer
                      buffer += content;
                      // Send content to UI
                      updateUI(content);
                    }
                }
            }
        }
    }

    // After the stream has ended
    const answerEndCodeStartIndex = buffer.indexOf('{__CodeStart__}');
    if (answerEndCodeStartIndex !== -1) {
      extractedAnswer = buffer.substring(0, answerEndCodeStartIndex).trim();
      const codeEndIndex = buffer.indexOf('{__CodeEnd__}', answerEndCodeStartIndex);
      if (codeEndIndex !== -1) {
        CodeStartIndex = answerEndCodeStartIndex + '{__CodeStart__}'.length;
        extractedCode = buffer.substring(CodeStartIndex, codeEndIndex).trim();
      }
    } else {
      extractedAnswer = buffer;
    }

    console.log('Stream ended...');
    // return extractedAnswer and extractedCode
    return { answer: extractedAnswer, code: extractedCode };

  } catch (error) {
    // Handle general errors
    console.log(`Error occurred while fetching GPT-3 response: ${error}`);
    throw error;
  }
}