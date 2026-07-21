<template>
  <div class="container">
    <main>
      <div class="main__layout_bx">
        <div class="page__title_bx">
          <h2>경매 낙찰 결제</h2>
          <p>경매에 낙찰되신 것을 축하드립니다. 안전하게 결제를 진행합니다.</p>
        </div>
        
        <div v-if="configStore.isLoading" class="loading_msg">
          <span class="spinner"></span> 설정 데이터를 불러오는 중...
        </div>

        <div class="order_content" v-else-if="cartStore.auctionItem">
          
          <!-- 결제 탭 -->
          <div class="payment_tabs">
            <button 
              type="button"
              :class="['tab_btn', { active: activeTab === 'domestic' }]" 
              @click="activeTab = 'domestic'"
            >
              국내 결제 (계좌이체)
            </button>
            <button 
              type="button"
              :class="['tab_btn', { active: activeTab === 'global', disabled: !isGlobalOpen }]" 
              @click="isGlobalOpen && (activeTab = 'global')"
            >
              해외 결제 (PayPal)
            </button>
          </div>

          <form class="order_form" @submit.prevent="submitOrder">
            
            <!-- 국내 결제 폼 -->
            <div v-if="activeTab === 'domestic'">
              <div class="bank_info_box">
                <h4>무통장 입금 안내</h4>
                <p>아래 계좌로 총 결제 금액을 입금해 주세요.</p>
                <div class="bank_details">
                  <span class="bank_name">{{ configStore.globalConfig.bank_name_kr }}</span>
                  <span class="bank_account">{{ configStore.globalConfig.bank_account_kr }}</span>
                  <span class="bank_owner">예금주: {{ configStore.globalConfig.bank_owner_kr }}</span>
                </div>
                <button type="button" class="copy_btn" @click="copyAccount">계좌번호 복사하기</button>
              </div>

              <div class="form_group">
                <label for="d_name">이름 *</label>
                <input type="text" id="d_name" v-model="orderData.domestic.name" required placeholder="수령인 이름" :class="{ 'error_input': isSubmitted && !orderData.domestic.name }" />
              </div>
              
              <div class="form_group">
                <label for="d_phone">연락처 *</label>
                <input type="tel" id="d_phone" v-model="orderData.domestic.phone" required placeholder="010-1234-5678" :class="{ 'error_input': isSubmitted && !orderData.domestic.phone }" />
              </div>

              <div class="form_group">
                <label for="d_depositor">입금자명 *</label>
                <input type="text" id="d_depositor" v-model="orderData.domestic.depositorName" required placeholder="실제 입금하실 분의 이름" :class="{ 'error_input': isSubmitted && !orderData.domestic.depositorName }" />
              </div>

              <div class="form_group">
                <label for="d_address">한글 배송지 주소 *</label>
                <div class="address_search_bx" style="display: flex; gap: 8px; margin-bottom: 8px;">
                  <input type="text" id="d_zonecode" v-model="orderData.domestic.zonecode" required readonly placeholder="우편번호" :class="{ 'error_input': isSubmitted && !orderData.domestic.zonecode }" style="width: 150px;" />
                  <button type="button" @click="openPostcode" class="copy_btn" style="white-space: nowrap;">주소 검색</button>
                </div>
                <input type="text" id="d_address" v-model="orderData.domestic.address" required readonly placeholder="기본 주소" :class="{ 'error_input': isSubmitted && !orderData.domestic.address }" style="margin-bottom: 8px;" />
                <input type="text" id="d_detailAddress" v-model="orderData.domestic.detailAddress" required placeholder="상세 주소를 입력해주세요" :class="{ 'error_input': isSubmitted && !orderData.domestic.detailAddress }" />
              </div>
            </div>

            <!-- 해외 결제 폼 -->
            <div v-if="activeTab === 'global'">
              <div v-if="!isGlobalOpen" class="global_closed_msg">
                <h3>준비 중입니다.</h3>
                <p>현재 해외 배송 및 결제가 일시적으로 중단되었습니다.</p>
              </div>
              
              <div v-else>
                <div class="paypal_info_box">
                  <h4>PayPal Invoice</h4>
                  <p>입력하신 이메일로 인보이스를 보내드립니다. (We will send an invoice to the email you provide.)</p>
                </div>

                <div class="form_group">
                  <label for="g_name">Name *</label>
                  <input type="text" id="g_name" v-model="orderData.global.name" required placeholder="Full Name" :class="{ 'error_input': isSubmitted && !orderData.global.name }" />
                </div>
                
                <div class="form_group">
                  <label for="g_email">PayPal Email Address *</label>
                  <input type="email" id="g_email" v-model="orderData.global.paypalEmail" required placeholder="paypal@example.com" :class="{ 'error_input': isSubmitted && (!orderData.global.paypalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.global.paypalEmail)) }" />
                </div>
                
                <div class="form_group">
                  <label for="g_country">Country *</label>
                  <select id="g_country" v-model="orderData.global.country" required :class="{ 'error_input': isSubmitted && !orderData.global.country }">
                    <option value="">Select a country</option>
                    <option v-for="(c, idx) in availableCountries" :key="idx" :value="c['국가'] || c.Country || c.country || c['국가명']">
                      {{ c['국가'] || c.Country || c.country || c['국가명'] }}
                    </option>
                  </select>
                </div>
                
                <div class="form_group address_group">
                  <label>English Address *</label>
                  <div class="address_inputs">
                    <input type="text" v-model="orderData.global.state" required placeholder="State / Province" :class="{ 'error_input': isSubmitted && !orderData.global.state }" />
                    <input type="text" v-model="orderData.global.city" required placeholder="City" :class="{ 'error_input': isSubmitted && !orderData.global.city }" />
                    <input type="text" v-model="orderData.global.zip" required placeholder="Zip / Postal Code" :class="{ 'error_input': isSubmitted && !orderData.global.zip }" />
                    <input type="text" v-model="orderData.global.street" required placeholder="Street Address" :class="{ 'error_input': isSubmitted && !orderData.global.street }" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 공통 폼 영역 -->
            <div v-if="activeTab === 'domestic' || (activeTab === 'global' && isGlobalOpen)">
              
              <div class="form_group terms_group">
                <label class="checkbox_label">
                  <input type="checkbox" v-model="commonData.agreeTerms" required />
                  <span>[필수] 상품 사용 유의사항 및 주문 관련 약관에 동의합니다.</span>
                </label>
              </div>
              
              <div class="order_summary">
                <h3>주문 요약</h3>
                <ul class="summary_item_list">
                  <li class="summary_item">
                    <div class="item_img">
                      <img :src="getImage(cartStore.auctionItem)" :alt="cartStore.auctionItem['작품명'] || cartStore.auctionItem.title" />
                    </div>
                    <div class="item_info">
                      <span class="item_name">{{ cartStore.auctionItem.title || cartStore.auctionItem['작품명'] }}</span>
                      <span class="item_qty">수량: 1개</span>
                      <span class="item_price" v-if="activeTab === 'domestic'">{{ (cartStore.parsePrice(cartStore.auctionItem.price_usd || cartStore.auctionItem['가격'] || cartStore.auctionItem['추정가']) * 1350).toLocaleString() }}원</span>
                      <span class="item_price" v-else>{{ cartStore.formatPrice(cartStore.parsePrice(cartStore.auctionItem.price_usd || cartStore.auctionItem['가격'] || cartStore.auctionItem['추정가'])) }}</span>
                    </div>
                  </li>
                </ul>
                
                <div class="summary_row">
                  <span>작품 총액:</span>
                  <span v-if="activeTab === 'domestic'">{{ (baseTotal * 1350).toLocaleString() }}원</span>
                  <span v-else>{{ cartStore.formatPrice(baseTotal) }}</span>
                </div>
                <div class="summary_row shipping">
                  <span>배송비 (+):</span>
                  <span v-if="activeTab === 'domestic'">{{ (shippingCost * 1350).toLocaleString() }}원</span>
                  <span v-else>{{ cartStore.formatPrice(shippingCost) }}</span>
                </div>
                
                <div class="total_row">
                  <strong v-if="activeTab === 'domestic'">총 결제 금액 (KRW)</strong>
                  <strong v-else>총 결제 금액 (USD)</strong>
                  
                  <strong v-if="activeTab === 'domestic'">{{ (finalTotalUSD * 1350).toLocaleString() }}원</strong>
                  <strong v-else>{{ cartStore.formatPrice(finalTotalUSD) }}</strong>
                </div>
              </div>

              <button type="submit" class="submit_btn" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner"></span>
                {{ isSubmitting ? '처리 중...' : (activeTab === 'domestic' ? '주문 제출하기' : 'Request Invoice') }}
              </button>
              <p class="error_msg" v-if="errorMessage">{{ errorMessage }}</p>
            </div>
          </form>
        </div>
        
        <div class="empty_cart_msg" v-else-if="!isSuccess">
          <p>선택된 경매 작품이 없습니다.</p>
          <router-link to="/auction" class="go_store_btn">경매로 돌아가기</router-link>
        </div>

        <div class="success_msg" v-if="isSuccess">
          <h3>🎉 주문이 완료되었습니다.</h3>
          <div class="order_number_box">
            <span>주문 번호: </span>
            <strong>{{ generatedOrderId }}</strong>
          </div>
          <p v-if="activeTab === 'domestic'">안내된 계좌로 입금을 완료해 주시면, 확인 후 배송이 시작됩니다!</p>
          <p v-else>An invoice has been requested to your PayPal email. We will process your order shortly!</p>
          <router-link to="/store" class="go_store_btn">쇼핑 계속하기</router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useConfigStore } from '@/stores/config'

