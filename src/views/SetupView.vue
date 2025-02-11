<template>
  <v-container fluid max-width="1200px">
    <UserForm :name="name" :avatar="authStore.user?.avatar" :isEditMode="false" @submit="submitSetup"/>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';
import UserForm from '@/components/UserForm.vue';

const authStore = useAuthStore();
const router = useRouter();

const name = ref('');

const submitSetup = async (userData) => {
  try {
    await authStore.updateUserSetup(userData, router);
    router.push('/');
  } catch (error) {
    console.error('Error during setup:', error);
  }
};
</script>
