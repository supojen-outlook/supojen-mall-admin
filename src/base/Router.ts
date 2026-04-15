import { createRouter, createWebHistory } from 'vue-router'
import { useAccountStore } from '@/stores'
import { getProfile } from '@/services'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomePage.vue'),
            children: [
              {
                  path: 'locations',
                  name: 'locations',
                  component: () => import('@/views/LocationsPage.vue')
              },
              {
                  path: 'products',
                  name: 'products',
                  component: () => import('@/views/ProductsPage.vue')
              },
              {
                  path: 'products/:productId/skus',
                  name: 'product-skus',
                  component: () => import('@/views/SkusPage.vue')
              },
              {
                  path: 'products/:productId/skus/:skuId/sku-inventories',
                  name: 'SkuInventories',
                  component: () => import('@/views/SkuInventoriesPage.vue')
              },
              {
                  path: 'products/categories',
                  name: 'products-categories',
                  component: () => import('@/views/CategoriesPage.vue')
              },
              {
                  path: 'assets',
                  name: 'assets',
                  component: () => import('@/views/AssetsPage.vue')
              },
              {
                  path: 'brands',
                  name: 'brands',
                  component: () => import('@/views/BrandsPage.vue')
              },
              {
                  path: 'inventories',
                  name: 'inventories',
                  component: () => import('@/views/InventoriesPage.vue')
              },
              {
                  path: 'attribute-keys',
                  name: 'attribute-keys',
                  component: () => import('@/views/AttributeKeysPage.vue')
              },
              {
                  path: 'attribute-values',
                  name: 'attribute-values',
                  component: () => import('@/views/AttributeValuesPage.vue')
              },
              {
                  path: 'category-attributes',
                  name: 'category-attributes',
                  component: () => import('@/views/CategoryAttributesPage.vue')
              },
              {
                  path: 'promotions',
                  name: 'promotions',
                  component: () => import('@/views/PromotionsPage.vue')
              },
              {
                  path: 'promotions/:promotionId/rules',
                  name: 'promotion-rules',
                  component: () => import('@/views/PromotionRulesPage.vue')
              },
              {
                  path: 'promotions/:promotionId/scopes',
                  name: 'promotion-scopes',
                  component: () => import('@/views/PromotionScopesPage.vue')
              },
              {
                  path: 'coupons',
                  name: 'coupons',
                  component: () => import('@/views/CouponsPage.vue')
              },
              {
                  path: 'users',
                  name: 'users',
                  component: () => import('@/views/UsersPage.vue')
              },
              {
                  path: 'shipping-rules',
                  name: 'shipping-rules',
                  component: () => import('@/views/ShippingRulesPage.vue')
              },
              {
                  path: 'orders',
                  name: 'orders',
                  component: () => import('@/views/OrdersPage.vue')
              }
            ],
            redirect: '/products'
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginPage.vue')
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('../views/SignupPage.vue')
        },
        {
            path: '/reset-password',
            name: 'reset-password',
            component: () => import('../views/ResetPasswordPage.vue')
        },
    ]
})

router.beforeEach(async (to, _, next)  => {
  const accountStore = useAccountStore()
  const publicPages = ['/login', '/signup', '/reset-password'] // 不需要登入的頁面
  const authRequired = !publicPages.includes(to.path)

  // 如果頁面需要認證但用戶未登入
  if (authRequired && !accountStore.isLogin) {
    try {
      // 嘗試獲取用戶資料
      const profile = await getProfile()

      console.log(profile)

      accountStore.login(profile)
      next()
    } catch (error) {
      // 如果獲取失敗，重定向到登入頁
      next('/login')
    }
  } else {
    if(to.name == '') {
      next('home')
    }else {
      next()
    }
  }
  
})

export default router