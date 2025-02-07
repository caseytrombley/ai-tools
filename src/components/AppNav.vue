<template>
  <v-app-bar color="primary" flat class="position-relative">
    <v-app-bar-title @click="goHome" class="cursor-pointer">
      Jam-ollama
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- User Menu -->
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item v-if="!authStore.user" @click="goToSignIn">
          <v-list-item-title>Sign In</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="authStore.user" @click="logout">
          <v-list-item-title>Sign Out</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goToSignIn = () => {
  router.push('/auth');
};

const logout = async () => {
  await authStore.logout(router);  // Pass router to logout method
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
