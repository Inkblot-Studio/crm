import { ref } from 'vue'

/**
 * Global state for the per-module AI assistant sidebar.
 * One panel instance lives in the layout; any module header trigger
 * opens it scoped to that module's context.
 */
export const showAIAssistant = ref(false)
export const aiAssistantContext = ref('')

export function toggleAIAssistant(context = '') {
  if (showAIAssistant.value && aiAssistantContext.value === context) {
    showAIAssistant.value = false
    return
  }
  aiAssistantContext.value = context
  showAIAssistant.value = true
}
