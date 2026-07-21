import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    // ─────────────────────────────────────────────
    // Gripica Shop
    // ─────────────────────────────────────────────
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Shopping/Home.vue'),
      meta: { layout: 'MainLayout', title: '홈' }
    },
    {
      path: '/Store',
      name: 'Store',
      component: () => import('@/views/Shopping/StoreView.vue'),
      meta: { title: '작품 갤러리' }
    },
    {
      path: '/Auction',
      name: 'Auction',
      component: () => import('@/views/Shopping/AuctionView.vue'),
      meta: { title: '경매' }
    },
    {
      path: '/auction-order',
      name: 'AuctionOrder',
      component: () => import('@/views/Shopping/AuctionOrderView.vue'),
      meta: { title: '경매 주문서' }
    },
    {
      path: '/QnA',
      name: 'QnA',
      component: () => import('@/views/Shopping/QnaView.vue'),
      meta: { title: '자주하는질문' }
    },
    {
      path: '/Order',
      name: 'Order',
      component: () => import('@/views/Shopping/OrderView.vue'),
      meta: { title: '주문서' }
    },

    // ─────────────────────────────────────────────
    // API 테스트 (유지)
    // ─────────────────────────────────────────────
    {
      path: '/ApiLab',
      name: 'ApiLab',
      component: () => import('@/views/Shopping/ApiLab.vue'),
      meta: { title: 'API Lab' }
    },

    // ─────────────────────────────────────────────
    // 포트폴리오 (비활성 — 필요 시 주석 해제)
    // ─────────────────────────────────────────────

    // {
    //   path: '/Works',
    //   name: 'Works',
    //   component: () => import('@/views/Works.vue'),
    //   meta: { title: 'Works' }
    // },
    // {
    //   path: '/WebviewLab',
    //   name: 'WebviewLab',
    //   component: () => import('@/views/WebviewLab.vue'),
    //   meta: { title: 'Webview LAB' }
    // },
    // {
    //   path: '/ComponentGuide',
    //   name: 'ComponentGuide',
    //   component: () => import('@/views/ComponentGuide.vue')
    // },

  ],
  linkActiveClass: 'active',
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

export default router
