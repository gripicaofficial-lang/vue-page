/**
 * API 통합 Pinia 스토어
 * Google Sheets API의 상태를 관리합니다.
 *
 * [Gemini 스토어 재연결 시]
 * 1. src/services/gemini.js 복구
 * 2. .env.local에 VITE_GEMINI_API_KEY, VITE_GEMINI_MODEL 추가
 * 3. 이 파일에 useGeminiStore 복구 (generateText, generateChat import 포함)
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSheetData, getSheetAsObjects } from '@/services/googleSheets'

// ─────────────────────────────────────────────
// Google Sheets 스토어
// ─────────────────────────────────────────────
export const useSheetsStore = defineStore('sheets', () => {
  const rows = ref([])          // 원시 2차원 배열 데이터
  const items = ref([])         // 헤더 기반 객체 배열 데이터
  const isLoading = ref(false)
  const error = ref(null)
  const lastFetched = ref(null) // 마지막 fetch 시각

  /**
   * 원시 행 배열로 데이터를 가져옵니다.
   * @param {string} [sheetId]
   * @param {string} [range]
   */
  async function fetchRows(sheetId, range) {
    isLoading.value = true
    error.value = null

    try {
      rows.value = await getSheetData(sheetId, range)
      lastFetched.value = new Date()
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 헤더 기반 객체 배열로 데이터를 가져옵니다.
   * 첫 번째 행이 컬럼명(헤더)이어야 합니다.
   * @param {string} [sheetId]
   * @param {string} [range]
   */
  async function fetchItems(sheetId, range) {
    isLoading.value = true
    error.value = null

    try {
      items.value = await getSheetAsObjects(sheetId, range)
      lastFetched.value = new Date()
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  /** 데이터 초기화 */
  function clearData() {
    rows.value = []
    items.value = []
    error.value = null
    lastFetched.value = null
  }

  return { rows, items, isLoading, error, lastFetched, fetchRows, fetchItems, clearData }
})
