<template>
  <div>
    <!-- 사이드바 -->
    <div class="cart_sidebar" :class="{ 'is_open': cartStore.isSidebarOpen }">
      <div class="sidebar_header">
        <h2>장바구니 🛒</h2>
        <button class="close_btn" @click="cartStore.toggleSidebar">&times;</button>
      </div>

      <div class="sidebar_content">
        <div v-if="cartStore.items.length === 0" class="empty_cart">
          장바구니가 비어 있습니다.
        </div>
        <ul v-else class="cart_list">
          <li v-for="item in cartStore.items" :key="item.product_id || item.title" class="cart_item">
            <div class="item_img" :style="{ backgroundImage: 'url(' + getImage(item) + ')' }"></div>
            <div class="item_info">
              <h4>{{ item.title || item['작품명'] }}</h4>
              <p>{{ formatPrice(item.price_usd || item['가격']) }}</p>
              <div class="quantity_control">
                <button class="qty_btn" @click="cartStore.decreaseQuantity(item.product_id || item.title || item['작품명'])" :disabled="item.quantity <= 1">-</button>
                <span class="qty_num">{{ item.quantity || 1 }}</span>
                <button class="qty_btn" @click="cartStore.increaseQuantity(item.product_id || item.title || item['작품명'])" :disabled="item.quantity >= (parseInt(item.stock || item['재고'], 10) || 1)">+</button>
                
                <button class="reset_qty_btn" @click="cartStore.resetQuantity(item.product_id || item.title || item['작품명'])" title="수량 1로 초기화">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                </button>
              </div>
            </div>
            <button class="remove_btn" @click="cartStore.removeFromCart(item.product_id || item.title || item['작품명'])">삭제</button>
          </li>
        </ul>
      </div>

      <div class="sidebar_footer" v-if="cartStore.items.length > 0">
        <div class="total">
          <div>총 수량: {{ totalQuantity }}개</div>
          <div class="total_price">총 결제예정금액: <strong>{{ formatPrice(totalPrice) }}</strong></div>
        </div>
        <button class="clear_cart_btn" @click="cartStore.clearCart()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
          장바구니 비우기
        </button>
        <button class="checkout_btn" @click="goCheckout" :disabled="isVerifying">
          {{ isVerifying ? '재고 확인 중...' : '주문하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { getSheetAsObjects } from '@/services/googleSheets'

const cartStore = useCartStore()
const router = useRouter()

const totalQuantity = computed(() => {
  return cartStore.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
})

const totalPrice = computed(() => cartStore.totalAmount)

watch(() => cartStore.isSidebarOpen, (isOpen) => {
  if (isOpen) {
    document.body.classList.add('cart_open')
  } else {
    document.body.classList.remove('cart_open')
  }
})

const getImage = (item) => {
  const imgUrl = item.image_url || item['이미지'] || item['이미지URL'] || item['image'] || item['thumb']
  return (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) 
    ? imgUrl 
    : 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop'
}

const formatPrice = (price) => {
  if (!price) return '가격 문의'
  if (typeof price === 'string' && (price.includes('$') || price.includes('€'))) return price;
  const num = parseInt(price.toString().replace(/[^0-9]/g, ''), 10)
  return isNaN(num) ? price : '$' + num.toLocaleString()
}

const isVerifying = ref(false)

const goCheckout = async () => {
  try {
    isVerifying.value = true
    
    // 1. 주문하기 직전, 최신 재고 및 상태를 시트에서 가져옵니다.
    const latestItems = await getSheetAsObjects(undefined, '작품리스트!A2:Z')
    let isAdjusted = false
    
    // 2. 장바구니 아이템들을 최신 데이터와 비교
    for (let i = cartStore.items.length - 1; i >= 0; i--) {
      const cartItem = cartStore.items[i]
      const id = cartItem.product_id || cartItem.title || cartItem['작품명']
      const latestItem = latestItems.find(item => (item.product_id || item.title || item['작품명']) === id)
      
      if (latestItem) {
        const latestStock = parseInt(latestItem.stock || latestItem['재고'] || '0', 10)
        const status = latestItem.is_active || latestItem['상태'] || latestItem['판매상태']
        
        if (status !== '판매중' && status !== '경매중') {
          cartStore.removeFromCart(id)
          isAdjusted = true
        } else if (cartItem.quantity > latestStock) {
          if (latestStock <= 0) {
            cartStore.removeFromCart(id)
          } else {
            cartItem.quantity = latestStock
          }
          isAdjusted = true
        }
      } else {
        // 시트에서 아예 삭제된 경우
        cartStore.removeFromCart(id)
        isAdjusted = true
      }
    }
    
    // 3. 재고 초과 등으로 조정이 일어났다면 안내 후 페이지 이동 중단
    if (isAdjusted) {
      alert('누군가 먼저 주문하여 일부 상품의 재고가 부족합니다.\n현재 남은 재고에 맞게 장바구니 수량이 조정되었습니다.')
    } else {
      // 이상 없으면 결제 페이지로 이동
      cartStore.toggleSidebar()
      router.push('/Order')
    }
  } catch (error) {
    console.error('재고 확인 중 오류 발생:', error)
    alert('재고 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
  } finally {
    isVerifying.value = false
  }
}
</script>
