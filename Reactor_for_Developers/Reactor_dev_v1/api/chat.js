import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req, res) {
  try {
    const { messages } = await req.json();

    // Create a chat completion using OpenAI
    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      stream: true,
      messages,
    });

    // Transform the response into a readable stream
    const stream = OpenAIStream(response);

    // Return a StreamingTextResponse to the client
    return res.status(200).send(new StreamingTextResponse(stream));

  } catch (error) {
    if (error.name === "APIError") {
      console.error(`OpenAI API returned an API Error: ${error.message}`);
      return res.status(500).send({ error: `API Error from OpenAI: ${error.message}` });
    } else if (error.name === "APIConnectionError") {
      console.error(`Failed to connect to OpenAI API: ${error.message}`);
      return res.status(500).send({ error: `Connection error with OpenAI: ${error.message}` });
    } else if (error.name === "RateLimitError") {
      console.error(`OpenAI API request exceeded rate limit: ${error.message}`);
      return res.status(429).send({ error: `Rate limit exceeded: ${error.message}` });
    } else {
      console.error(`Failed to get response from OpenAI: ${error.message}`);
      return res.status(500).send({ error: `Unknown error: ${error.message}` });
    }
  }
}
