<template>
  <v-card class="pa-4" max-width="500">
    <v-card-title>{{ formTitle }}</v-card-title>

    <v-form @submit.prevent="submitForm">
      <v-text-field v-model="localName" label="Name" required></v-text-field>

      <v-avatar rounded="0" size="100" class="ml-2 mb-3">
        <img :src="croppedImage || previewAvatar || defaultAvatar" alt="Avatar Preview" class="avatar-img" />
      </v-avatar>

      <v-file-input label="Upload Avatar" accept="image/*" @change="handleFileChange"></v-file-input>

      <!-- Save button now disables if no changes -->
      <v-btn color="primary" type="submit" size="large" variant="flat" block :disabled="!hasChanges">{{ submitButtonText }}</v-btn>
    </v-form>

    <v-btn v-if="isEditMode" @click="$emit('cancel')" size="large" variant="flat" class="mt-3" color="secondary" block >Cancel</v-btn>

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
          <Cropper
              ref="cropper"
              class="cropper"
              :src="imageSrc"
              :stencil-component="Stencil"
              :style="{ width: '100%', height: '300px', position: 'relative' }"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey" @click="cropDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="cropImage">Crop</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>

  <!-- Success Dialog -->
  <v-dialog v-model="successDialog" max-width="400" persistent>
    <v-card>
      <v-card-title>Profile Updated</v-card-title>
      <v-card-text>Your profile has been successfully updated!</v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore.js';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import Stencil from './Stencil.vue';

const router = useRouter();
const authStore = useAuthStore();

const props = defineProps({
  name: String,
  avatar: String,
  isEditMode: Boolean
});
const emit = defineEmits(['submit', 'cancel']);

const localName = ref(props.name || '');
const avatarFile = ref(null);
const croppedImage = ref(null);
const cropDialog = ref(false);
const confirmationDialog = ref(false);
const imageSrc = ref(null);
const cropper = ref(null);
const defaultAvatar = '/avatar-default.png';

const formTitle = props.isEditMode ? 'Edit Profile' : 'Complete Your Profile';
const submitButtonText = props.isEditMode ? 'Save' : 'Finish Setup';

const previewAvatar = ref(authStore.user?.avatar || defaultAvatar);

onMounted(() => {
  if (props.isEditMode) {
    localName.value = authStore.user?.name || '';
    previewAvatar.value = authStore.user?.avatar || defaultAvatar;
  }
});

watch(() => authStore.user?.avatar, (newAvatar) => {
  previewAvatar.value = newAvatar || defaultAvatar;
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    avatarFile.value = file;
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
    const fileType = avatarFile.value.type;
    resizeImage(canvas, 180, 180, fileType).then((resizedBlob) => {
      const fileExtension = fileType.split('/')[1];
      const fileName = `${authStore.user?.uid}_${Date.now()}.${fileExtension}`;
      const resizedFile = new File([resizedBlob], fileName, { type: fileType });
      croppedImage.value = URL.createObjectURL(resizedFile);
      avatarFile.value = resizedFile;
    });
  }
  cropDialog.value = false;
};

const resizeImage = (canvas, maxWidth, maxHeight, format) => {
  return new Promise((resolve) => {
    const offscreenCanvas = document.createElement('canvas');
    const ctx = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = maxWidth;
    offscreenCanvas.height = maxHeight;
    ctx.drawImage(canvas, 0, 0, maxWidth, maxHeight);
    offscreenCanvas.toBlob((blob) => resolve(blob), format);
  });
};

const submitForm = () => {
  if (!localName.value.trim()) {
    alert('Please enter a name before proceeding.');
    return;
  }
  confirmationDialog.value = true;
};

const successDialog = ref(false);

const confirmSubmit = () => {
  confirmationDialog.value = false;

  authStore.updateUserSetup(
      { name: localName.value, avatarFile: avatarFile.value || null },
      router
  );

  successDialog.value = true;
  // setTimeout(() => {
  //   successDialog.value = false;
  // }, 1500);
};

// Computed property to check if there are changes
const hasChanges = computed(() => {
  return localName.value !== props.name || avatarFile.value !== null;
});
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
  border-radius: 50%;
}
</style>
