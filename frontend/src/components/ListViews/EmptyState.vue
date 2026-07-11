<template>
  <div class="relative flex h-full w-full justify-center">
    <div
      class="citron-empty-state absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-4"
      :class="widthClass"
      :style="{ top: top }"
    >
      <CitronMascot :size="44" state="blink" />
      <div class="flex flex-col items-center gap-1">
        <span class="font-display text-lg-medium text-ink-gray-8">
          {{ computedTitle }}
        </span>
        <span class="text-center text-p-base text-ink-gray-6">
          {{ computedDescription }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import CitronMascot from '@/components/CitronMascot.vue'
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  // kept for API compatibility with existing callers; the mascot is the visual
  icon: {
    type: [String, Object],
    default: 'file-text',
  },
  top: { type: String, default: '35%' },
  width: { type: String, default: 'md' },
})

const computedTitle = computed(() => {
  return props.title ? props.title : __('No {0} Found', [__(props.name)])
})

const computedDescription = computed(() => {
  return props.description
    ? props.description
    : __(
        'It appears that there are currently no {0} available. You can create more {0} by using the Create button.',
        [__(props.name)],
      )
})

const widthClass = computed(() => {
  switch (props.width) {
    case 'sm':
      return 'w-2/12'
    case 'lg':
      return 'w-8/12'
    default:
      return 'w-4/12'
  }
})
</script>

<style scoped>
.citron-empty-state {
  animation: citron-empty-in var(--inkblot-duration-slow, 320ms)
    var(--inkblot-easing-signature, ease-out) both;
}

@keyframes citron-empty-in {
  from {
    opacity: 0;
    transform: translate(-50%, 8px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .citron-empty-state {
    animation: none;
  }
}
</style>
