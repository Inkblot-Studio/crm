<template>
  <div class="mx-auto flex w-full max-w-md flex-col">
    <!-- progress -->
    <div class="mb-6 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <CitronMascot :size="26" :state="creating ? 'thinking' : 'blink'" />
        <span class="font-mono text-xs uppercase tracking-[0.08em] text-ink-gray-5">
          {{ __('Step {0} of {1}', [String(step + 1), String(fields.length)]) }}
        </span>
      </div>
      <button
        class="text-sm text-ink-gray-5 transition-colors duration-fast hover:text-ink-gray-8"
        @click="$emit('switchToForm')"
      >
        {{ __('Show all fields') }}
      </button>
    </div>
    <div class="mb-6 h-1 overflow-hidden rounded-full bg-surface-gray-2">
      <div
        class="h-full rounded-full bg-citron-500 transition-all duration-slow ease-citron"
        :style="{ width: progress + '%' }"
      />
    </div>

    <!-- one field at a time -->
    <form @submit.prevent="() => next()">
      <!-- keyed remount + one-shot CSS entrance animation: same slide-in feel
           as a transition, but no out-in lifecycle that can wedge in
           background tabs where rAF is suspended -->
      <div
        :key="step"
        class="min-h-24"
        :class="direction === 'back' ? 'guided-step-back' : 'guided-step'"
        :data-guided-field="currentField?.fieldname"
      >
        <FieldLayout
          v-if="stepTabs"
          :tabs="stepTabs"
          :data="data"
          :doctype="doctype"
        />
        <p
          v-if="currentField?.description"
          class="mt-2 text-sm text-ink-gray-5"
        >
          {{ __(currentField.description) }}
        </p>
      </div>

      <ErrorMessage v-if="error" class="mt-3" :message="__(error)" />

      <div class="mt-6 flex items-center justify-between">
        <Button
          v-if="step > 0"
          variant="ghost"
          :label="__('Back')"
          @click="back"
        />
        <span v-else />
        <div class="flex items-center gap-2">
          <Button
            v-if="!isRequired && !isLast"
            variant="ghost"
            :label="__('Skip')"
            @click="next(true)"
          />
          <Button
            variant="solid"
            type="submit"
            :label="isLast ? createLabel : __('Continue')"
            :loading="creating"
            :disabled="isRequired && isEmpty"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import CitronMascot from '@/components/CitronMascot.vue'
import FieldLayout from '@/components/FieldLayout/FieldLayout.vue'
import { computed, ref } from 'vue'

const props = defineProps({
  tabs: { type: Array, required: true },
  data: { type: Object, required: true },
  doctype: { type: String, required: true },
  createLabel: { type: String, default: 'Create' },
  creating: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['complete', 'switchToForm'])

const step = ref(0)
const direction = ref('forward')


// flatten quick-entry layout into an ordered field list
const fields = computed(() => {
  const out = []
  for (const tab of props.tabs || []) {
    for (const section of tab.sections || []) {
      for (const column of section.columns || []) {
        for (const field of column.fields || []) {
          if (field.hidden) continue
          out.push(field)
        }
      }
    }
  }
  return out
})

const currentField = computed(() => fields.value[step.value])

// single-field layout reusing the full FieldLayout renderer, so every
// fieldtype (Link, Select, Phone, Table...) behaves exactly like the form
const stepTabs = computed(() => {
  if (!currentField.value) return null
  return [
    {
      name: 'guided_tab',
      sections: [
        {
          name: 'guided_section',
          columns: [{ name: 'guided_column', fields: [currentField.value] }],
        },
      ],
    },
  ]
})

const isLast = computed(() => step.value >= fields.value.length - 1)
const isRequired = computed(
  () => !!(currentField.value?.reqd || currentField.value?.mandatory),
)
const isEmpty = computed(() => {
  const v = props.data[currentField.value?.fieldname]
  return v === undefined || v === null || v === ''
})
const progress = computed(() =>
  fields.value.length ? ((step.value + 1) / fields.value.length) * 100 : 0,
)

function next(skip = false) {
  if (!skip && isRequired.value && isEmpty.value) return
  if (isLast.value) {
    emit('complete')
    return
  }
  direction.value = 'forward'
  step.value += 1
}

function back() {
  if (step.value === 0) return
  direction.value = 'back'
  step.value -= 1
}
</script>

<style scoped>
.guided-step {
  animation: guided-in var(--inkblot-duration-normal, 200ms)
    var(--inkblot-easing-out, ease-out) both;
}

.guided-step-back {
  animation: guided-in-back var(--inkblot-duration-normal, 200ms)
    var(--inkblot-easing-out, ease-out) both;
}

@keyframes guided-in {
  from {
    opacity: 0;
    transform: translateX(14px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes guided-in-back {
  from {
    opacity: 0;
    transform: translateX(-14px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .guided-step,
  .guided-step-back {
    animation: none;
  }
}
</style>