const router = useRouter()
const cartStore = useCartStore()
const configStore = useConfigStore()

onMounted(() => {
  configStore.fetchConfigs()

  // 카카오(다음) 우편번호 서비스 스크립트 로드
  const script = document.createElement('script')
  script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
  document.head.appendChild(script)
})

const activeTab = ref('domestic') // 'domestic' | 'global'

const isGlobalOpen = computed(() => {
  const status = configStore.globalConfig.is_global_open
  return status && status.toString().toUpperCase().trim() === 'ON'
})

const copyAccount = () => {
  const account = `${configStore.globalConfig.bank_name_kr} ${configStore.globalConfig.bank_account_kr}`
  navigator.clipboard.writeText(account).then(() => {
    alert('계좌번호가 복사되었습니다.')
  }).catch(() => {
    alert('복사에 실패했습니다. 수동으로 복사해주세요.')
  })
}

// 국가 목록 필터링
const availableCountries = computed(() => {
  return configStore.shippingTiers.filter(c => {
    const zoneStr = (c['존'] || c.Zone || c.zone || c['Zone명'] || '').toString().toLowerCase().trim()
    return zoneStr !== 'unavailable' && zoneStr !== ''
  })
})

const getImage = (item) => {
  if (!item) return 'https://via.placeholder.com/80';
  const imgUrl = item.image_url || item['이미지'] || item['이미지URL'] || item['image'] || item['thumb'];
  if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
    return imgUrl;
  }
  return 'https://via.placeholder.com/80';
}

