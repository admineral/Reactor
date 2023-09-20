// Import necessary libraries and modules
import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream } from 'ai';

// Initialize the OpenAI configuration
const config = new Configuration({
  apiKey: process.env.REACT_APP_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = 'edge';

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

    // Initialize the readable stream
    const openAIStream = OpenAIStream(response, {
      onStart: async () => {
        console.log('[Stream] Stream started');
      },
      onCompletion: async (completion) => {
        console.log('[Stream] Completion:', completion);
        // Process the completion as needed
      },
      onFinal: async (completion) => {
        console.log("[Stream] Stream completed with final completion:", completion);
        // Process the final completion as needed
      },
      onToken: async (token) => {
        console.log("[Stream] Token:", token);
        updateUI(token); // Call to update the UI with new token
      }
    });

    // Now you can consume the openAIStream as needed
    // ...

  } catch (error) {
    console.error(`[Error] Error occurred while fetching GPT-3 response:`, error);
    throw error;
  }
}
