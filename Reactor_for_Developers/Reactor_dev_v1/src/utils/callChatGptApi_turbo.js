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
    console.log("[Start] Fetching Chat GPT response.");

    // Construct the prompt string
    const prompt = `Here is my current React code snippet: \n\n${code}\n\n ... [Rest of your prompt]`;
    
    // Log the constructed prompt for debugging
    console.log("[Debug] Constructed prompt:", prompt);

    console.log("[Request] Sending request to OpenAI.");
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

    console.log("[Response] Received response object from OpenAI:", response);

    // Error handling if the response isn't successful
    if (!response.ok) {
      console.error("[Error] Response from OpenAI not OK. Status:", response.status);
      throw new Error('Invalid response from OpenAI');
    }

    console.log("[Debug] Initializing OpenAI stream with callbacks.");

    // Initialize the readable stream with callback functions
    const openAIStream = OpenAIStream(response, {
      onStart: async () => {
        console.log('[Stream] Stream started');
      },
      onCompletion: async (completion) => {
        console.log('[Stream] Received a completion:', completion);
      },
      onFinal: async (completion) => {
        console.log("[Stream] Stream completed with final completion:", completion);
      },
      onToken: async (token) => {
        console.log("[Stream] Received a token:", token);
        updateUI(token); // Call to update the UI with new token
      }
    });

    console.log("[Debug] OpenAI stream initialized.");

  } catch (error) {
    console.error(`[Error] Error occurred while fetching GPT-3 response:`, error);
    throw error;
  }
}

console.log("[Debug] fetchChatGptResponseTurbo function defined.");
