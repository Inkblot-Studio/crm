<template>
  <FrappeUIProvider>
    <NotPermitted v-if="$route.name === 'Not Permitted'" />
    <router-view v-else-if="$route.name === 'Onboarding'" />
    <!-- pages have multi-root templates, so a router transition can't animate
         them (Vue warns); page-level motion lives in each page instead -->
    <Layout v-else-if="session.isLoggedIn" class="isolate">
      <router-view :key="$route.fullPath" />
    </Layout>
    <Dialogs />
    <DoctypeModals />
    <EventNotificationPopup />
  </FrappeUIProvider>
</template>

<script setup>
import { bg } from '@/i18n/bg'
import NotPermitted from '@/pages/NotPermitted.vue'
import EventNotificationPopup from '@/components/EventNotificationPopup.vue'
import DoctypeModals from '@/components/Modals/DoctypeModals.vue'
import { Dialogs } from '@/utils/dialogs'
import { sessionStore } from '@/stores/session'
import { FrappeUIProvider, setConfig, useTheme } from 'frappe-ui'
import dayjs from 'dayjs/esm'
import 'dayjs/esm/locale/bg'
import { computed, defineAsyncComponent, provide, ref } from 'vue'

const session = sessionStore()
provide('session', session)

const { setTheme } = useTheme()
if (!localStorage.getItem('theme')) {
  setTheme('light')
}

const MobileLayout = defineAsyncComponent(
  () => import('./components/Layouts/MobileLayout.vue'),
)
const DesktopLayout = defineAsyncComponent(
  () => import('./components/Layouts/DesktopLayout.vue'),
)
// Reactive breakpoint — reading window.innerWidth once froze the choice at
// boot, so a desktop window that loaded narrow was stuck with the phone
// layout (hamburger, no nav rail) until a hard reload.
const desktopQuery = window.matchMedia('(min-width: 640px)')
const isDesktop = ref(desktopQuery.matches)
desktopQuery.addEventListener('change', (e) => (isDesktop.value = e.matches))
const Layout = computed(() => (isDesktop.value ? DesktopLayout : MobileLayout))

setConfig('systemTimezone', window.timezone?.system || null)
setConfig('localTimezone', window.timezone?.user || null)
// The server's messages follow the user's language; the fork dictionary
// overlays the daily chrome whenever Bulgarian is active. localStorage
// ('crm_lang') lets a terminal force the language even against a backend
// without bg locale files (dev benches, upstream containers).
const activeLang = localStorage.getItem('crm_lang') || window.lang || 'en'
const serverMessages = window.translated_messages || {}
setConfig(
  'translatedMessages',
  activeLang.startsWith('bg') ? { ...serverMessages, ...bg } : serverMessages,
)
// relative timestamps ("10 hours ago") come from dayjs — same language switch
if (activeLang.startsWith('bg')) dayjs.locale('bg')
</script>
