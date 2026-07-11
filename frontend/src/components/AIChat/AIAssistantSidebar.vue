<template>
  <transition name="citron-slide">
    <aside
      v-if="showAIAssistant"
      class="fixed inset-y-0 right-0 z-30 flex w-[380px] max-w-full flex-col border-l border-outline-gray-2 bg-surface-base shadow-xl sm:my-2 sm:mr-2 sm:h-auto sm:rounded-2xl sm:border"
      :aria-label="__('AI assistant')"
    >
      <header
        class="flex items-center justify-between border-b border-outline-gray-1 px-3.5 py-2.5"
      >
        <div class="flex items-center gap-2">
          <CitronMascot
            :size="22"
            :state="status === 'idle' ? 'idle' : 'thinking'"
          />
          <div class="flex flex-col">
            <span class="text-base-medium leading-tight text-ink-gray-9">
              {{ title }}
            </span>
            <span class="text-xs leading-tight text-ink-gray-5">
              {{ modelLabel }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <Tooltip :text="__('Clear conversation')">
            <button
              v-if="messages.length"
              class="grid size-7 place-items-center rounded-lg text-ink-gray-5 transition-colors duration-fast hover:bg-surface-gray-2 hover:text-ink-gray-7"
              :aria-label="__('Clear conversation')"
              @click="clear"
            >
              <span class="lucide-eraser size-4" aria-hidden="true" />
            </button>
          </Tooltip>
          <button
            class="grid size-7 place-items-center rounded-lg text-ink-gray-5 transition-colors duration-fast hover:bg-surface-gray-2 hover:text-ink-gray-7"
            :aria-label="__('Close')"
            @click="showAIAssistant = false"
          >
            <span class="lucide-x size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        v-if="!messages.length"
        class="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"
      >
        <CitronMascot :size="40" state="blink" />
        <p class="text-p-sm text-ink-gray-6">
          {{
            __('Ask about your {0} — I have this module in context.', [
              contextLabel,
            ])
          }}
        </p>
      </div>
      <AIMessageList
        v-else
        :messages="messages"
        :status="status"
        widthClass="max-w-full px-3.5 pt-4"
        class="flex-1"
      />

      <div class="shrink-0 px-3 pb-3 pt-2">
        <AIChatInput
          :disabled="status !== 'idle'"
          :placeholder="__('Ask about {0}…', [contextLabel])"
          widthClass="max-w-full"
          @send="send"
        />
      </div>
    </aside>
  </transition>
</template>

<script setup>
import CitronMascot from '@/components/CitronMascot.vue'
import AIMessageList from '@/components/AIChat/AIMessageList.vue'
import AIChatInput from '@/components/AIChat/AIChatInput.vue'
import { Tooltip } from 'frappe-ui'
import { computed } from 'vue'
import { useAIChat } from '@/ai/useAIChat'
import { AI_MODELS } from '@/ai/models'
import { showAIAssistant, aiAssistantContext } from '@/ai/assistant'

const contextLabel = computed(() => __(aiAssistantContext.value || 'CRM'))
const title = computed(() => __('{0} assistant', [contextLabel.value]))

// each module context keeps its own conversation
const chat = computed(() => useAIChat({ context: aiAssistantContext.value }))
const messages = computed(() => chat.value.messages.value)
const status = computed(() => chat.value.status.value)
const modelLabel = computed(
  () =>
    AI_MODELS.find((m) => m.id === chat.value.model.value)?.label ||
    chat.value.model.value,
)

function send(text, attachments) {
  chat.value.send(text, attachments)
}

function clear() {
  chat.value.clear()
}
</script>

<style scoped>
.citron-slide-enter-active,
.citron-slide-leave-active {
  transition: transform var(--inkblot-duration-slow, 320ms)
      var(--inkblot-easing-signature, ease-out),
    opacity var(--inkblot-duration-slow, 320ms)
      var(--inkblot-easing-signature, ease-out);
}

.citron-slide-enter-from,
.citron-slide-leave-to {
  transform: translateX(24px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .citron-slide-enter-active,
  .citron-slide-leave-active {
    transition: none;
  }
}
</style>
