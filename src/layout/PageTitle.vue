<template>
  <div class="page__title_bx" :class="{ on: isVisible }">
    <h2>{{ title }}<span>2026.04.01</span></h2>
    <div>
      <p>프로젝트명 : {{ project }}</p>
      <p>기능구현 : {{ features }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// 부모(각 페이지)로부터 받을 데이터 정의
const props = defineProps({
  title: String,
  project: String,
  features: String
})

const isVisible = ref(false)

// 컴포넌트가 나타날 때 애니메이션 시작
onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})

// 혹시 같은 컴포넌트 내에서 데이터만 바뀔 경우를 대비해 감시
watch(() => props.title, () => {
  isVisible.value = false
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})
</script>