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
      content: `Here is my current React code snippet: \n\n${code}\n\n`
    };
    const userChangeRequestMessage = {
      role: "user",
      content: `I need to make the following changes or additions to my code: ${chatInput}. \n\n
      Could you provide a detailed explanation understandable to a five-year-old but no code, and then the COMPLETE UPDATED CODE that incorporates these changes or additions? Also,if there are any new or updated dependencies needed, please list them out, each on a new line. If there are no new or updated dependencies, please DO NOT write anything in the dependencies section, leave it COMPLETELY EMPTY.

      Note: Please NEVER show code in the explanation, and ensure to format your response as follows: explanation, then code, then dependencies. Please answer in this format: 
        \n\n
      [Your short explanation without code here].

      {__CodeStart__}

      [Your entire React code here]

      {__CodeEnd__}

      {__DependenciesStart__}

      [If there are any new or updated dependencies, list them here. If there are none, write __none__ ]

      {__DependenciesEnd__}`
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
        temperature: 0.1,
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
    let extractedDependencies = null;
    let extractedAnswer = null;
    let codeStartIndex = -1;

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
    let dependenciesStartIndex = buffer.indexOf('{__DependenciesStart__}');  // <-- Declare once here
    if (answerEndCodeStartIndex !== -1) {
      extractedAnswer = buffer.substring(0, answerEndCodeStartIndex).trim();
      const codeEndIndex = buffer.indexOf('{__CodeEnd__}', answerEndCodeStartIndex);
      if (codeEndIndex !== -1) {
        codeStartIndex = answerEndCodeStartIndex + '{__CodeStart__}'.length;
        extractedCode = buffer.substring(codeStartIndex, codeEndIndex).trim();
      }
      if (dependenciesStartIndex !== -1) {
        const dependenciesEndIndex = buffer.indexOf('{__DependenciesEnd__}', dependenciesStartIndex);
        if (dependenciesEndIndex !== -1) {
          dependenciesStartIndex = dependenciesStartIndex + '{__DependenciesStart__}'.length;  // <-- Update value here
          extractedDependencies = buffer.substring(dependenciesStartIndex, dependenciesEndIndex).trim();
        }
      }
    } else {
      extractedAnswer = buffer;
    }

    console.log('Stream ended...');
    // return extractedAnswer, extractedCode, and extractedDependencies
    return { answer: extractedAnswer, code: extractedCode, dependencies: extractedDependencies };


  } catch (error) {
    // Handle general errors
    console.log(`Error occurred while fetching GPT-3 response: ${error}`);
    throw error;
  }
}
