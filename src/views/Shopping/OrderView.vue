<template>
  <div class="container">
    <main>
      <div class="main__layout_bx">
        <div class="page__title_bx">
          <h2>{{ $t('order.title') || '주문하기' }}</h2>
          <p>{{ $t('order.desc') || '안전하고 빠른 결제를 진행합니다.' }}</p>
        </div>
        
        <div v-if="configStore.isLoading" class="loading_msg">
          <span class="spinner"></span> 설정 데이터를 불러오는 중...
        </div>

        <div class="order_content" v-else-if="cartStore.items.length > 0">
          
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
              v-if="isGlobalOpen"
              type="button"
              :class="['tab_btn', { active: activeTab === 'global' }]" 
              @click="activeTab = 'global'"
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
              <div class="form_group coupon_group">
                <label for="couponCode">패트리온 멤버십 코드</label>
                <div class="coupon_input_bx">
                  <input type="text" id="couponCode" v-model="commonData.couponCode" placeholder="발급받으신 코드를 입력하세요" />
                  <button type="button" @click="verifyCoupon" class="verify_btn">인증하기</button>
                </div>
                <p v-if="couponMessage" class="coupon_msg" :class="{ success: isCouponValid, error: !isCouponValid }">{{ couponMessage }}</p>
              </div>

              <div class="form_group terms_group">
                <label class="checkbox_label">
                  <input type="checkbox" v-model="commonData.agreeTerms" required />
                  <span>[필수] 상품 사용 유의사항 및 주문 관련 약관에 동의합니다.</span>
                </label>
              </div>
              
              <div class="order_summary">
                <h3>주문 요약</h3>
                <ul class="summary_item_list">
                  <li v-for="item in cartStore.items" :key="item.product_id" class="summary_item">
                    <div class="item_img">
                      <img :src="getImage(item)" :alt="item['작품명'] || item.title" />
                    </div>
                    <div class="item_info">
                      <span class="item_name">
                        <span v-if="isItemSoldOut(item)" class="sold_out_badge">품절</span>
                        {{ item.title || item['작품명'] }}
                      </span>
                      <span class="item_qty">수량: {{ item.quantity }}개</span>
                      <span class="item_price" v-if="activeTab === 'domestic'">{{ (cartStore.parsePrice(item.price_usd || item['가격'] || item['추정가']) * item.quantity * 1350).toLocaleString() }}원</span>
                      <span class="item_price" v-else>{{ cartStore.formatPrice(cartStore.parsePrice(item.price_usd || item['가격'] || item['추정가']) * item.quantity) }}</span>
                      
                      <!-- 페트리온 할인 표시 텍스트 -->
                      <div v-if="isCouponValid && getItemDiscountString(item)" class="item_discount_text">
                        <span>🎉 페트리온 {{ getItemDiscountString(item) }} 할인 적용 완료!</span>
                      </div>
                    </div>
                  </li>
                </ul>
                
                <div class="summary_row">
                  <span>작품 총액:</span>
                  <span v-if="activeTab === 'domestic'">{{ (baseTotal * 1350).toLocaleString() }}원</span>
                  <span v-else>{{ cartStore.formatPrice(baseTotal) }}</span>
                </div>
                <div class="summary_row discount" v-if="discountAmount > 0">
                  <span>할인 적용 (-):</span>
                  <span v-if="activeTab === 'domestic'">- {{ (discountAmount * 1350).toLocaleString() }}원</span>
                  <span v-else>- {{ cartStore.formatPrice(discountAmount) }}</span>
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
              
              <div v-if="hasSoldOutItems" class="error_msg" style="font-weight: bold; margin-bottom: 15px;">
                🚨 장바구니에 품절된 상품이 포함되어 결제할 수 없습니다. 장바구니를 수정해 주세요.
              </div>

              <button type="submit" class="submit_btn" :disabled="isSubmitting || hasSoldOutItems">
                <span v-if="isSubmitting" class="spinner"></span>
                {{ isSubmitting ? '처리 중...' : (activeTab === 'domestic' ? '주문 제출하기' : 'Request Invoice') }}
              </button>
              <p class="error_msg" v-if="errorMessage">{{ errorMessage }}</p>
            </div>
          </form>
        </div>
        
        <div class="empty_cart_msg" v-else-if="!isSuccess">
          <p>장바구니가 비어 있습니다.</p>
          <router-link to="/store" class="go_store_btn">스토어로 돌아가기</router-link>
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
  const status = configStore.globalConfig.is_global_open;
  if (status === true) return true;
  return status && (status.toString().toUpperCase().trim() === 'ON' || status.toString().toUpperCase().trim() === 'TRUE');
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

