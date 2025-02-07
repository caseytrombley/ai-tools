<template>
  <v-dialog v-model="modalStore.isSignInVisible" max-width="500px">
    <v-card>
      <v-card-title class="text-h6 text-center">
        {{ isSignUp ? 'Sign Up' : 'Sign In' }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleEmailAuth">
          <v-text-field
              v-model="email"
              label="Email"
              type="email"
              required
          ></v-text-field>

          <v-text-field
              v-model="password"
              label="Password"
              type="password"
              required
          ></v-text-field>

          <div class="text-center mt-4">
            <v-btn color="red" variant="outlined" block @click="signInWithGoogle">
              Sign in with Google
            </v-btn>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn variant="text" @click="modalStore.closeSignIn">Cancel</v-btn>
        <v-btn color="primary" variant="tonal" @click="handleEmailAuth">
          {{ isSignUp ? 'Sign Up' : 'Sign In' }}
        </v-btn>
      </v-card-actions>

      <v-card-text class="text-center">
        <v-btn variant="text" @click="toggleMode">
          {{ isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useModalStore } from '@/stores/modalStore.js';
import { useAuthStore } from '@/stores/authStore.js';

const modalStore = useModalStore();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isSignUp = ref(false);

const toggleMode = () => {
  isSignUp.value = !isSignUp.value;
};

const handleEmailAuth = async () => {
  try {
    if (isSignUp.value) {
      await authStore.signUp(email.value, password.value);
    } else {
      await authStore.signIn(email.value, password.value);
    }
    modalStore.closeSignIn();
  } catch (error) {
    console.error('Authentication Error:', error);
  }
};

const signInWithGoogle = async () => {
  try {
    await authStore.signInWithGoogle();
    modalStore.closeSignIn();
  } catch (error) {
    console.error('Google Sign-in Error:', error);
  }
};
</script>
