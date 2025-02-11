<template>
  <v-container fluid max-width="1200px">
    <UserForm
        :name="authStore.user?.name || ''"
        :avatar="authStore.user?.avatar || '/avatar-default.png'"
        :isEditMode="true"
        @submit="saveProfile"
        @cancel="cancel"
    />
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';
import UserForm from '@/components/UserForm.vue';

const authStore = useAuthStore();
const router = useRouter();

const name = ref(authStore.user?.name || '');

const saveProfile = async (userData) => {
  try {
    await authStore.updateUserSetup(userData, router);
    router.push('/');
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};

const cancel = () => {
  router.push('/');
};
</script>
