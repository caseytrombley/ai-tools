<template>
  <v-container>
    <v-card class="pa-4" max-width="500">
      <v-card-title>Edit Profile</v-card-title>

      <v-form @submit.prevent="saveProfile">
        <v-text-field v-model="name" label="Name" required></v-text-field>

        <v-avatar size="100">
          <img :src="previewAvatar || authStore.user.avatar || defaultAvatar" alt="Avatar Preview">
        </v-avatar>

        <v-file-input
            label="Upload New Avatar"
            accept="image/*"
            @change="handleFileChange"
        ></v-file-input>

        <v-img v-if="croppedImage" :src="croppedImage" class="mt-3" max-height="150"></v-img>

        <v-btn color="primary" type="submit" block>Save</v-btn>
      </v-form>

      <v-btn color="secondary" block @click="cancel">Cancel</v-btn>

      <!-- Crop Dialog -->
      <v-dialog v-model="cropDialog" max-width="400">
        <v-card>
          <v-card-title>Crop Your Avatar</v-card-title>
          <v-card-text>
            <Cropper
                ref="cropper"
                class="cropper"
                :src="imageSrc"
                :stencil-props="{ aspectRatio: 1 }"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn color="grey" @click="cropDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="cropImage">Crop</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Success Dialog -->
      <v-dialog v-model="successDialog" persistent>
        <v-card>
          <v-card-title>Profile Updated</v-card-title>
          <v-card-text>Your changes have been saved.</v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="closeDialog">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const name = ref(authStore.user?.name || '');
const avatarFile = ref(null);
const previewAvatar = ref(authStore.user?.avatar || '');
const successDialog = ref(false);
const cropDialog = ref(false);
const imageSrc = ref(null);
const croppedImage = ref(null);
const cropper = ref(null);
const defaultAvatar = '/default-avatar.png';

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageSrc.value = e.target.result;
      cropDialog.value = true;
    };
    reader.readAsDataURL(file);
  }
};

const cropImage = () => {
  if (!cropper.value) return;

  const { canvas } = cropper.value.getResult();
  if (canvas) {
    resizeImage(canvas, 180, 180).then((resizedBlob) => {
      croppedImage.value = URL.createObjectURL(resizedBlob);
      avatarFile.value = resizedBlob;
    });
  }

  cropDialog.value = false;
};

const saveProfile = async () => {
  try {
    await authStore.updateUserSetup({ name: name.value, avatarFile: avatarFile.value }, router);
    successDialog.value = true;
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
</script>
