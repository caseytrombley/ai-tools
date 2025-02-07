import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import ChatView from '@/views/ChatView.vue';
import AuthView from '@/views/AuthView.vue';
import SetupView from '@/views/SetupView.vue';


const routes = [
    { path: '/', name: 'home', component: Home },
    { path: '/auth', component: AuthView },
    { path: '/setup', component: SetupView },
    { path: '/chat', component: ChatView, meta: { requiresAuth: true } },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
