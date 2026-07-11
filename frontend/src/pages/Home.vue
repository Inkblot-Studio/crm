<template>
  <LayoutHeader>
    <template #left-header>
      <div class="flex items-center gap-2">
        <span class="font-display text-lg-medium text-ink-gray-7">
          {{ __('Home') }}
        </span>
      </div>
    </template>
    <template #right-header>
      <AIModelPicker :modelValue="model" @update:modelValue="setModel" />
    </template>
  </LayoutHeader>

  <div class="flex flex-1 flex-col overflow-hidden bg-surface-base">
    <!-- empty state: one focal point, the conversation -->
    <div
      v-if="!messages.length"
      class="flex flex-1 flex-col items-center justify-center gap-5 px-4"
    >
      <CitronMascot :size="72" :state="status === 'idle' ? 'blink' : 'thinking'" />
      <div class="flex flex-col items-center gap-1.5 text-center">
        <span
          class="font-mono text-xs uppercase tracking-[0.08em] text-citron-600"
        >
          {{ __('Citron Assistant') }}
        </span>
        <h1 class="font-display text-2xl-semibold text-ink-gray-9">
          {{ __('How can I help you today?') }}
        </h1>
        <p class="max-w-md text-p-base text-ink-gray-6">
          {{
            __(
              'Ask about your pipeline, draft an email, or plan your next step.',
            )
          }}
        </p>
      </div>
    </div>

    <AIMessageList
      v-else
      :messages="messages"
      :status="status"
      widthClass="max-w-2xl px-4 pt-6"
      class="flex-1"
    />

    <div class="shrink-0 px-4 pb-6 pt-3">
      <AIChatInput
        :disabled="status !== 'idle'"
        widthClass="max-w-2xl"
        @send="send"
      />
      <p class="mx-auto mt-2 max-w-2xl text-center text-xs text-ink-gray-4">
        {{ __('The assistant can make mistakes. Verify important details.') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import LayoutHeader from '@/components/LayoutHeader.vue'
import CitronMascot from '@/components/CitronMascot.vue'
import AIModelPicker from '@/components/AIChat/AIModelPicker.vue'
import AIMessageList from '@/components/AIChat/AIMessageList.vue'
import AIChatInput from '@/components/AIChat/AIChatInput.vue'
import { useAIChat } from '@/ai/useAIChat'
import { usePageMeta } from 'frappe-ui'

const { messages, status, model, setModel, send } = useAIChat({ context: '' })

usePageMeta(() => ({ title: __('Home') }))
</script>
