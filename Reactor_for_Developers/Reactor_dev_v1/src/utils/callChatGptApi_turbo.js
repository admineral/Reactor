import { Configuration, OpenAIApi } from 'openai-edge';
import { AIStream } from 'ai';

const config = new Configuration({
  apiKey: process.env.REACT_APP_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = 'edge';

const isJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        console.log("JSON Parsing failed for string:", str, "\nError:", e);
        return false;
    }
};

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

export const fetchChatGptResponseTurbo = async (code, chatInput, updateUI) => {
  try {
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
  ; // For brevity, I kept this as-is

    console.log("[Request] Preparing to send request to OpenAI with prompt:", prompt);
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

    if (!response.ok) {
      console.error("[Error] Response from OpenAI not OK. Status:", response.status);
      throw new Error('Invalid response from OpenAI');
    }

    console.log("[Stream] Response received from OpenAI:", response);

    let buffer = '';

    const openAIStream = AIStream(response, parseOpenAIStream(), {
      onStart: async () => {
        console.log('[Stream] Stream started');
      },
      onChunk: (chunk) => {
        const parsedChunk = parseOpenAIStream()(chunk);
        buffer += parsedChunk;
        updateUI(parsedChunk);
      },
      onCompletion: async () => {
        console.log("[Stream] Stream completed");
        // Verarbeiten Sie den `buffer` oder führen Sie eine andere Abschlusslogik durch.
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
