<template>
  <div v-if="brand?.logo">
    <img :src="brand.logo" class="h-full w-full object-cover" />
  </div>
  <CitronMascot v-else :size="30" class="shrink-0" />
</template>

<script setup>
import CitronMascot from '@/components/CitronMascot.vue'

const brand = defineModel({ type: Object, default: () => ({}) })
</script>
