<template>
  <div>
    <h2>{{ isSignUp ? 'Sign Up' : 'Sign In' }}</h2>

    <form @submit.prevent="handleEmailAuth">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">{{ isSignUp ? 'Sign Up' : 'Sign In' }}</button>
    </form>

    <button @click="toggleMode">
      {{ isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
    </button>

    <hr />

    <button @click="signInWithGoogle">Sign In with Google</button>
  </div>
</template>

<script>
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig.js';

export default {
  data() {
    return {
      email: '',
      password: '',
      isSignUp: false,
    };
  },
  methods: {
    toggleMode() {
      this.isSignUp = !this.isSignUp;
    },
    async handleEmailAuth() {
      try {
        let result;
        if (this.isSignUp) {
          result = await createUserWithEmailAndPassword(auth, this.email, this.password);
          console.log('User signed up:', result.user);
        } else {
          result = await signInWithEmailAndPassword(auth, this.email, this.password);
          console.log('User signed in:', result.user);
        }
        this.$router.push('/home');
      } catch (error) {
        console.error('Error with email authentication:', error);
      }
    },
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('User signed in with Google:', result.user);
        this.$router.push('/home');
      } catch (error) {
        console.error('Error during Google sign in:', error);
      }
    },
  },
};
</script>
