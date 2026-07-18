<template>
  <Tooltip :text="__('AI assistant')">
    <button
      class="grid size-7 shrink-0 place-items-center rounded-lg transition-colors duration-fast"
      :class="
        isOpen
          ? 'bg-surface-amber-2 text-ink-amber-3'
          : 'text-ink-gray-6 hover:bg-surface-gray-2 hover:text-ink-gray-8'
      "
      :aria-label="__('AI assistant')"
      @click="toggleAIAssistant(context)"
    >
      <!-- distinct AI glyph — the mascot stays reserved for the app brand
           mark in the nav rail, so it never appears twice on one screen -->
      <LucideSparkles class="size-4" />
    </button>
  </Tooltip>
</template>

<script setup>
import LucideSparkles from '~icons/lucide/sparkles'
import { Tooltip } from 'frappe-ui'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import {
  showAIAssistant,
  aiAssistantContext,
  toggleAIAssistant,
} from '@/ai/assistant'

const route = useRoute()

// Module context comes from the route so every module gets its own
// specialized assistant (Leads assistant, Deals assistant, ...).
const context = computed(() => String(route.name || ''))

const isOpen = computed(
  () => showAIAssistant.value && aiAssistantContext.value === context.value,
)
</script>
