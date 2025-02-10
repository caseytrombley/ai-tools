<template>
  <v-container>
    <v-card class="pa-4" max-width="500">
      <v-card-title>Complete Your Profile</v-card-title>

      <v-form @submit.prevent="submitSetup">
        <v-text-field v-model="name" label="Name" required></v-text-field>

        <v-file-input
            label="Upload Avatar"
            accept="image/*"
            @change="handleFileChange"
            required
        ></v-file-input>

        <v-img v-if="croppedImage" :src="croppedImage" class="mt-3" max-height="150"></v-img>

        <v-btn color="primary" type="submit" block>Save</v-btn>
      </v-form>

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
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const name = ref('');
const avatarFile = ref(null);
const imageSrc = ref(null);
const cropDialog = ref(false);
const croppedImage = ref(null);
const successDialog = ref(false);
const cropper = ref(null);

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
    canvas.toBlob((blob) => {
      if (blob) {
        const resizedBlob = new Blob([blob], { type: 'image/jpeg' });
        croppedImage.value = URL.createObjectURL(resizedBlob);
        avatarFile.value = resizedBlob; // Store for upload
      }
    }, 'image/jpeg', 0.7); // Compress image
  }

  cropDialog.value = false;
};

const submitSetup = async () => {
  try {
    const userData = { name: name.value, avatarFile: avatarFile.value };
    await authStore.updateUserSetup(userData, router);

    successDialog.value = true;

    // Redirect to home page after a brief delay
    setTimeout(() => {
      router.push('/');
    }, 1500); // Adjust delay as needed
  } catch (error) {
    console.error('Error during setup:', error);
  }
};

</script>

<style>
.cropper {
  width: 100%;
  height: 300px;
}
</style>
