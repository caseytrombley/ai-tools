<template>
  <v-app-bar color="primary" flat class="position-relative">
    <v-app-bar-title @click="goHome" class="cursor-pointer">
      Jam-ollama
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- User Avatar & Menu -->
    <v-menu v-if="authStore.user" offset-y>
      <template v-slot:activator="{ props }">
        <v-avatar v-bind="props" size="40">
          <img :src="authStore.user.avatar || defaultAvatar" alt="User Avatar">
        </v-avatar>
      </template>
      <v-list>
        <v-list-item @click="goToEditProfile">
          <v-list-item-title>Edit Profile</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>Sign Out</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Sign In Button for Unauthenticated Users -->
    <v-btn v-if="!authStore.user" @click="goToSignIn" text>
      Sign In
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const defaultAvatar = '/default-avatar.png'; // Fallback avatar

const goHome = () => {
  router.push('/');
};

const goToSignIn = () => {
  router.push('/auth');
};

const goToEditProfile = () => {
  router.push('/edit-profile');
};

const logout = async () => {
  await authStore.logout(router);
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
