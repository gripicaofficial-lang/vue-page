<template>
  <div class="container">
    <main>
      <div class="main__layout_bx">
        <div class="page__title_bx">
          <h2>{{ $t('auction.title') || '경매' }}</h2>
          <p>{{ $t('auction.desc') || '현재 진행중인 한정 경매 작품들을 만나보세요.' }}</p>
        </div>
        
        <section class="gallery_section">
          <!-- 로딩 상태 -->
          <div v-if="sheets.isLoading && sheets.items.length === 0" class="gallery_grid">
            <div v-for="n in 4" :key="n" class="skeleton_card">
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
            <p>{{ $t('store.error') || '데이터를 불러오는데 실패했습니다.' }}</p>
            <p class="error_detail">{{ sheets.error }}</p>
            <button class="retry_btn" @click="loadData">{{ $t('store.retry') || '다시 시도' }}</button>
          </div>

          <!-- 빈 데이터 상태 -->
          <div v-else-if="auctionItems.length === 0" class="empty_msg">
            현재 진행중인 경매가 없습니다.
          </div>

          <!-- 작품 갤러리 그리드 -->
          <div v-else class="gallery_grid">
            <article v-for="(item, index) in auctionItems" :key="'auction_'+index" class="product_card" data-aos="fade-up" :data-aos-delay="index * 100">
              <div class="card_image_wrap">
                <img 
                  :src="getImage(item)" 
                  :alt="item['작품명'] || '작품 이미지'" 
                  class="card_image" 
                  loading="lazy" 
                />
                <div class="status_badge" style="background: rgba(239, 68, 68, 0.95);">경매중</div>
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

                <button class="add_cart_btn" @click.stop="buyNow(item)">바로 구매</button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useSheetsStore } from '@/stores/api'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'

const sheets = useSheetsStore()
const { t } = useI18n()
const cartStore = useCartStore()
const router = useRouter()

const buyNow = (item) => {
  cartStore.setAuctionItem(item)
  router.push('/auction-order')
}

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
  if (!sheets.items.length || sheets.error) {
    loadData()
  }
  intervalId = setInterval(() => {
    if (document.visibilityState === 'visible') {
      loadData()
    }
  }, 60000)
  document.addEventListener('visibilitychange', handleVisibility)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  document.removeEventListener('visibilitychange', handleVisibility)
})

const auctionItems = computed(() => {
  return sheets.items.filter(item => {
    const status = item['is_active'] || item['상태'] || item['판매상태'];
    return status === '경매중';
  })
})

watch(auctionItems, (newVal) => {
  if (newVal.length > 0) {
    cartStore.syncWithStock(newVal)
  }
})

const getImage = (item) => {
  const imgUrl = item.image_url || item['이미지'] || item['이미지URL'] || item['image'] || item['thumb'];
  if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
    return imgUrl;
  }
  return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop';
}

const formatPrice = (price) => {
  if (!price) return t('store.priceInquiry') || '가격 문의';
  if (typeof price === 'string' && (price.includes('$') || price.includes('€'))) return price;
  const num = parseInt(price.toString().replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return price;
  return '$' + num.toLocaleString();
}
</script>
