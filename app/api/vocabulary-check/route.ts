import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  const { word, userAnswer } = await req.json();

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 512,
    system: `You are an English vocabulary teacher. When given a word and a user's definition attempt, evaluate if the answer shows understanding of the word and give encouraging feedback. Be concise. Return a JSON object with: { correct: boolean, feedback: string, correctDefinition: string, exampleSentence: string }`,
    messages: [
      {
        role: "user",
        content: `Word: "${word}"\nUser's answer: "${userAnswer}"`,
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
