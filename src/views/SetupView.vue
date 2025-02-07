<template>
  <v-container>
    <v-card class="pa-4" max-width="500">
      <v-card-title>Complete Your Profile</v-card-title>

      <v-form @submit.prevent="submitSetup">
        <v-text-field v-model="name" label="Name" required></v-text-field>

        <v-file-input
            v-model="avatarFile"
            label="Upload Avatar"
            accept="image/*"
            required
            show-size
        ></v-file-input>

        <v-btn color="primary" type="submit" block>Save</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';

const authStore = useAuthStore();
const name = ref('');
const avatarFile = ref(null); // For handling the avatar file

const submitSetup = async () => {
  if (avatarFile.value) {
    // Upload the avatar image to Firebase Storage
    const avatarRef = authStore.uploadAvatar(avatarFile.value);
    const avatarURL = await avatarRef;  // Get the download URL after uploading

    // Save the name and avatar URL to Firestore
    await authStore.updateUserSetup({ name: name.value, avatar: avatarURL });
  }
};
</script>
