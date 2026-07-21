<template>
  <div class="home-container">
    <StoreView />
    
    <div class="container">
      <ShippingInfo></ShippingInfo>
    </div>
  </div>
</template>

<script setup>
import StoreView from '@/views/Shopping/StoreView.vue';
import ShippingInfo from '@/views/Shopping/ShippingInfo.vue';
</script>

<style lang="scss" scoped></style>