// 입력 데이터 구조 분리
const orderData = ref({
  domestic: {
    name: '',
    phone: '',
    depositorName: '',
    zonecode: '',
    address: '',
    detailAddress: ''
  },
  global: {
    name: '',
    paypalEmail: '',
    country: '',
    state: '',
    city: '',
    zip: '',
    street: ''
  }
})

const openPostcode = () => {
  if (window.daum && window.daum.Postcode) {
    new window.daum.Postcode({
      oncomplete: function(data) {
        orderData.value.domestic.zonecode = data.zonecode;
        orderData.value.domestic.address = data.address;
        const detailInput = document.getElementById('d_detailAddress');
        if (detailInput) {
          detailInput.focus();
        }
      }
    }).open();
  } else {
    alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
  }
}

const commonData = ref({
  agreeTerms: false
})

const isSubmitted = ref(false)
const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')
const generatedOrderId = ref('')

const GAS_URL = import.meta.env.VITE_GAS_URL || 'YOUR_GAS_WEB_APP_URL_HERE'

// ----------------------------------------------------
// 계산 로직 (프론트엔드)
// ----------------------------------------------------
const baseTotal = computed(() => {
  if (!cartStore.auctionItem) return 0
  const price = cartStore.auctionItem.price_usd || cartStore.auctionItem['가격'] || cartStore.auctionItem['추정가'] || 0
  return cartStore.parsePrice(price)
})

