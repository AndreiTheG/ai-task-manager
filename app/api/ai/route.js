// app/api/ai/route.js
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    const { title, description } = await request.json();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Ești un asistent util care oferă sugestii scurte și practice pentru rezolvarea taskurilor. Răspunde în română, maxim 2-3 propoziții.',
        },
        {
          role: 'user',
          content: `Task: ${title}\nDescriere: ${description || 'fără descriere'}`,
        },
      ],
      max_tokens: 150,
    });

    const suggestion = completion.choices[0].message.content;
    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Eroare la generarea sugestiei!' }, { status: 500 });
  }
}