import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  const { sentence, userAnswer, correctAnswer, topic } = await req.json();

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 512,
    system: `You are an English grammar teacher. Evaluate the user's grammar answer and provide clear, educational feedback. Return a JSON object with: { correct: boolean, feedback: string, explanation: string, tip: string }`,
    messages: [
      {
        role: "user",
        content: `Grammar topic: ${topic}\nQuestion/sentence: "${sentence}"\nUser's answer: "${userAnswer}"\nCorrect answer: "${correctAnswer}"`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: "Failed to parse response" }, { status: 500 });
  }
  return Response.json(JSON.parse(jsonMatch[0]));
}
