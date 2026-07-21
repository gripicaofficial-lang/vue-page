import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSheetAsObjects, getSheetData } from '@/services/googleSheets'

export const useConfigStore = defineStore('config', () => {
  const coupons = ref([])
  const shippingTiers = ref([])
  const shippingRates = ref([])
  const globalConfig = ref({})
  
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref(null)

  async function fetchConfigs() {
    if (isLoaded.value) return // 이미 로드되었으면 스킵
    
    isLoading.value = true
    error.value = null

    try {
      // 4개의 시트를 병렬로 가져옵니다.
      const [couponData, rateData, tierData, envData] = await Promise.all([
        getSheetAsObjects(undefined, '쿠폰관리!A2:Z'),
        getSheetAsObjects(undefined, '배송비관리!A2:Z'),
        getSheetAsObjects(undefined, '배송국가티어!A2:Z'),
        getSheetAsObjects(undefined, '환경설정!A2:Z')
      ])

      coupons.value = couponData
      shippingRates.value = rateData
      shippingTiers.value = tierData
      
      // 환경설정 시트는 단일 Row 데이터를 가집니다.
      globalConfig.value = envData.length > 0 ? envData[0] : {}
      
      isLoaded.value = true
    } catch (e) {
      console.error('Config Fetch Error:', e)
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  return { 
    coupons, 
    shippingTiers, 
    shippingRates, 
    globalConfig,
    isLoading, 
    isLoaded, 
    error, 
    fetchConfigs 
  }
})
