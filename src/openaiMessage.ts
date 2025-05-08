import OpenAI from "openai";
import type { ChatCompletionMessage } from "openai/resources/chat";

export async function generateOpenAIMessage(name: string, href: string): Promise<string> {
  const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
  });

  const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      store: true,
      messages: [
          {"role": "user", "content": `Gere uma mensagem curta e simples, apresente-se logo no inicio informando seu nome Michèle, e depois apresente o evento de rally online com o seguinte nome ${name}, 
          e ao final insira o link ${href}. Use linguagem informal e extrovertida, mande beijos e emojis.`},
      ],
  });
  
  return completion.choices[0].message?.content || `Mensagem automatica - O rally ${name} vai iniciar em breve ou ja iniciou. ${href}`;
}