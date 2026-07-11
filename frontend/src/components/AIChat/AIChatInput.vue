<template>
  <div class="mx-auto w-full" :class="widthClass">
    <div v-if="attachments.length" class="mb-2 flex flex-wrap gap-1.5">
      <span
        v-for="(file, i) in attachments"
        :key="file.name + i"
        class="flex items-center gap-1 rounded-full bg-surface-gray-2 py-1 pl-2.5 pr-1.5 text-xs text-ink-gray-7"
      >
        {{ file.name }}
        <button
          class="grid size-4 place-items-center rounded-full hover:bg-surface-gray-4"
          :aria-label="__('Remove attachment')"
          @click="attachments.splice(i, 1)"
        >
          <span class="lucide-x size-3" aria-hidden="true" />
        </button>
      </span>
    </div>
    <div
      class="flex items-end gap-1.5 rounded-2xl border border-outline-gray-2 bg-surface-base p-2 shadow-sm transition-shadow duration-fast focus-within:border-citron-300 focus-within:shadow-md"
    >
      <button
        class="grid size-8 shrink-0 place-items-center rounded-full text-ink-gray-5 transition-colors duration-fast hover:bg-surface-gray-2 hover:text-ink-gray-7"
        :aria-label="__('Attach files')"
        @click="filePicker.click()"
      >
        <span class="lucide-paperclip size-4" aria-hidden="true" />
      </button>
      <input
        ref="filePicker"
        type="file"
        multiple
        class="hidden"
        @change="onFilesPicked"
      />
      <textarea
        ref="textarea"
        v-model="draft"
        rows="1"
        class="max-h-40 flex-1 resize-none border-0 bg-transparent p-1.5 text-p-base text-ink-gray-9 placeholder-ink-gray-4 focus:ring-0"
        :placeholder="placeholder || __('Ask anything…')"
        :disabled="disabled"
        @input="autoGrow"
        @keydown.enter.exact.prevent="submit"
      />
      <button
        v-if="voiceSupported"
        class="grid size-8 shrink-0 place-items-center rounded-full transition-colors duration-fast"
        :class="
          listening
            ? 'bg-citron-100 text-citron-700'
            : 'text-ink-gray-5 hover:bg-surface-gray-2 hover:text-ink-gray-7'
        "
        :aria-label="__('Voice input')"
        @click="toggleVoice"
      >
        <span class="lucide-mic size-4" aria-hidden="true" />
      </button>
      <button
        class="grid size-8 shrink-0 place-items-center rounded-full bg-surface-gray-10 text-ink-base transition-all duration-fast hover:bg-surface-gray-9 disabled:opacity-40"
        :disabled="disabled || !draft.trim()"
        :aria-label="__('Send')"
        @click="submit"
      >
        <span class="lucide-arrow-up size-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'

defineProps({
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  widthClass: { type: String, default: 'max-w-2xl' },
})
const emit = defineEmits(['send'])

const draft = ref('')
const attachments = ref([])
const textarea = ref(null)
const filePicker = ref(null)

function autoGrow() {
  const el = textarea.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

function onFilesPicked(e) {
  attachments.value.push(...Array.from(e.target.files || []))
  e.target.value = ''
}

function submit() {
  const text = draft.value.trim()
  if (!text) return
  emit('send', text, attachments.value.slice())
  draft.value = ''
  attachments.value = []
  if (textarea.value) textarea.value.style.height = 'auto'
}

// --- voice input (Web Speech API, hidden when unsupported) ---
const SpeechRecognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition)
const voiceSupported = !!SpeechRecognition
const listening = ref(false)
let recognition = null

function toggleVoice() {
  if (listening.value) {
    recognition?.stop()
    return
  }
  recognition = new SpeechRecognition()
  recognition.interimResults = false
  recognition.onresult = (e) => {
    const transcript = Array.from(e.results)
      .map((r) => r[0].transcript)
      .join(' ')
    draft.value = (draft.value + ' ' + transcript).trim()
    autoGrow()
  }
  recognition.onend = () => (listening.value = false)
  recognition.onerror = () => (listening.value = false)
  listening.value = true
  recognition.start()
}

onBeforeUnmount(() => recognition?.stop())
</script>
