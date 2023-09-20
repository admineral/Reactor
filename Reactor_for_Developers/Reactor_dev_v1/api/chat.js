import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Initialize the OpenAI API with the provided key
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config);

export const runtime = 'edge';

export async function POST(req) {
  try {
    // Extract the messages
    const { messages } = await req.json();

    // Request chat completion
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages
    });
    
    // Create a stream from the response
    const stream = OpenAIStream(response);
    
    // Return the streaming response
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(error.message, { status: 500 });
  }
}

