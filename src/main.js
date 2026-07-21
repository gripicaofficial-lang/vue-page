import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import ko from './locales/ko.js'
import en from './locales/en.js'
import ja from './locales/ja.js'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { ko, en, ja }
})

import App from './App.vue'
import router from './router'

//layout Components
import DefaultLayout from '@/layout/DefaultLayout.vue'
import MainLayout from '@/layout/MainLayout.vue'
import SubLayout from '@/layout/SubLayout.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.component("DefaultLayout", DefaultLayout)
app.component("MainLayout", MainLayout)
app.component("SubLayout", SubLayout)

app.mount('#app')
