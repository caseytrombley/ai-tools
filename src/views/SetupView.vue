<template>
  <v-container>
    <v-card class="pa-4" max-width="500">
      <v-card-title>Complete Your Profile</v-card-title>

      <v-form @submit.prevent="submitSetup">
        <v-text-field v-model="name" label="Name" required></v-text-field>

        <!-- Avatar upload section -->
        <v-file-input
            v-model="avatarFile"
            label="Upload Avatar"
            accept="image/*"
            required
        ></v-file-input>

        <v-btn color="primary" type="submit" block>Save</v-btn>
      </v-form>

      <!-- Success Dialog -->
      <v-dialog v-model="successDialog" persistent>
        <v-card>
          <v-card-title class="headline">Success!</v-card-title>
          <v-card-text>Your profile has been updated.</v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="successDialog = false">Okay</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const name = ref('');
const avatarFile = ref(null);
const successDialog = ref(false); // For the success dialog

const submitSetup = async () => {
  try {
    const userData = { name: name.value, avatarFile: avatarFile.value };
    await authStore.updateUserSetup(userData, router); // Pass router to updateUserSetup

    successDialog.value = true; // Show success dialog after successful update
  } catch (error) {
    console.error('Error during setup:', error);
  }
};
</script>
