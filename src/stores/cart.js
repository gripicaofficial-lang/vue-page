import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const auctionItem = ref(null) // 단일 경매 결제용
  const isSidebarOpen = ref(false)

  // Load from localStorage on initialization
  const savedCart = localStorage.getItem('shopping_cart')
  if (savedCart) {
    try {
      items.value = JSON.parse(savedCart)
    } catch (e) {
      console.error('Failed to load cart from localStorage', e)
    }
  }

  // Watch for changes and save to localStorage
  watch(items, (newItems) => {
    localStorage.setItem('shopping_cart', JSON.stringify(newItems))
  }, { deep: true })

  // Actions
  function addToCart(product) {
    const id = product.product_id || product.title || product['작품명']
    const isDigital = id && (id.includes('PNG') || id.includes('TIFF'))
    const stockStr = product.stock || product['재고'] || '0'
    const maxStock = isDigital ? Infinity : (parseInt(stockStr, 10) || 1)
    
    const existingItem = items.value.find(item => (item.product_id || item.title || item['작품명']) === id)
    if (existingItem) {
      if (existingItem.quantity >= maxStock) {
        alert('현재 등록된 재고(Stock) 이상 담을 수 없습니다.')
      } else {
        existingItem.quantity += 1
        isSidebarOpen.value = true
      }
    } else {
      items.value.push({ ...product, quantity: 1 })
      isSidebarOpen.value = true
    }
  }

  function increaseQuantity(productId) {
    const item = items.value.find(i => (i.product_id || i.title || i['작품명']) === productId)
    if (item) {
      const isDigital = productId && (productId.includes('PNG') || productId.includes('TIFF'))
      const stockStr = item.stock || item['재고'] || '0'
      const maxStock = isDigital ? Infinity : (parseInt(stockStr, 10) || 1)
      if (item.quantity < maxStock) {
        item.quantity += 1
      } else {
        alert('현재 등록된 재고(Stock) 이상 담을 수 없습니다.')
      }
    }
  }

  function decreaseQuantity(productId) {
    const item = items.value.find(i => (i.product_id || i.title || i['작품명']) === productId)
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1
      } else {
        removeFromCart(productId)
      }
    }
  }

  function resetQuantity(productId) {
    const item = items.value.find(i => (i.product_id || i.title || i['작품명']) === productId)
    if (item) {
      item.quantity = 1
    }
  }

  function removeFromCart(productId) {
    items.value = items.value.filter(item => (item.product_id || item.title || item['작품명']) !== productId)
  }

  function clearCart() {
    items.value = []
  }

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function syncWithStock(availableItems) {
    if (!availableItems || availableItems.length === 0) return;
    const availableIds = availableItems.map(item => item.product_id || item.title || item['작품명']);
    const initialLength = items.value.length;
    
    items.value = items.value.filter(item => {
      const id = item.product_id || item.title || item['작품명'];
      return availableIds.includes(id);
    });

    if (initialLength > items.value.length) {
      alert('장바구니에 담긴 일부 상품이 판매 중지되어 자동으로 삭제되었습니다.');
    }
  }

  function setAuctionItem(product) {
    auctionItem.value = { ...product, quantity: 1, order_type: 'Auction' }
  }

  function formatPrice(price) {
    if (price == null || price === '') return '가격 문의';
    if (price === 0) return '$0';
    if (typeof price === 'string' && (price.includes('$') || price.includes('€'))) return price;
    const num = parseFloat(price.toString().replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return price;
    // 천단위 콤마 및 소수점 2자리(선택적) 표기
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); 
  }

  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;
    const num = parseFloat(priceStr.toString().replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  const totalAmount = computed(() => {
    return items.value.reduce((sum, item) => {
      const price = item.price_usd || item['가격'] || '0';
      return sum + (parsePrice(price) * (item.quantity || 1));
    }, 0);
  });

  return { 
    items, 
    auctionItem,
    isSidebarOpen, 
    totalAmount,
    addToCart, 
    removeFromCart, 
    clearCart,
    increaseQuantity, 
    decreaseQuantity, 
    resetQuantity,
    toggleSidebar, 
    syncWithStock,
    setAuctionItem,
    formatPrice,
    parsePrice
  }
})
