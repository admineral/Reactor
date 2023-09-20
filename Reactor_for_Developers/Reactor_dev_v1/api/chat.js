// /api/chatGpt.js
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req, res) {
  try {
    const { prompt } = await req.json();
    
    // Create a completion using OpenAI
    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo', // or any other compatible model you wish to use
      stream: true,
      prompt,
    });
    
    // Transform the response into a readable stream
    const stream = OpenAIStream(response);
    
    // Return a StreamingTextResponse to the client
    return res.status(200).send(new StreamingTextResponse(stream));

  } catch (error) {
    return res.status(500).send({ error: `Failed to get response from OpenAI: ${error.message}` });
  }
}
