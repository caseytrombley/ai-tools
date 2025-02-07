import { defineStore } from 'pinia';
import { auth, db, storage } from '../../firebaseConfig.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';  // Correct import for Firebase Storage

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
                await this.createUserInFirestore(result.user);
            } catch (error) {
                console.error('Error signing up:', error);
                throw error;
            }
        },

        async signInWithGoogle(router) {
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(auth, provider);
                this.setUser(result.user);
                await this.createUserInFirestore(result.user);
                await this.checkUserSetup(result.user, router); // This will now work
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
                    name: '',
                    avatar: '',
                    createdAt: new Date(),
                });
            }
        },

        // Define the checkUserSetup function here
        async checkUserSetup(user, router) {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (!userData.name || !userData.avatar) {
                    // If name or avatar is missing, redirect to setup page
                    router.push('/setup');
                } else {
                    // If setup is complete, proceed to the homepage
                    router.push('/');
                }
            }
        },

        async uploadAvatar(file) {
            // Define the file path in Firebase Storage (avatars folder)
            const fileRef = storageRef(storage, 'avatars/' + file.name);
            const uploadTask = uploadBytesResumable(fileRef, file);

            // Monitor the upload progress
            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                    },
                    (error) => {
                        console.error('Error during file upload:', error);
                        reject(error);  // Reject promise if error occurs
                    },
                    async () => {
                        try {
                            // Get the download URL once the file has been uploaded
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            console.log('File available at:', downloadURL);
                            resolve(downloadURL);  // Resolve promise with download URL
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
        },

        async updateUserSetup(userData, router) {
            if (!this.user) return;

            const userRef = doc(db, 'users', this.user.uid);

            // If avatar file is provided, upload it and set the URL
            let avatarURL = '';
            if (userData.avatarFile) {
                avatarURL = await this.uploadAvatar(userData.avatarFile);  // Ensure avatarURL is set before update
            }

            // Update user data in Firestore
            await updateDoc(userRef, {
                name: userData.name,
                avatar: avatarURL || '',  // Use an empty string if no avatar is set
            });

            // Redirect to homepage after successful setup
            router.push('/');
        },

        setUser(user) {
            this.user = user;
        },

        async logout(router) {
            await signOut(auth);
            this.user = null;
            router.push('/auth');
        },
    },
});
