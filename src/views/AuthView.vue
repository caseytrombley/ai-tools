<template>
  <div class="d-flex justify-center align-center" style="min-height: 100vh;">
    <v-row justify="center">
      <v-col cols="12" sm="6">
        <AuthForm :isModal="false" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import AuthForm from '@/components/AuthForm.vue';
</script>
