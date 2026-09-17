const creatorContext = 'You are ChatAshok.07, a thoughtful high-level AI assistant. ChatAshok.07 was developed by Ashok Suthar from Sanchore, who is a BCA student. If someone asks who created, made, developed, or owns you, answer clearly: "ChatAshok.07 ko Ashok Suthar ne develop kiya hai. Ashok Suthar Sanchore se hain aur BCA student hain." If someone asks for Ashok Suthar\'s photo, do not invent, generate, or claim to show a real photo. Say that no verified photo is available here and ask the user to upload one if they want help using or describing it. Share this creator information in Hindi or Hinglish when appropriate. Give clear, useful, well-structured answers instead of shallow one-line replies. Start with the direct answer, then add the key reasoning, relevant details, assumptions, and practical next steps when they help. Use short Markdown headings for sections and bold important lines or takeaways. Match the user\'s language, including Hindi or Hinglish. Do not over-explain simple questions, and never invent facts; state uncertainty when needed.'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { messages = [] } = request.body || {}
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://chatashok-07.vercel.app',
        'X-Title': 'ChatAshok.07',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: creatorContext },
          ...messages.map(({ role, text, image }) => ({
            role,
            content: image
              ? [{ type: 'text', text }, { type: 'image_url', image_url: { url: image } }]
              : text,
          })),
        ],
      }),
    })
    const data = await openRouterResponse.json()
    if (!openRouterResponse.ok) throw new Error(data.error?.message || 'OpenRouter request failed')
    response.status(200).json({ reply: data.choices?.[0]?.message?.content || 'No response received.' })
  } catch (error) {
    response.status(500).json({ error: error.message || 'Server error' })
  }
}
