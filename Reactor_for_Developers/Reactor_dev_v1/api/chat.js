import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Initialize the OpenAI API with the provided key
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config);

export const runtime = 'edge';

export async function POST(req, res) {
  try {
    // Extract messages from the request body
    const { messages } = await req.json();

    // Use the OpenAI API to generate a chat completion
    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      stream: true,
      messages
    });

    // Transform the API response into a readable stream
    const stream = OpenAIStream(response);

    // Convert the stream into a text stream that can be sent as a response
    return new StreamingTextResponse(stream);

  } catch (error) {
    // Generic error handling (consider adding specific error handling if needed)
    console.error(`Failed to get response from OpenAI: ${error.message}`);
    return res.status(500).send({ error: `Unknown error: ${error.message}` });
  }
}
