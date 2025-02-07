<template>

  <v-app id="app">
    <AppNav />

    <router-view />

    <ModalAuth />
  </v-app>

</template>

<script setup>
import ModalAuth from '@/components/ModalAuth.vue';
import AppNav from "@/components/AppNav.vue";
</script>

<style lang="scss">

</style>
