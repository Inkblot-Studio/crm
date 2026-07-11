<template>
  <Tooltip :text="__('AI assistant')">
    <button
      class="grid size-7 shrink-0 place-items-center rounded-lg transition-colors duration-fast"
      :class="
        isOpen
          ? 'bg-citron-100'
          : 'hover:bg-surface-gray-2'
      "
      :aria-label="__('AI assistant')"
      @click="toggleAIAssistant(context)"
    >
      <CitronMascot :size="16" :state="isOpen ? 'blink' : 'idle'" />
    </button>
  </Tooltip>
</template>

<script setup>
import CitronMascot from '@/components/CitronMascot.vue'
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
