import { ref } from 'vue'
import { DEFAULT_MODEL } from './models'

/**
 * Chat state + transport for the Citron assistant.
 *
 * Transport is pluggable: set `window.citron_ai_endpoint` (e.g. from a Form
 * Script or a boot hook) to a URL that accepts
 *   POST { model, context, messages: [{role, content}] }
 * and returns { reply: string }. Without an endpoint the assistant runs in
 * demo mode: it streams a canned reply so the full UI (thinking states,
 * streaming, mascot choreography) works end to end.
 *
 * `context` scopes the assistant per module ("Leads", "Deals", ...) so every
 * module sidebar gets its own specialized conversation.
 */

const DEMO_REPLY = (context) =>
  `I'm the Citron assistant${context ? ` for ${context}` : ''}. ` +
  `The interface is fully wired — connect your AI endpoint ` +
  `(window.citron_ai_endpoint) and I'll answer with a real model. ` +
  `Until then I can show you how conversations will look and feel.`

let idCounter = 0
const conversations = {}

export function useAIChat({ context = '' } = {}) {
  // one conversation per context, shared across mounts
  if (!conversations[context]) {
    conversations[context] = {
      messages: ref([]),
      status: ref('idle'), // idle | thinking | streaming
      model: ref(localStorage.getItem('citron_ai_model') || DEFAULT_MODEL),
    }
  }
  const { messages, status, model } = conversations[context]

  function setModel(id) {
    model.value = id
    localStorage.setItem('citron_ai_model', id)
  }

  async function send(text, attachments = []) {
    const content = text.trim()
    if (!content || status.value !== 'idle') return

    messages.value.push({
      id: ++idCounter,
      role: 'user',
      content,
      attachments: attachments.map((f) => ({ name: f.name, size: f.size })),
    })
    status.value = 'thinking'

    let reply
    const endpoint = window.citron_ai_endpoint
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model.value,
            context,
            messages: messages.value.map(({ role, content }) => ({
              role,
              content,
            })),
          }),
        })
        const data = await res.json()
        reply = data.reply || data.message || JSON.stringify(data)
      } catch (e) {
        reply = __('The assistant endpoint is unreachable. {0}', [
          e.message || '',
        ])
      }
    } else {
      // demo mode — small pause so the thinking state is visible
      await new Promise((r) => setTimeout(r, 700))
      reply = DEMO_REPLY(context)
    }

    // stream the reply into the last message for a live feel
    const assistantMessage = {
      id: ++idCounter,
      role: 'assistant',
      content: '',
    }
    messages.value.push(assistantMessage)
    status.value = 'streaming'

    // time-based reveal (~900ms total) so browser timer throttling in
    // hidden tabs can never stretch the stream; hidden pages get the full
    // text immediately.
    const STREAM_MS = 900
    const start = performance.now()
    while (!document.hidden) {
      const t = (performance.now() - start) / STREAM_MS
      if (t >= 1) break
      assistantMessage.content = reply.slice(0, Math.ceil(reply.length * t))
      // replace the array so the entry's mutation is picked up
      messages.value = [...messages.value]
      await new Promise((r) => setTimeout(r, 24))
    }
    assistantMessage.content = reply
    messages.value = [...messages.value]
    status.value = 'idle'
  }

  function clear() {
    messages.value = []
    status.value = 'idle'
  }

  return { messages, status, model, setModel, send, clear }
}
