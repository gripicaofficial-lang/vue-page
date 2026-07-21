<template>
<header>
  <h1><router-link to="/">GRIPICA SHOP</router-link></h1>
  <nav>
    <ul>
      <li><router-link to="/Auction">{{ $t('header.auction') || '경매' }}</router-link></li>
      <li><router-link to="/QnA">{{ $t('header.qna') || '자주하는질문' }}</router-link></li>
      <li><router-link to="/ApiLab">{{ $t('header.apiLab') }}</router-link></li>
    </ul>
    <button type="button"><i class="icobx all_menu"></i></button>
  </nav>
  <div class="header-utils">
    <button type="button" class="cart-btn" @click="cartStore.toggleSidebar">
      🛒 <span class="cart-badge" v-if="cartStore.items.length > 0">{{ cartStore.items.length }}</span>
    </button>
    <select v-model="$i18n.locale" class="lang-selector">
      <option value="ko">KO</option>
      <option value="en">EN</option>
      <option value="ja">JA</option>
    </select>
    <button type="button" id="mode__button" @click="toggleTheme" :class="{ 'dark-mode': data.theme === 'dark', 'light-mode': data.theme === 'white' }">{{ buttonText }}</button>
  </div>
  <CartSidebar />
</header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import CartSidebar from '@/components/CartSidebar.vue'

const cartStore = useCartStore()
const data = ref({ theme: 'white' })

const buttonText = computed(() =>
  data.value.theme === 'white' ? 'THEME DARK' : 'THEME WHITE'
)

const toggleTheme = () => {
  data.value.theme = data.value.theme === 'white' ? 'dark' : 'white'
  document.documentElement.setAttribute('data-theme', data.value.theme)
}
</script>

<style lang="scss" scoped>
.header-utils {
  position: fixed;
  top: 30px;
  right: 30px;
  display: flex;
  gap: 10px;
  z-index: 1000;
  align-items: center;
}
.cart-btn {
  position: relative;
  background: var(--color__black_typeA);
  color: var(--color__white_typeA);
  border: none;
  height: 30px;
  padding: 0 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;

  .cart-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #e74c3c;
    color: white;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 5px;
    border-radius: 10px;
    line-height: 1;
  }
}
.lang-selector {
  height: 30px;
  padding: 0 10px;
  background-color: var(--color__black_typeA);
  color: var(--color__white_typeA);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  cursor: pointer;
}
#mode__button {
  position: relative !important;
  top: 0 !important;
  right: 0 !important;
}
</style>
