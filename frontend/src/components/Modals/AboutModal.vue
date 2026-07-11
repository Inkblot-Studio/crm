<template>
  <Dialog v-model:open="show" :size="'sm'">
    <template #body>
      <div class="p-4 pt-5">
        <div class="flex justify-center">
          <div class="flex flex-col items-center">
            <CitronMascot :size="56" state="blink" class="mb-3" />
            <h3 class="font-display text-2xl-semibold text-ink-gray-9">
              Citron CRM
            </h3>
            <p class="mt-1 text-sm text-ink-gray-6">
              {{ __('Simple, fast customer relationships') }}
            </p>
          </div>
        </div>
        <hr class="border-t my-3 mx-2" />
        <div
          class="flex items-center gap-2.5 rounded-lg px-2 py-2.5"
        >
          <img
            :src="inkblotLogo"
            alt="Inkblot Studio"
            class="size-6 rounded"
          />
          <span class="text-base text-ink-gray-8">
            {{ __('Built by Inkblot Studio') }}
          </span>
        </div>
      </div>
    </template>
  </Dialog>
</template>
<script setup>
import CitronMascot from '@/components/CitronMascot.vue'
import inkblotLogo from '@/assets/inkblot-logo.svg'

let show = defineModel({ type: Boolean })
</script>
