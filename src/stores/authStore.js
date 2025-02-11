import { defineStore } from 'pinia';
import { auth, db, storage } from '../../firebaseConfig.js';
import {
    getAuth, signInWithPopup, GoogleAuthProvider,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut, onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, listAll, deleteObject, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null, // Persist user state
        showSignInModal: false,
        redirectAfterLogin: null,
        avatarDefault: '/avatar-default.png'
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
                const userData = await this.createUserInFirestore(result.user);
                this.setUser({ ...result.user, ...userData });  // Merge Google user data with Firestore data
                await this.checkUserSetup(result.user, router);
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

        async checkUserSetup(user, router) {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (!userData.name || !userData.avatar) {
                    router.push('/setup');
                } else {
                    router.push('/');
                }
            }
        },

        async uploadAvatar(file) {
            if (!this.user) throw new Error('User not logged in');

            const userUid = this.user.uid;
            const avatarsFolderRef = storageRef(storage, `avatars/`);

            // List all files under the "avatars" folder
            const files = await listAll(avatarsFolderRef);
            const avatarFiles = files.items.filter(item => item.name.startsWith(userUid));

            // Delete all files related to this user
            const deletePromises = avatarFiles.map(fileRef => {
                return deleteObject(fileRef)
                    .catch(err => console.warn(`Failed to delete avatar file: ${fileRef.name}`, err));
            });

            // Wait for all deletions to complete
            await Promise.all(deletePromises);

            // Define new file reference
            const fileName = `${userUid}_${Date.now()}.${file.name.split('.').pop()}`;
            const fileRef = storageRef(storage, `avatars/${fileName}`);
            const uploadTask = uploadBytesResumable(fileRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                    },
                    (error) => {
                        console.error('Error during file upload:', error);
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
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
            let avatarURL = this.user.avatar;  // Keep existing avatar by default

            if (userData.avatarFile) {
                avatarURL = await this.uploadAvatar(userData.avatarFile);
            } else if (this.user.avatar === '/avatar-default.png') {
                avatarURL = null;  // Prevent saving default avatar to Firestore
            }

            await updateDoc(userRef, {
                name: userData.name,
                ...(avatarURL ? { avatar: avatarURL } : {}),  // Only update avatar if not empty
            });

            this.user = { ...this.user, name: userData.name, avatar: avatarURL };
            localStorage.setItem('user', JSON.stringify(this.user));

            setTimeout(() => {
                router.push('/');
            }, 1500);
        },

        setUser(user) {
            this.user = user;
            console.log('Saving user to localStorage:', user);  // Debug log
            localStorage.setItem('user', JSON.stringify(user)); // Persist user
        },

        async logout(router) {
            await signOut(auth);
            this.user = null;
            localStorage.removeItem('user'); // Clear storage
            router.push('/auth');
        },

        initAuthListener() {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const userRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        this.setUser({
                            ...user,
                            ...userData,
                            avatar: userData.avatar || '/avatar-default.png'  // Use local default
                        });
                    } else {
                        this.setUser({ ...user, avatar: '/avatar-default.png' });
                    }
                } else {
                    this.user = null;
                    localStorage.removeItem('user');
                }
            });
        }

    }
});
