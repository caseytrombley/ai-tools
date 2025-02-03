<template>
  <div>
    <button @click="signInWithGoogle">Sign In with Google</button>
  </div>
</template>

<script>
import { auth } from '../../firebaseConfig.js';
import firebase from 'firebase/app';

export default {
  methods: {
    async signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        console.log('User logged in: ', user);
        // Redirect user to the home page or a dashboard after successful login
        this.$router.push('/home');
      } catch (error) {
        console.error('Error during sign in: ', error);
      }
    },
  },
};
</script>
