// Import necessary libraries and modules
import { Configuration, OpenAIApi } from 'openai-edge';
import { AIStream } from 'ai';

// Initialize the OpenAI configuration
const config = new Configuration({
  apiKey: process.env.REACT_APP_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = 'edge';

// Utility function to verify if a string is in JSON format
const isJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        console.error("JSON Parsing failed for string:", str, "\nError:", e);
        return false;
    }
};

// A function that parses the streaming response from OpenAI
function parseOpenAIStream(): AIStreamParser {
  return data => {
    console.log("[Parse Stream] Received data chunk:", data);
    if (isJSON(data)) {
      const parsedData = JSON.parse(data);
      return parsedData.choices?.[0]?.text || "";
    }
    return "";
  }
}

// Main function to fetch response from OpenAI based on given code and chat input
export const fetchChatGptResponseTurbo = async (code, chatInput, updateUI) => {
  try {
    // Construct the prompt string
    const prompt = `Here is my current React code snippet: \n\n${code}\n\n . I need to make the following changes or additions to my code: ${chatInput}. \n\n
    Could you provide a detailed explanation understandable to a five-year-old but no code, and then the COMPLETE UPDATED CODE that incorporates these changes or additions? Also, if there are any new or updated dependencies needed, please list them out, each on a new line. If there are no new or updated dependencies, please DO NOT write anything in the dependencies section, leave it COMPLETELY EMPTY.

    Note: Please NEVER show code in the explanation, and ensure to format your response as follows: explanation, then code, then dependencies. Please answer in this format: 
      \n\n
    [Your short explanation without code here].

    {__CodeStart__}

    [Your entire React code here]

    {__CodeEnd__}

    {__DependenciesStart__}

    [If there are any new or updated dependencies, list them here. If there are none, write __none__ ]

    {__DependenciesEnd__}`
  ;

    // Log the constructed prompt for debugging
    console.log("[Request] Preparing to send request to OpenAI with prompt:", prompt);

    // Make a request to OpenAI for completion
    const response = await openai.createCompletion({
      model: 'gpt-3.5-turbo-instruct',
      prompt,
      max_tokens: 2000,
      temperature: 0.1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true
    });

    // Error handling if the response isn't successful
    if (!response.ok) {
      console.error("[Error] Response from OpenAI not OK. Status:", response.status);
      throw new Error('Invalid response from OpenAI');
    }

    // Log the received streaming response for debugging
    console.log("[Stream] Response received from OpenAI:", response);

    // Buffer to collect the data from streaming response
    let buffer = '';

    // Initialize AIStream and define callback handlers
    const openAIStream = AIStream(response, parseOpenAIStream(), {
      onStart: async () => {
        console.log('[Stream] Stream started');
      },
      onChunk: (chunk) => {
        const parsedChunk = parseOpenAIStream()(chunk);
        buffer += parsedChunk;
        updateUI(parsedChunk); // Call to update the UI with new data
      },
      onCompletion: async () => {
        console.log("[Stream] Stream completed");
      },
      onFinal: async (completion) => {
        console.log("[Stream] Stream completed with final completion:", completion);

        // Extract data from buffer
        let extractedCode, extractedDependencies, extractedAnswer;
        const answerEndCodeStartIndex = buffer.indexOf('{__CodeStart__}');
        let dependenciesStartIndex = buffer.indexOf('{__DependenciesStart__}');
        
        console.log("[Buffer] Buffer after stream completion:", buffer);
        
        // Extract answer, code, and dependencies
        if (answerEndCodeStartIndex !== -1) {
          extractedAnswer = buffer.substring(0, answerEndCodeStartIndex).trim();
          const codeEndIndex = buffer.indexOf('{__CodeEnd__}', answerEndCodeStartIndex);
          if (codeEndIndex !== -1) {
            const codeStartIndex = answerEndCodeStartIndex + '{__CodeStart__}'.length;
            extractedCode = buffer.substring(codeStartIndex, codeEndIndex).trim();
          }
          if (dependenciesStartIndex !== -1) {
            const dependenciesEndIndex = buffer.indexOf('{__DependenciesEnd__}', dependenciesStartIndex);
            if (dependenciesEndIndex !== -1) {
              dependenciesStartIndex += '{__DependenciesStart__}'.length;
              extractedDependencies = buffer.substring(dependenciesStartIndex, dependenciesEndIndex).trim();
            }
          }
        } else {
          extractedAnswer = buffer;
        }

        console.log("[Extracted Data] Answer:", extractedAnswer, "Code:", extractedCode, "Dependencies:", extractedDependencies);
        return { answer: extractedAnswer, code: extractedCode, dependencies: extractedDependencies };
      }
    });

    // Now you can consume the openAIStream as needed
    // ... 
  } catch (error) {
    console.error(`[Error] Error occurred while fetching GPT-3 response:`, error);
    throw error;
  }
}
