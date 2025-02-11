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
        user: JSON.parse(localStorage.getItem('user')) || null,
        showSignInModal: false,
        redirectAfterLogin: null,
        avatarDefault: '/avatar-default.png'
    }),

    actions: {
        async signUp(email, password) {
            try {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await this.createUserInFirestore(result.user);
                await this.fetchUser(result.user.uid);
            } catch (error) {
                console.error('Error signing up:', error);
                throw error;
            }
        },

        async signInWithGoogle(router) {
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(auth, provider);
                await this.createUserInFirestore(result.user);
                await this.fetchUser(result.user.uid);
                await this.checkUserSetup(router);
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

        async fetchUser(uid) {
            const userRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                this.setUser({ uid, ...userDoc.data() });
            }
        },

        async checkUserSetup(router) {
            if (!this.user) return;
            if (!this.user.name || !this.user.avatar) {
                router.push('/setup');
            } else {
                router.push('/');
            }
        },

        async uploadAvatar(file) {
            if (!this.user) throw new Error('User not logged in');

            const userUid = this.user.uid;
            const avatarsFolderRef = storageRef(storage, `avatars/`);

            const files = await listAll(avatarsFolderRef);
            const avatarFiles = files.items.filter(item => item.name.startsWith(userUid));

            await Promise.all(
                avatarFiles.map(fileRef =>
                    deleteObject(fileRef).catch(err => console.warn(`Failed to delete ${fileRef.name}`, err))
                )
            );

            const fileName = `${userUid}_${Date.now()}.${file.name.split('.').pop()}`;
            const fileRef = storageRef(storage, `avatars/${fileName}`);
            const uploadTask = uploadBytesResumable(fileRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        console.log(`Upload is ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}% done`);
                    },
                    reject,
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
            let avatarURL = this.user.avatar;

            if (userData.avatarFile) {
                avatarURL = await this.uploadAvatar(userData.avatarFile);
            } else if (this.user.avatar === this.avatarDefault) {
                avatarURL = null;
            }

            await updateDoc(userRef, {
                name: userData.name,
                ...(avatarURL ? { avatar: avatarURL } : {}),
            });

            await this.fetchUser(this.user.uid);
            setTimeout(() => router.push('/'), 1500);
        },

        setUser(user) {
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
        },

        async logout(router) {
            await signOut(auth);
            this.user = null;
            localStorage.removeItem('user');
            router.push('/auth');
        },

        initAuthListener() {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    await this.fetchUser(user.uid);
                } else {
                    this.user = null;
                    localStorage.removeItem('user');
                }
            });
        },
    }
});
