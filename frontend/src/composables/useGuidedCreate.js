import { ref } from 'vue'

// Shared preference for the one-field-at-a-time creation flow.
// Guided is the default; the classic full form stays one click away and the
// choice sticks across modals and sessions.
const guided = ref(localStorage.getItem('citron_guided_create') !== '0')

export function useGuidedCreate() {
  function setGuided(value) {
    guided.value = value
    localStorage.setItem('citron_guided_create', value ? '1' : '0')
  }
  return { guided, setGuided }
}