const getDomesticShippingFee = () => {
  const feeStr = configStore.globalConfig.shipping_fee_kr;
  if (!feeStr) return 3000;
  const num = parseInt(feeStr.toString().replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 3000 : num;
}

// 배송비 계산
const shippingCost = computed(() => {
  if (activeTab.value === 'domestic') {
    // 국내 배송비: 환경설정에서 가져와서 USD 기준으로 환산
    return getDomesticShippingFee() / 1350 
  }

  if (!orderData.value.global.country) return 0
  
  const countryData = configStore.shippingTiers.find(
    c => (c['국가'] || c.Country || c.country || c['국가명']) === orderData.value.global.country
  )
  if (!countryData) return 20 
  
  const zoneStr = countryData['존'] || countryData.Zone || countryData.zone || countryData['Zone명'] || '1'
  const zoneMatch = zoneStr.toString().match(/\d+/)
  const zone = zoneMatch ? zoneMatch[0] : '1'
  
  let maxTier = 1
  if (cartStore.auctionItem) {
    const t = parseInt(cartStore.auctionItem.shipping_tier || cartStore.auctionItem['배송티어'] || cartStore.auctionItem['티어'] || 1, 10)
    if (!isNaN(t) && t > maxTier) maxTier = t
  }
  
  const rateData = configStore.shippingRates.find(
    r => {
      const rTier = (r['티어'] || r.Tier || r.tier || '').toString().match(/\d+/)
      return rTier && rTier[0] === maxTier.toString()
    }
  )
  
  if (rateData) {
    const price = rateData['존' + zone] || rateData['Zone ' + zone] || rateData['Zone' + zone] || rateData['zone' + zone + '_price'] || 0
    return cartStore.parsePrice(price)
  }
  return 15
})

// 최종 금액 (USD)
const finalTotalUSD = computed(() => {
  return Math.max(0, baseTotal.value + shippingCost.value)
})

// ----------------------------------------------------
// 주문 제출
// ----------------------------------------------------
async function submitOrder() {
  if (!cartStore.auctionItem) return

  isSubmitted.value = true

  // 유효성 검증
  if (activeTab.value === 'domestic') {
    const d = orderData.value.domestic
    if (!d.name || !d.phone || !d.depositorName || !d.zonecode || !d.address || !d.detailAddress || !commonData.value.agreeTerms) {
      errorMessage.value = '필수 항목을 모두 입력해주세요.'
      return
    }
  } else {
    const g = orderData.value.global
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!g.paypalEmail || !emailRegex.test(g.paypalEmail)) {
      errorMessage.value = '유효한 PayPal 이메일 주소를 입력해주세요.'
      return
    }
    if (!g.name || !g.country || !g.state || !g.city || !g.zip || !g.street || !commonData.value.agreeTerms) {
      errorMessage.value = '필수 항목을 모두 입력해주세요.'
      return
    }
  }

  if (GAS_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
    alert("GAS 웹 앱 URL이 설정되지 않았습니다.")
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const orderDate = new Date().toISOString()
    const item = cartStore.auctionItem
    
    const pTitle = item.title || item['작품명'] || ''
    const pId = item.product_id || pTitle
    const oType = item.order_type || 'Auction'
    
    // 데이터 포맷팅
    let buyerName, buyerEmail, country, shippingAddress, paymentMethod, depositorName
    
    if (activeTab.value === 'domestic') {
      buyerName = orderData.value.domestic.name
      buyerEmail = '' // 국내는 이메일 생략
      country = '대한민국'
      shippingAddress = `[${orderData.value.domestic.zonecode}] ${orderData.value.domestic.address} ${orderData.value.domestic.detailAddress}`
      paymentMethod = '무통장 입금'
      depositorName = orderData.value.domestic.depositorName
    } else {
      buyerName = orderData.value.global.name
      buyerEmail = orderData.value.global.paypalEmail
      country = orderData.value.global.country
      shippingAddress = `${orderData.value.global.street}, ${orderData.value.global.city}, ${orderData.value.global.state} ${orderData.value.global.zip}`
      paymentMethod = 'PayPal'
      depositorName = ''
    }

    const rowDataArray = [{
      order_id: '',
      product_id: pId,
      order_type: oType,
      order_date: orderDate,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      country: country,
      product_title: pTitle,
      quantity: 1,
      total_usd: finalTotalUSD.value,
      total_krw_1500: finalTotalUSD.value * 1350,
      payment_method: paymentMethod, // 추가됨
      depositor_name: depositorName, // 추가됨
      paypal_txn_id: '', 
      shipping_address: shippingAddress,
      tracking_number: '',
      policy: 'Y',
      patreon_tier: '해당없음', // 경매는 패트리온 티어 적용 없음
      used_coupon: 'NONE',
      discount: '0',
      status: '결재대기',
      memo: ''
    }]

    const payload = {
      action: 'processOrder',
      rows: rowDataArray
    }

    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })

    const result = await response.json()
    
    if (result.success) {
      isSuccess.value = true
      generatedOrderId.value = result.order_id || '알 수 없음'
      cartStore.auctionItem = null // 완료 후 초기화
    } else {
      errorMessage.value = '주문 처리 중 오류: ' + result.message
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = '서버 통신에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
