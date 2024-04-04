import { firebaseConfig } from '@/config/firebase'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseDb = getFirestore(firebaseApp)
export const firebaseStorage = getStorage(firebaseApp)
