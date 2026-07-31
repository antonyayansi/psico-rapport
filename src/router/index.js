import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { App as CapacitorApp } from '@capacitor/app'
import { isAdminEmail } from '../adminEmails'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/consent',
    name: 'Consent',
    component: () => import('../views/ConsentView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('../views/OnboardingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/uwu',
    name: 'UwuChat',
    component: () => import('../views/UwuChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/matching',
    name: 'Matching',
    component: () => import('../views/MatchingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tracking',
    name: 'Tracking',
    component: () => import('../views/TrackingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('../views/CommunityView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/community/post/:id',
    name: 'PostDetail',
    component: () => import('../views/PostDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/ProfileStatsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/therapists',
    name: 'Therapists',
    component: () => import('../views/TherapistsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/therapists/:id',
    name: 'TherapistProfile',
    component: () => import('../views/TherapistProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/therapist-register',
    name: 'TherapistRegister',
    component: () => import('../views/TherapistRegisterView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pet',
    name: 'Pet',
    component: () => import('../views/PetView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Middleware Firebase Auth
const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const removeListener = onAuthStateChanged(
            getAuth(),
            (user) => {
                removeListener();
                resolve(user);
            },
            reject
        );
    });
};

router.beforeEach(async (to, from) => {
  const user = await getCurrentUser()

  if (to.meta.requiresAuth) {
    if (!user) return '/login'

    // Verificar consentimiento (excepto si ya va a la pantalla de consentimiento)
    if (to.path !== '/consent') {
      const db = getFirestore()
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists() && userDoc.data().consentAccepted === false) {
        return '/consent'
      }
      if (to.meta.requiresAdmin) {
        const role = userDoc.exists() ? userDoc.data().role : null
        const allowed = role === 'admin' || isAdminEmail(user.email)
        if (!allowed) return '/stats'
      }
    }

    return true
  } else {
    if (user && (to.path === '/' || to.path === '/login')) {
      return '/uwu'
    }
    return true
  }
})

CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  const path = router.currentRoute.value.path;
  if (path === '/uwu' || path === '/login' || path === '/') {
    CapacitorApp.exitApp();
  } else if (!canGoBack) {
    CapacitorApp.exitApp();
  } else {
    router.back();
  }
});

export default router
