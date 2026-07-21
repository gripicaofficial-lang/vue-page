<template>
  <div class="container">
    <main>
      <div class="main__layout_bx">
        <!-- 작가 프로필 섹션 -->
        <section class="profile_section" data-aos="fade-up">
          <div class="profile_image">
            <!-- 프로필 사진 경로를 이곳에 넣어주세요 -->
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" alt="GRIPICA_DRAWING" />
          </div>
          <div class="profile_info">
            <h2 class="profile_name">GRIPICA_DRAWING</h2>
            <div class="profile_socials">
              <a href="#" title="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
              <a href="#" title="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
              <a href="#" title="YouTube"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>
              <a href="#" title="TikTok"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg></a>
            </div>
            <!-- 작가 소개 및 그림 설명 -->
            <p class="profile_desc" v-html="$t('store.profileDesc')"></p>
          </div>
        </section>

        <!-- 포트폴리오 무한 스크롤 마키 애니메이션 -->
        <section class="portfolio_marquee_section" v-if="portfolioItems.length > 0">
          <div class="marquee_container">
            <div class="marquee_track">
              <!-- 원본 세트 -->
              <div class="portfolio_item" v-for="(item, idx) in portfolioItems" :key="'port1_'+idx">
                <img :src="getImage(item)" :alt="item.title || item['작품명']">
              </div>
              <!-- 무한 스크롤을 위한 복제 세트 1 -->
              <div class="portfolio_item" v-for="(item, idx) in portfolioItems" :key="'port2_'+idx">
                <img :src="getImage(item)" :alt="item.title || item['작품명']">
              </div>
              <!-- 무한 스크롤을 위한 복제 세트 2 -->
              <div class="portfolio_item" v-for="(item, idx) in portfolioItems" :key="'port3_'+idx">
                <img :src="getImage(item)" :alt="item.title || item['작품명']">
              </div>
            </div>
          </div>
        </section>

        <div class="page__title_bx mt_80">
          <h2>{{ $t('store.title') }}</h2>
          <p>{{ $t('store.desc') }}</p>
        </div>

        <!-- 갤러리 섹션 -->
        <section class="gallery_section">
          <!-- 로딩 상태 (최초 로드 시에만 스켈레톤 표시) -->
          <div v-if="sheets.isLoading && sheets.items.length === 0" class="gallery_grid">
            <div v-for="n in 8" :key="n" class="skeleton_card">
              <div class="skeleton_img"></div>
              <div class="skeleton_info">
                <div class="skeleton_title"></div>
                <div class="skeleton_price"></div>
              </div>
            </div>
          </div>

          <!-- 에러 상태 -->
          <div v-else-if="sheets.error" class="error_msg" role="alert">
            <div class="error_icon">⚠️</div>
            <p>{{ $t('store.error') }}</p>
            <p class="error_detail">{{ sheets.error }}</p>
            <button class="retry_btn" @click="loadData">{{ $t('store.retry') }}</button>
          </div>

          <!-- 빈 데이터 상태 -->
          <div v-else-if="activeItems.length === 0" class="empty_msg">
            {{ $t('store.empty') }}
          </div>

          <!-- 작품 갤러리 그리드 -->
          <div v-else class="gallery_grid">
            <article v-for="(item, index) in physicalItems" :key="index" class="product_card" data-aos="fade-up" :data-aos-delay="index * 100">
              <div class="card_image_wrap">
                <img 
                  :src="getImage(item)" 
                  :alt="item['작품명'] || '작품 이미지'" 
                  class="card_image" 
                  loading="lazy" 
                />
                <div class="status_badge">{{ $t('store.onSale') }}</div>
                <div class="stock_badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {{ item.stock || item['재고'] || 0 }}
                </div>
              </div>
              <div class="card_content">
                <h3 class="card_title">{{ item.title || item['작품명'] || '이름 없는 작품' }}</h3>
                <p class="card_price">{{ formatPrice(item.price_usd || item['가격'] || item['추정가']) }}</p>
                
                <div class="card_meta" v-if="item.required_tier || item['작가명'] || item['크기'] || item['재질']">
                  <span v-if="item.required_tier" class="meta_tag">{{ item.required_tier }}</span>
                  <span v-if="item.is_patreon_only === '예' || item.is_patreon_only === 'TRUE'" class="meta_tag">Patreon Only</span>
                  <span v-if="item['작가명']" class="meta_tag">{{ item['작가명'] }}</span>
                  <span v-if="item['크기']" class="meta_tag">{{ item['크기'] }}</span>
                  <span v-if="item['재질']" class="meta_tag">{{ item['재질'] }}</span>
                </div>

                <button class="add_cart_btn" @click.stop="cartStore.addToCart({ ...item, order_type: 'Normal' })">장바구니 담기</button>
              </div>
            </article>
          </div>
        </section>

        <!-- 고화질 디지털 파일 섹션 -->
        <div class="page__title_bx mt_80" v-if="!sheets.error && digitalItems.length > 0">
          <h2>고화질 디지털 파일</h2>
          <p>고해상도로 제공되는 특별한 디지털 아트워크입니다.</p>
        </div>
        
        <section class="gallery_section" v-if="!sheets.error && digitalItems.length > 0">
          <div class="gallery_grid">
            <article v-for="(item, index) in digitalItems" :key="'digital_'+index" class="product_card" data-aos="fade-up" :data-aos-delay="index * 100">
              <div class="card_image_wrap">
                <img 
                  :src="getImage(item)" 
                  :alt="item['작품명'] || '작품 이미지'" 
                  class="card_image" 
                  loading="lazy" 
                />
                <div class="status_badge">{{ $t('store.onSale') }}</div>
                <div class="stock_badge" v-if="!item.product_id?.includes('PNG') && !item.product_id?.includes('TIFF')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {{ item.stock || item['재고'] || 0 }}
                </div>
                <div class="stock_badge" v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Free (무제한)
                </div>
              </div>
              <div class="card_content">
                <h3 class="card_title">{{ item.title || item['작품명'] || '이름 없는 작품' }}</h3>
                <p class="card_price">{{ formatPrice(item.price_usd || item['가격'] || item['추정가']) }}</p>
                
                <div class="card_meta" v-if="item.required_tier || item['작가명'] || item['크기'] || item['재질']">
                  <span v-if="item.required_tier" class="meta_tag">{{ item.required_tier }}</span>
                  <span v-if="item.is_patreon_only === '예' || item.is_patreon_only === 'TRUE'" class="meta_tag">Patreon Only</span>
                  <span v-if="item['작가명']" class="meta_tag">{{ item['작가명'] }}</span>
                  <span v-if="item['크기']" class="meta_tag">{{ item['크기'] }}</span>
                  <span v-if="item['재질']" class="meta_tag">{{ item['재질'] }}</span>
                </div>

                <button class="add_cart_btn" @click.stop="cartStore.addToCart({ ...item, order_type: 'Normal' })">장바구니 담기</button>
              </div>
            </article>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch, ref } from 'vue'
