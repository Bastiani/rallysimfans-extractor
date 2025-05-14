import OpenAI from "openai";
import type { RallyResult } from "../scrape-functions/onlineRallyResults";

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

export async function generateMessageForRallyResults(results: string, url: string): Promise<string> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
  
    const completion = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        store: true,
        messages: [
            {"role": "user", "content": `Gere uma mensagem que será usada no whatsapp para um grupo de amigos, fale de forma descontraída e informal, use emojis, a mensagem é sobre o resultado de um rally online. Faça pequenas e curtas brincadeiras com cada um da lista, não fique elogiando, tire sarro deles. 
                Insira apenas uma vez a url no final de toda a mensagem ${url}. ${results}`},
        ],
    });
    
    return completion.choices[0].message?.content || '.';
  }