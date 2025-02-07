<script setup>
import { useAuthStore } from '@/stores/authStore.js';
import ModalAuth from '@/components/ModalAuth.vue';
import { ref, watch } from 'vue';
import AskAi from "@/components/AskAi.vue";

const authStore = useAuthStore();
const visible = ref(!authStore.user); // Show dialog if user is not signed in

// Watch for changes in authentication state
watch(
    () => authStore.user,
    (newUser) => {
      visible.value = !newUser; // Close dialog when user signs in
    }
);
</script>

<template>
  <div v-if="authStore.user">
    <AskAi />
  </div>

  <ModalAuth v-model:visible="visible" />
</template>

<style lang="scss" scoped>
div {
  padding: 10rem;
  text-align: center;
}
</style>