// 재고 검증 로직
const isItemSoldOut = (item) => {
  const stockStr = item.stock || item['재고'];
  if (stockStr === undefined || stockStr === null || String(stockStr).trim() === '') return false;
  const maxStock = parseInt(stockStr, 10);
  return !isNaN(maxStock) && maxStock <= 0;
}

const hasSoldOutItems = computed(() => {
  return cartStore.items.some(item => isItemSoldOut(item))
})

const getImage = (item) => {
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
        // 상세주소로 포커스 이동 (옵션)
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
  patreonTier: '',
  couponCode: '',
  agreeTerms: false
})

const isSubmitted = ref(false)
const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')
const couponMessage = ref('')
const isCouponValid = ref(false)

const GAS_URL = import.meta.env.VITE_GAS_URL || 'YOUR_GAS_WEB_APP_URL_HERE'

// ----------------------------------------------------
// 계산 및 로직
// ----------------------------------------------------
const baseTotal = computed(() => {
  return cartStore.items.reduce((sum, item) => {
    const price = item.price_usd || item['가격'] || item['추정가'] || 0
    return sum + (cartStore.parsePrice(price) * item.quantity)
  }, 0)
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
    // 국내 배송비: 환경설정에서 가져와서 USD 기준으로 환산 (나중에 1350 곱해서 원래 원화 복구)
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
  cartStore.items.forEach(item => {
    const t = parseInt(item.shipping_tier || item['배송티어'] || item['티어'] || 1, 10)
    if (!isNaN(t) && t > maxTier) maxTier = t
  })
  
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

// 쿠폰 검증
function verifyCoupon() {
  if (!commonData.value.couponCode) {
    couponMessage.value = '코드를 입력해주세요.'
    isCouponValid.value = false
    commonData.value.patreonTier = ''
    return
  }
  
  const inputCode = commonData.value.couponCode.trim().toUpperCase()
  // 모든 컬럼을 뒤져서 코드가 일치하는 행을 찾음
  const coupon = configStore.coupons.find(c => {
    return Object.values(c).some(val => String(val).trim().toUpperCase() === inputCode)
  })
  
  if (coupon) {
    // 상태 체크: 모든 값 중 '사용', 'TRUE', 'ON', 'Y', '활성', 'ACTIVE' 가 하나라도 있으면 유효한 것으로 간주
    // 명시적으로 'IN_ACTIVE', 'FALSE', 'OFF', '중지' 가 있으면 안됨
    const valuesStr = Object.values(coupon).map(v => String(v).trim().toUpperCase())
    const isActive = valuesStr.some(v => ['사용', 'TRUE', 'ON', 'Y', '활성', 'ACTIVE'].includes(v))
    const isInactive = valuesStr.some(v => ['중지', 'FALSE', 'OFF', 'N', 'IN_ACTIVE', 'INACTIVE'].includes(v))
    
    // 만료일 체크
    let isExpired = false
    const expiryStr = coupon['expiry_date'] || coupon['만료일'] || coupon['유효기간']
    if (expiryStr) {
      const expiryDate = new Date(expiryStr)
      if (!isNaN(expiryDate.getTime()) && expiryDate < new Date()) {
        isExpired = true
      }
    }
    
    if (isExpired) {
      isCouponValid.value = false
      commonData.value.patreonTier = ''
      couponMessage.value = '사용 기한이 만료된 쿠폰입니다.'
    } else if (isActive || !isInactive) {
      isCouponValid.value = true
      // 패트리온 티어명 추출 시도
      const targetTier = coupon['target_tier'] || coupon.Tier || coupon['티어'] || '멤버'
      commonData.value.patreonTier = targetTier
      couponMessage.value = `💚 페트리온 ${targetTier} 회원님 힘이 되어주셔서 정말 감사합니다. 여기서도 뵙네요!`
    } else {
      isCouponValid.value = false
      commonData.value.patreonTier = ''
      couponMessage.value = '현재 사용이 중지된 쿠폰입니다.'
    }
  } else {
    isCouponValid.value = false
    commonData.value.patreonTier = ''
    couponMessage.value = '유효하지 않거나 만료된 코드입니다.'
  }
}

// 할인율 파싱 로직 (페트리온 등급 매칭)
const getItemDiscountRate = (item, coupon) => {
  const couponTier = String(coupon.target_tier || coupon['대상등급'] || coupon.Tier || '').trim();
  const itemTier = String(item.required_tier || item['요구등급'] || item['티어'] || '').trim();
  
  // 1. 해당 상품이 페트리온 혜택 적용 대상인지 확인
  let isApplicable = false;
  const isPatreonItem = item.is_patreon_only === '예' || item.is_patreon_only === 'TRUE' || (itemTier && itemTier !== '해당없음' && itemTier !== '');
  
  if (isPatreonItem) {
    if (couponTier === '무제한' || couponTier === '전체' || couponTier === 'all' || !couponTier) {
      // 쿠폰 대상이 무제한이면 모든 페트리온 상품에 적용
      isApplicable = true;
    } else if (itemTier === couponTier) {
      // 상품의 요구 등급과 쿠폰의 대상 등급이 일치하면 적용
      isApplicable = true;
    } else if (couponTier.includes(itemTier) || itemTier.includes(couponTier)) {
      // 혹시라도 띄어쓰기 등으로 인한 부분 일치 방어 로직
      isApplicable = true;
    }
  }
  
  // 2. 적용 대상이 아니면 0 반환
  if (!isApplicable) return 0;
  
  // 3. 할인율 추출
  const rateKey = Object.keys(coupon).find(k => ['discount_usd', '할인율', '할인', 'discount'].includes(k.replace(/\s/g, '').toLowerCase()));
  const rawStr = String(rateKey && coupon[rateKey] ? coupon[rateKey] : '0');
  
  let rate = parseFloat(rawStr.replace(/[^0-9.]/g, ''));
  if (rawStr.includes('%') || rate <= 1) {
      if (rate <= 1 && rate > 0 && !rawStr.includes('%')) rate *= 100;
  }
  
  return isNaN(rate) ? 0 : rate;
}

const getItemDiscountString = (item) => {
  if (!isCouponValid.value) return null;
  const inputCode = commonData.value.couponCode.trim().toUpperCase();
  const coupon = configStore.coupons.find(c => {
    return Object.values(c).some(val => String(val).trim().toUpperCase() === inputCode)
  });
  if (!coupon) return null;
  
  const rate = getItemDiscountRate(item, coupon);
  return rate > 0 ? `${rate}%` : null;
}

const discountAmount = computed(() => {
  if (!isCouponValid.value) return 0
  
  const inputCode = commonData.value.couponCode.trim().toUpperCase()
  const coupon = configStore.coupons.find(c => {
    return Object.values(c).some(val => String(val).trim().toUpperCase() === inputCode)
  })
  
  if (!coupon) return 0
  
  let totalDiscount = 0
  
  cartStore.items.forEach(item => {
    if (item.order_type !== 'Auction') {
      const price = cartStore.parsePrice(item.price_usd || item['가격'] || item['추정가'] || '0')
      const itemTotal = price * item.quantity
      const rate = getItemDiscountRate(item, coupon)
      if (rate > 0) {
        totalDiscount += (itemTotal * rate) / 100
      }
    }
  })
  
  return totalDiscount
})

const finalTotalUSD = computed(() => {
  return Math.max(0, baseTotal.value - discountAmount.value + shippingCost.value)
})

const generatedOrderId = ref('')

// ----------------------------------------------------
// 주문 제출
// ----------------------------------------------------
async function submitOrder() {
  if (cartStore.items.length === 0 || hasSoldOutItems.value) return

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

    const rowDataArray = cartStore.items.map(item => {
      const pTitle = item.title || item['작품명'] || ''
      const pId = item.product_id || pTitle
      const oType = item.order_type || 'Normal'
      
      return {
        order_id: '',
        product_id: pId,
        order_type: oType,
        order_date: orderDate,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        country: country,
        product_title: pTitle,
        quantity: (pId.includes('PNG') || pId.includes('TIFF')) ? 'Free' : item.quantity,
        total_usd: finalTotalUSD.value,
        total_krw_1500: finalTotalUSD.value * 1350,
        payment_method: paymentMethod,
        depositor_name: depositorName,
        paypal_txn_id: '',
        shipping_address: shippingAddress,
        tracking_number: '',
        policy: 'Y',
        patreon_tier: oType === 'Auction' ? '해당없음' : (commonData.value.patreonTier || '해당없음'),
        used_coupon: commonData.value.couponCode || 'NONE',
        discount: oType === 'Auction' ? '0' : (isCouponValid.value ? (getItemDiscountString(item) || '0') : '0'),
        status: '결재대기',
        memo: ''
      }
    })

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
      cartStore.clearCart()
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
