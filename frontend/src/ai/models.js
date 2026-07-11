/**
 * AI model catalog for the Citron assistant.
 * `id` is what gets sent to the configured endpoint (see useAIChat.js).
 */
export const AI_MODELS = [
  {
    id: 'claude-fable-5',
    label: 'Fable 5',
    description: 'Most capable — deep reasoning',
  },
  {
    id: 'claude-opus-4-8',
    label: 'Opus 4.8',
    description: 'Powerful all-rounder',
  },
  {
    id: 'claude-sonnet-5',
    label: 'Sonnet 5',
    description: 'Fast and smart — default',
  },
  {
    id: 'claude-haiku-4-5-20251001',
    label: 'Haiku 4.5',
    description: 'Fastest responses',
  },
]

export const DEFAULT_MODEL = 'claude-sonnet-5'
