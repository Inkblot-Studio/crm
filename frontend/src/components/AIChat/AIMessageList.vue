<template>
  <div ref="scroller" class="flex-1 overflow-y-auto">
    <div class="mx-auto flex w-full flex-col gap-4" :class="widthClass">
      <TransitionGroup name="citron-msg">
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex gap-2.5"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <CitronMascot
            v-if="message.role === 'assistant'"
            :size="22"
            class="mt-1 shrink-0"
          />
          <div
            class="max-w-[85%] whitespace-pre-wrap text-p-base"
            :class="
              message.role === 'user'
                ? 'rounded-2xl rounded-br-md bg-surface-gray-10 px-3.5 py-2 text-ink-base'
                : 'text-ink-gray-8'
            "
          >
            {{ message.content }}
            <div
              v-if="message.attachments?.length"
              class="mt-1.5 flex flex-wrap gap-1"
            >
              <span
                v-for="file in message.attachments"
                :key="file.name"
                class="rounded-full bg-surface-gray-2 px-2 py-0.5 text-xs text-ink-gray-6"
              >
                {{ file.name }}
              </span>
            </div>
          </div>
        </div>
      </TransitionGroup>
      <div v-if="status === 'thinking'" class="flex items-center gap-2.5">
        <CitronMascot :size="22" state="thinking" class="shrink-0" />
        <span class="text-sm text-ink-gray-5">{{ __('Thinking…') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import CitronMascot from '@/components/CitronMascot.vue'
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  messages: { type: Array, required: true },
  status: { type: String, default: 'idle' },
  widthClass: { type: String, default: 'max-w-2xl' },
})

const scroller = ref(null)

watch(
  () => [props.messages.length, props.messages.at(-1)?.content],
  async () => {
    await nextTick()
    scroller.value?.scrollTo({ top: scroller.value.scrollHeight })
  },
)
</script>

<style scoped>
.citron-msg-enter-active {
  transition:
    opacity var(--inkblot-duration-normal, 200ms)
      var(--inkblot-easing-out, ease-out),
    transform var(--inkblot-duration-normal, 200ms)
      var(--inkblot-easing-out, ease-out);
}

.citron-msg-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

@media (prefers-reduced-motion: reduce) {
  .citron-msg-enter-active {
    transition: none;
  }
}
</style>
