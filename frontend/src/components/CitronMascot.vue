<template>
  <span
    class="citron-mascot"
    :class="[`is-${state}`, { 'is-static': reducedMotion }]"
    :style="{ '--mascot-size': sizePx, '--mascot-fill': fill }"
    role="img"
    aria-label="Citron"
  >
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g class="mascot-face">
        <g class="mascot-eyes">
          <rect class="mascot-eye" x="31" y="17" width="13" height="34" />
          <rect class="mascot-eye" x="56" y="17" width="13" height="34" />
        </g>
        <path
          class="mascot-smile"
          d="M 12 40 A 38 38 0 0 0 88 40"
          fill="none"
          stroke-width="10"
          stroke-linecap="butt"
          stroke-linejoin="miter"
        />
      </g>
    </svg>
  </span>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  // px number or any CSS size string
  size: { type: [Number, String], default: 32 },
  // idle | blink | look | thinking | success
  state: { type: String, default: 'idle' },
  // look direction when state === 'look'
  look: { type: String, default: 'right' }, // 'left' | 'right'
  fill: { type: String, default: 'var(--inkblot-color-accent-citron-500)' },
})

const sizePx = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size,
)

const state = computed(() =>
  props.state === 'look' ? `look-${props.look}` : props.state,
)

// Respect prefers-reduced-motion: render the mark perfectly still.
const reducedMotion = ref(false)
let mq
onMounted(() => {
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = mq.matches
  mq.addEventListener?.('change', onMqChange)
})
onBeforeUnmount(() => mq?.removeEventListener?.('change', onMqChange))
function onMqChange(e) {
  reducedMotion.value = e.matches
}
</script>

<style scoped>
.citron-mascot {
  display: inline-flex;
  width: var(--mascot-size);
  height: var(--mascot-size);
  flex-shrink: 0;
  line-height: 0;
}

.citron-mascot svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.mascot-face {
  transform-origin: 50% 55%;
  animation: mascot-idle 4.5s var(--inkblot-easing-in-out, ease-in-out) infinite;
}

.mascot-eye {
  fill: var(--mascot-fill);
  transform-origin: center 34px;
  animation: mascot-blink 5.2s linear infinite;
}

.mascot-smile {
  stroke: var(--mascot-fill);
}

/* ------- states ------- */

.is-blink .mascot-eye {
  animation: mascot-blink 1.6s linear infinite;
}

.is-look-left .mascot-face {
  transform: rotate(-8deg) translateX(-2px);
  animation: none;
}

.is-look-right .mascot-face {
  transform: rotate(8deg) translateX(2px);
  animation: none;
}

.is-thinking .mascot-face {
  animation: mascot-think-float 1.6s var(--inkblot-easing-in-out, ease-in-out)
    infinite;
}

.is-thinking .mascot-eyes {
  animation: mascot-scan 1.6s var(--inkblot-easing-in-out, ease-in-out) infinite;
}

.is-success .mascot-face {
  animation: mascot-celebrate 700ms var(--inkblot-easing-expressive, ease-out) 1;
}

/* static fallback — reduced motion */
.is-static .mascot-face,
.is-static .mascot-eye,
.is-static .mascot-eyes {
  animation: none !important;
}

/* ------- keyframes ------- */

@keyframes mascot-idle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* eyes stay open most of the cycle; quick two-frame shut */
@keyframes mascot-blink {
  0%,
  92%,
  100% {
    transform: scaleY(1);
  }
  94%,
  97% {
    transform: scaleY(0.12);
  }
}

@keyframes mascot-think-float {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    transform: translateY(-4px) rotate(2deg);
  }
}

@keyframes mascot-scan {
  0%,
  100% {
    transform: translateX(-3px);
  }
  50% {
    transform: translateX(3px);
  }
}

@keyframes mascot-celebrate {
  0% {
    transform: scale(1) rotate(0deg);
  }
  30% {
    transform: scale(1.15) rotate(-6deg) translateY(-6px);
  }
  60% {
    transform: scale(1.05) rotate(4deg) translateY(-2px);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
</style>
