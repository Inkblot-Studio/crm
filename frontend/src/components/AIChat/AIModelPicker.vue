<template>
  <Dropdown :options="options">
    <template #default="{ open }">
      <button
        class="flex items-center gap-1.5 rounded-full border border-outline-gray-2 bg-surface-base px-3 py-1.5 text-sm text-ink-gray-7 transition-colors duration-fast hover:border-outline-gray-3 hover:bg-surface-gray-1"
      >
        <span class="size-1.5 rounded-full bg-citron-500" aria-hidden="true" />
        {{ currentLabel }}
        <span
          class="lucide-chevron-down size-3.5 text-ink-gray-5 transition-transform duration-fast"
          :class="{ 'rotate-180': open }"
          aria-hidden="true"
        />
      </button>
    </template>
  </Dropdown>
</template>

<script setup>
import { Dropdown } from 'frappe-ui'
import { AI_MODELS } from '@/ai/models'
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

const currentLabel = computed(
  () =>
    AI_MODELS.find((m) => m.id === props.modelValue)?.label ||
    props.modelValue,
)

const options = AI_MODELS.map((m) => ({
  label: m.label,
  onClick: () => emit('update:modelValue', m.id),
}))
</script>
