import { defineStore } from 'pinia';

export const useModalStore = defineStore('modal', {
    state: () => ({
        isSignInVisible: false,
    }),
    actions: {
        openSignIn() {
            this.isSignInVisible = true;
        },
        closeSignIn() {
            this.isSignInVisible = false;
        },
    },
});
