// Firebase Authentication Context Provider
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, db } from './config'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { COLLECTIONS } from './collections'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      // Save user to Firestore on first login
      if (firebaseUser) {
        const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid)
        const userSnap = await getDoc(userRef)
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            oauthProvider: firebaseUser.providerData[0]?.providerId || 'unknown',
            oauthId: firebaseUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        }
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Google sign-in error:', error)
      throw error
    }
  }

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Github sign-in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithGithub,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
