<template>
  <v-card class="pa-4" max-width="500">
    <v-card-title>{{ formTitle }}</v-card-title>

    <v-form @submit.prevent="submitForm">
      <v-text-field v-model="localName" label="Name" required></v-text-field>

      <v-avatar size="100">
        <img
            :src="croppedImage || previewAvatar || authStore.user?.avatar || defaultAvatar"
            alt="Avatar Preview"
            class="avatar-img"
        />
      </v-avatar>

      <v-file-input label="Upload Avatar" accept="image/*" @change="handleFileChange"></v-file-input>

      <v-btn color="primary" type="submit" block>{{ submitButtonText }}</v-btn>
    </v-form>

    <v-btn v-if="isEditMode" color="secondary" block @click="$emit('cancel')">Cancel</v-btn>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmationDialog" max-width="400">
      <v-card>
        <v-card-title>Confirm Profile Setup</v-card-title>
        <v-card-text>Are you sure you want to complete your profile with this information?</v-card-text>
        <v-card-actions>
          <v-btn color="grey" @click="confirmationDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="confirmSubmit">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Crop Dialog -->
    <v-dialog v-model="cropDialog" max-width="400">
      <v-card>
        <v-card-title>Crop Your Avatar</v-card-title>
        <v-card-text>
          <Cropper ref="cropper" class="cropper" :src="imageSrc" :stencil-props="{ aspectRatio: 1 }"/>
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey" @click="cropDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="cropImage">Crop</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const authStore = useAuthStore();

const props = defineProps({
  name: String,
  avatar: String,
  isEditMode: Boolean
});
const emit = defineEmits(['submit', 'cancel']);

const localName = ref(props.name || '');
const avatarFile = ref(null);
const previewAvatar = ref(props.avatar || defaultAvatar);
const croppedImage = ref(null);
const cropDialog = ref(false);
const confirmationDialog = ref(false);
const imageSrc = ref(null);
const cropper = ref(null);
const defaultAvatar = '/avatar-default.png'; // Fallback avatar from public folder

const formTitle = props.isEditMode ? 'Edit Profile' : 'Complete Your Profile';
const submitButtonText = props.isEditMode ? 'Save' : 'Finish Setup';

watch(() => props.avatar, (newAvatar) => {
  previewAvatar.value = newAvatar || defaultAvatar;
});

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

const resizeImage = (canvas, maxWidth, maxHeight) => {
  return new Promise((resolve) => {
    const offscreenCanvas = document.createElement('canvas');
    const ctx = offscreenCanvas.getContext('2d');

    offscreenCanvas.width = maxWidth;
    offscreenCanvas.height = maxHeight;

    ctx.drawImage(canvas, 0, 0, maxWidth, maxHeight);

    offscreenCanvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
  });
};

const submitForm = () => {
  if (!localName.value.trim()) {
    alert('Please enter a name before proceeding.');
    return;
  }
  confirmationDialog.value = true; // Open confirmation dialog
};

const confirmSubmit = () => {
  confirmationDialog.value = false;
  emit('submit', {
    name: localName.value,
    avatarFile: avatarFile.value || null // Ensure null instead of empty string
  });
};
</script>

<style scoped>
.cropper {
  width: 100%;
  height: 300px;
}

.avatar-img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
</style>