import { useSheetsStore } from '@/stores/api'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/stores/cart'

const sheets = useSheetsStore()
const { t } = useI18n()
const cartStore = useCartStore()

const loadData = () => {
  sheets.fetchItems(undefined, '작품리스트!A2:Z')
}

let intervalId = null
const handleVisibility = () => {
  if (document.visibilityState === 'visible') {
    loadData()
  }
}

onMounted(() => {
  // 컴포넌트 마운트 시 데이터 로드
  if (!sheets.items.length || sheets.error) {
    loadData()
  }
  // 1분(60000ms)마다 데이터 갱신 (탭이 활성화되어 있을 때만)
  intervalId = setInterval(() => {
    if (document.visibilityState === 'visible') {
      loadData()
    }
  }, 60000)
  
  // 사용자가 탭으로 돌아왔을 때 즉시 갱신 (보안상 안전하고 불필요한 요청을 줄이는 방식)
  document.addEventListener('visibilitychange', handleVisibility)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  document.removeEventListener('visibilitychange', handleVisibility)
})

// is_active 컬럼 값이 '판매중'인 작품만 필터링
const activeItems = computed(() => {
  return sheets.items.filter(item => {
    const status = item['is_active'] || item['상태'] || item['판매상태'];
    return status === '판매중';
  })
})

const physicalItems = computed(() => {
  return activeItems.value.filter(item => {
    const id = item.product_id || item['작품코드'] || item['품목코드'] || ''
    return !(id.includes('PNG') || id.includes('TIFF'))
  })
})

const portfolioItems = computed(() => {
  return physicalItems.value.slice(0, 5)
})

const digitalItems = computed(() => {
  return activeItems.value.filter(item => {
    const id = item.product_id || item['작품코드'] || item['품목코드'] || ''
    return id.includes('PNG') || id.includes('TIFF')
  })
})

watch(activeItems, (newVal) => {
  if (newVal.length > 0) {
    cartStore.syncWithStock(newVal)
  }
})

// 이미지 URL 추출 (없을 시 fallback 사용)
const getImage = (item) => {
  const imgUrl = item.image_url || item['이미지'] || item['이미지URL'] || item['image'] || item['thumb'];
  if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
    return imgUrl;
  }
  // 기본 대체 이미지 (추상화 아트)
  return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop';
}
// 가격 포맷팅
const formatPrice = (price) => {
  if (!price) return t('store.priceInquiry');
  if (typeof price === 'string' && (price.includes('$') || price.includes('€'))) return price;
  const num = parseInt(price.toString().replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return price;
  return '$' + num.toLocaleString();
}
</script>
