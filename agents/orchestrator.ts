import Groq from 'groq-sdk'
import type { Article, ChatMessage } from '@/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

interface OrchestratorParams {
  messages: ChatMessage[]
  articles: Article[]
  savedArticles?: Article[]
}

export async function orchestrate({ messages, articles, savedArticles }: OrchestratorParams): Promise<ReadableStream> {
  const articleContext = articles
    .map(
      (a) =>
        `- [${a.category}] ${a.title} (${a.source ?? 'fuente desconocida'})\n  Resumen: ${a.summary ?? 'Sin resumen'}\n  URL: ${a.url}`
    )
    .join('\n')

  const savedContext =
    savedArticles && savedArticles.length > 0
      ? `\n\nArtículos guardados por el usuario:\n${savedArticles.map((a) => `- ${a.title}`).join('\n')}`
      : ''

  const systemPrompt = `Eres un asistente experto en tecnología para TechNews, una revista de noticias tech.
Respondés en español, de forma concisa y útil.
Tu rol es ayudar a los usuarios a entender las noticias, explicar conceptos técnicos y recomendar artículos relevantes.

Artículos disponibles hoy (${articles.length} en total):
${articleContext}${savedContext}

Cuando references un artículo, incluí su URL. No inventes artículos que no estén en la lista.`

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
  })

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })
}
