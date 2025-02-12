<template>
  <v-card>
    <v-card-title class="text-h6 text-center">
      {{ isSignUp ? 'Sign Up' : 'Sign In' }}
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="handleEmailAuth">
        <v-text-field v-model="email" label="Email" type="email" required></v-text-field>

        <v-text-field
            v-model="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            required
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
        ></v-text-field>

        <v-text-field
            v-if="isSignUp"
            v-model="confirmPassword"
            label="Confirm Password"
            :type="showPassword ? 'text' : 'password'"
            required
        ></v-text-field>

      </v-form>

      <v-alert v-if="authStore.authError" type="error" class="mb-4">
        {{ authStore.authError }}
      </v-alert>
    </v-card-text>

    <v-card-actions class="pl-4 pr-4">
      <v-btn v-if="isModal" variant="text" @click="modalStore.closeSignIn">Cancel</v-btn>
      <v-btn color="primary" variant="tonal" @click="handleEmailAuth">
        {{ isSignUp ? 'Sign Up' : 'Sign In' }}
      </v-btn>
    </v-card-actions>

    <v-card-text class="text-center">
      <v-btn variant="text" @click="toggleMode">
        {{ isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
      </v-btn>
    </v-card-text>

    <v-card-text>
      <div class="text-center mt-4">
        <v-btn color="red" variant="outlined" block @click="signInWithGoogle">
          Sign in with Google
        </v-btn>
      </div>
    </v-card-text>


  </v-card>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import { useModalStore } from '@/stores/modalStore.js';
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';

const modalStore = useModalStore();
const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isSignUp = ref(false);
const showPassword = ref(false);

const props = defineProps({
  isModal: Boolean,
});

const toggleMode = () => {
  isSignUp.value = !isSignUp.value;
};

const handleEmailAuth = async () => {
  try {
    if (isSignUp.value) {
      if (password.value !== confirmPassword.value) {
        alert('Passwords do not match!');
        return;
      }
      const userCredential = await authStore.signUp(email.value, password.value);
      await authStore.sendEmailVerification(); // Send email verification
      alert('Account created! Please verify your email before signing in.');
    } else {
      console.log('signing in...', email.value, password.value)
      const userCredential = await authStore.signIn(email.value, password.value, router);
      console.log('userCredential', userCredential);
      if (!userCredential.user.emailVerified) {
        alert('Please verify your email before logging in.');
        return;
      }
    }
    router.push('/home'); // Redirect after successful login/signup
    if (props.isModal) modalStore.closeSignIn();
  } catch (error) {
    console.error('Authentication Error:', error);
  }
};

const signInWithGoogle = async () => {
  try {
    await authStore.signInWithGoogle(router);
    if (props.isModal) modalStore.closeSignIn();
  } catch (error) {
    console.error('Google Sign-in Error:', error);
  }
};
</script>
