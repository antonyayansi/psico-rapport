import { OPENAI_TOOLS, TOOL_STATUS, executeUwuTool } from './uwuTools'

const MAX_ROUNDS = 4
const MODEL = 'gpt-4o'

function parseArgs(raw) {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export async function runUwuAgent({
  apiKey,
  uid,
  systemPrompt,
  history = [],
  userText,
  imageUrl = null,
  onStatus
} = {}) {
  if (!apiKey) {
    throw new Error('Falta VITE_OPENAI_API_KEY')
  }

  let userContent
  if (imageUrl) {
    userContent = [
      { type: 'text', text: userText || 'Analiza esta imagen y responde con empatía.' },
      { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } }
    ]
  } else {
    userContent = userText
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userContent }
  ]

  const actions = []
  const toolsUsed = []
  let wroteMood = false

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools: OPENAI_TOOLS,
        tool_choice: 'auto',
        max_tokens: 700,
        temperature: 0.6
      })
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(errText || `OpenAI ${response.status}`)
    }

    const data = await response.json()
    const msg = data.choices?.[0]?.message
    if (!msg) throw new Error('Respuesta vacía del modelo')

    if (!msg.tool_calls?.length) {
      return {
        text: (msg.content || '').trim(),
        actions,
        toolsUsed,
        wroteMood
      }
    }

    messages.push(msg)

    for (const call of msg.tool_calls) {
      const name = call.function?.name
      const args = parseArgs(call.function?.arguments)
      if (typeof onStatus === 'function') {
        onStatus(TOOL_STATUS[name] || 'Consultando…')
      }
      const result = await executeUwuTool(uid, name, args)
      toolsUsed.push(name)
      if (result?.wroteMood) wroteMood = true
      if (result?.ok && result.action && !actions.some((a) => a.action === result.action)) {
        actions.push({
          action: result.action,
          label: result.label,
          route: result.route,
          tel: result.tel
        })
      }
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result)
      })
    }
  }

  return {
    text: 'Estuve revisando tu información. ¿Quieres que te cuente lo que vi o que te proponga un siguiente paso?',
    actions,
    toolsUsed,
    wroteMood
  }
}
