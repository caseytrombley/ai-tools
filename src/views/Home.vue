<script setup>
import { useAuthStore } from '@/stores/authStore.js';
const authStore = useAuthStore();
</script>

<template>
  <v-container fluid max-width="1200px">
    <h1>
      Welcome to the app
    </h1>
    <div>
      <p v-if="!authStore.user">
        Please <router-link to="/auth">sign in</router-link> or
        <router-link to="/auth">create an account</router-link>.
      </p>
      <p v-else>Welcome, {{ authStore.user.email }}</p>
    </div>

  </v-container>

</template>

<style lang="scss" scoped>

</style>
