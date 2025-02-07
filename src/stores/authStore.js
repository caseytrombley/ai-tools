import { defineStore } from 'pinia'; // <-- Add this import
import { auth, db, storage } from '../../firebaseConfig.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        showSignInModal: false,
        redirectAfterLogin: null,
    }),

    actions: {
        async signUp(email, password) {
            try {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                this.setUser(result.user);
                await this.createUserInFirestore(result.user); // Create user data in Firestore
            } catch (error) {
                console.error('Error signing up:', error);
                throw error;
            }
        },

        async signIn(email, password) {
            try {
                const result = await signInWithEmailAndPassword(auth, email, password);
                this.setUser(result.user);
                await this.checkUserSetup(result.user);
            } catch (error) {
                console.error('Error signing in:', error);
                throw error;
            }
        },

        async signInWithGoogle(router) {
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(auth, provider);
                this.setUser(result.user);
                await this.createUserInFirestore(result.user);
                await this.checkUserSetup(result.user, router);  // Pass the router here
            } catch (error) {
                console.error('Google Sign-in Error:', error);
                throw error;
            }
        },

        async createUserInFirestore(user) {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    email: user.email,
                    name: '',  // Default empty values
                    avatar: '',
                    createdAt: new Date(),
                });
            }
        },

        async checkUserSetup(user, router) {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists() && (!userDoc.data().name || !userDoc.data().avatar)) {
                router.push('/setup');  // Use the passed router to redirect
            } else {
                router.push('/');  // Redirect to home if setup is complete
            }
        },

        async updateUserSetup(userData, router) {
            if (!this.user) return;

            const userRef = doc(db, 'users', this.user.uid);
            await updateDoc(userRef, userData);
            router.push('/');  // Redirect to home after setup
        },

        setUser(user) {
            this.user = user;
        },

        async logout(router) {
            await signOut(auth);
            this.user = null;
            router.push('/auth');  // Redirect to sign-in page after logout
        },

        fetchUser(router) {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    this.setUser(user);
                    const userRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        this.userProfile = userData;

                        // Redirect to setup if missing name or avatar
                        if (!userData.name || !userData.avatar) {
                            router.push('/setup');
                        }
                    }
                }
            });
        },
    }
});
