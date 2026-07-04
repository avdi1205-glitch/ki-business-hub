export async function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY fehlt");
  }

  const { default: OpenAI } = await import("openai");

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}
