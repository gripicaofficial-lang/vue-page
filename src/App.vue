<template>
  <div>
    <Header></Header>
    <component :is="layout">
      <router-view></router-view>
    </component>
    <Footer></Footer>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Header from '@/layout/Header.vue'
import Footer from '@/layout/Footer.vue'
import { computed, ref, onMounted, watch } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'

const route = useRoute()

onMounted(() => {
  AOS.init({
    duration: 800,
    once: true,
    offset: 50,
  })
})

watch(() => route.path, () => {
  setTimeout(() => {
    AOS.refresh()
  }, 100)
})

// layoutSetting
const defaultLayout = "DefaultLayout"
const layout = computed(() => route.meta?.layout || defaultLayout)

// dataThememode
const data = ref({ theme: 'white' })
const buttonText = computed(() => {
  return data.value.theme === 'white' ? 'Dark Mode' : 'White Mode';
})
const toggleTheme = () => {
  data.value.theme = data.value.theme === 'white' ? 'dark' : 'white';
  document.documentElement.setAttribute('data-theme', data.value.theme);
} // dataThememode
</script>

<!-- [ImportScssSetting]
1.임폴트 Scss 셋팅시 전 페이지에 반영되어야하므로 style 태그에 scoped가 없어야함 -->
<style lang="scss">
@forward '@/assets/css/component';
</style>