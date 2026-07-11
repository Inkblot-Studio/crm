<template>
  <Tooltip :text="label" placement="right" :hoverDelay="0.2">
    <button
      class="relative grid size-9 place-items-center rounded-xl text-ink-gray-6 transition-colors duration-fast hover:bg-surface-gray-2 hover:text-ink-gray-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-outline-gray-3"
      :class="{
        'bg-surface-base text-ink-gray-9 shadow-sm ring-1 ring-citron-200':
          active,
      }"
      :aria-label="label"
      @click="$emit('click')"
    >
      <slot>
        <component :is="icon" class="size-[18px]" />
      </slot>
      <span
        v-if="dot"
        class="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-citron-500"
        aria-hidden="true"
      />
    </button>
  </Tooltip>
</template>

<script setup>
import { Tooltip } from 'frappe-ui'

defineProps({
  icon: { type: [Object, String, Function], default: null },
  label: { type: String, required: true },
  active: { type: Boolean, default: false },
  dot: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>
