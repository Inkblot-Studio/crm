<template>
  <div
    class="flex h-12 shrink-0 items-center border-b border-outline-gray-1 pr-4"
  >
    <div id="app-header" class="flex-1"></div>
    <div class="flex items-center justify-center">
      <CallUI />
    </div>
  </div>
</template>

<script setup>
import CallUI from '@/components/Telephony/CallUI.vue'
</script>
