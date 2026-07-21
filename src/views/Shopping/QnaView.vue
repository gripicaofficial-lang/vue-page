<template>
  <div class="container">
    <main>
      <div class="main__layout_bx">
        <div class="page__title_bx">
          <h2>자주하는 질문 (Q&A)</h2>
          <p>궁금한 점이 있으시다면 꼭 확인해주세요.</p>
        </div>

        <section class="qna_section" style="margin-top: 40px;">
          <!-- 로딩 상태 -->
          <div v-if="isLoading && faqList.length === 0" class="loading_msg">
            데이터를 불러오는 중입니다...
          </div>

          <!-- 에러 상태 -->
          <div v-else-if="errorMsg" class="error_msg" role="alert">
            <div class="error_icon">⚠️</div>
            <p>{{ errorMsg }}</p>
            <button class="retry_btn" @click="loadFaq">다시 시도</button>
          </div>

          <!-- 빈 데이터 상태 -->
          <div v-else-if="faqList.length === 0" class="empty_msg">
            등록된 자주하는 질문이 없습니다.
          </div>

          <!-- FAQ 리스트 -->
          <div v-else class="faq_list">
            <div v-for="(faq, index) in faqList" :key="index" class="faq_item" :class="{ open: openIndex === index }">
              <button class="faq_question" @click="toggleFaq(index)">
                <span class="q_mark">Q.</span>
                <span class="q_text">{{ faq['질문'] || faq.question || faq.title || '제목 없음' }}</span>
                <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="faq_answer" v-show="openIndex === index">
                <div class="answer_content">
                  <span class="a_mark">A.</span>
                  <p v-html="formatAnswer(faq['답변'] || faq.answer || faq.content || '답변이 없습니다.')"></p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSheetAsObjects } from '@/services/googleSheets'

const faqList = ref([])
const isLoading = ref(false)
const errorMsg = ref('')
const openIndex = ref(-1)

const toggleFaq = (index) => {
  openIndex.value = openIndex.value === index ? -1 : index
}

const formatAnswer = (text) => {
  if (!text) return ''
  return text.replace(/\n/g, '<br />')
}

const loadFaq = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    // '자주묻는질문' 시트의 데이터를 가져옵니다. 
    // 구글 시트에 "자주묻는질문" 또는 "FAQ"라는 이름의 탭(시트)이 존재해야 합니다.
    const data = await getSheetAsObjects(undefined, '자주묻는질문!A1:Z')
    faqList.value = data
  } catch (err) {
    console.error('FAQ 로드 실패:', err)
    // 시트 이름이 FAQ일 수도 있으므로 재시도
    try {
      const data2 = await getSheetAsObjects(undefined, 'FAQ!A1:Z')
      faqList.value = data2
    } catch (err2) {
      errorMsg.value = '자주묻는질문 데이터를 불러오는데 실패했습니다. (구글 시트에 "자주묻는질문" 탭이 있는지 확인해주세요)'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadFaq()
})
</script>
