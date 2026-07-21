<template>
  <div class="container">
    <main>
      <div class="main__layout_bx">

        <div class="page__title_bx">
          <h2>API Lab</h2>
          <p>Google Sheets 멀티 시트 뷰어입니다.</p>
        </div>

        <!-- ───────────── 시트 탭 ───────────── -->
        <section class="sheet_viewer">

          <div class="tab_bar" role="tablist">
            <button
              v-for="sheet in SHEETS"
              :key="sheet.name"
              role="tab"
              :aria-selected="activeSheet.name === sheet.name"
              :class="['tab_btn', { active: activeSheet.name === sheet.name }]"
              @click="selectSheet(sheet)"
            >
              {{ sheet.label }}
            </button>
          </div>

          <!-- 상태 바 -->
          <div class="status_bar">
            <span class="range_badge">{{ activeSheet.range }}</span>
            <button
              class="refresh_btn"
              :disabled="sheets.isLoading"
              @click="loadCurrentSheet"
              aria-label="새로고침"
            >
              <span :class="{ spinning: sheets.isLoading }">↺</span>
              {{ sheets.isLoading ? '불러오는 중...' : '새로고침' }}
            </button>
            <span v-if="sheets.lastFetched" class="last_fetched">
              {{ sheets.lastFetched.toLocaleString() }} 기준
            </span>
          </div>

          <!-- 에러 -->
          <div v-if="sheets.error" class="error_msg" role="alert">
            {{ sheets.error }}
          </div>

          <!-- 로딩 스켈레톤 -->
          <div v-if="sheets.isLoading" class="skeleton_wrap">
            <div v-for="n in 5" :key="n" class="skeleton_row" />
          </div>

          <!-- 데이터 테이블 -->
          <template v-else-if="sheets.items.length">
            <div class="table_meta">
              총 <strong>{{ sheets.items.length }}</strong>건
            </div>
            <div class="table_wrap">
              <table class="sheet_table">
                <thead>
                  <tr>
                    <th v-for="key in columnKeys" :key="key">{{ key }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in sheets.items" :key="i">
                    <td v-for="key in columnKeys" :key="key">{{ row[key] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <!-- 빈 데이터 -->
          <p v-else-if="!sheets.isLoading && sheets.lastFetched" class="empty_msg">
            데이터가 없습니다.
          </p>

        </section>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSheetsStore } from '@/stores/api'

// ─── 시트 정의 ───────────────────────────────
// name: Google Sheets API에 전달할 range 문자열
// label: 탭 버튼에 표시할 텍스트
const SHEETS = [
  { label: '환경설정',      range: '환경설정!A2:Z' },
  { label: '작품리스트',    range: '작품리스트!A2:Z' },
  { label: '주문서',        range: '주문서!A3:Z' }, // 2행 합계 → 3행부터 헤더
  { label: '경매등록',      range: '경매등록!A2:Z' },
  { label: '경매입찰내역',   range: '경매입찰내역!A2:Z' },
  { label: '쿠폰관리',      range: '쿠폰관리!A2:Z' },
  { label: '운송장필터링',   range: '운송장필터링!A2:Z' },
  { label: '세무정산',      range: '세무정산!A3:Z' }, // 2행 합계 → 3행부터 헤더
  { label: '배송비관리',    range: '배송비관리!A2:Z' },
  { label: '배송국가티어',  range: '배송국가티어!A2:Z' },
  { label: '참고_관리방법', range: '참고_관리방법!A1:Z' }
]

const sheets = useSheetsStore()

// 현재 선택된 시트 (기본: 1. 작품리스트)
const activeSheet = ref(SHEETS[0])

// 테이블 컬럼 키 (빈 헤더 제외)
const columnKeys = computed(() =>
  sheets.items.length ? Object.keys(sheets.items[0]).filter(k => k !== '') : []
)

// 현재 시트 데이터 호출
function loadCurrentSheet() {
  sheets.fetchItems(undefined, activeSheet.value.range)
}

// 탭 클릭 → 시트 변경 후 바로 호출
function selectSheet(sheet) {
  if (activeSheet.value.range === sheet.range && sheets.items.length) return
  activeSheet.value = sheet
  sheets.clearData()
  loadCurrentSheet()
}

// 마운트 시 기본 시트 자동 로드
onMounted(loadCurrentSheet)
</script>
