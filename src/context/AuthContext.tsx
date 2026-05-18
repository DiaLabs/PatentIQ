"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthStateChangedListener, signInWithGoogle, signOutUser, SignInResult } from "@/lib/auth";
import { fetchMentorProfile, type Mentor } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  mentorProfile: Mentor | null;
  loading: boolean;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<SignInResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mentorProfile, setMentorProfile] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const res = await fetchMentorProfile();
      setMentorProfile(res.mentor);
    } catch (err) {
      console.error("Failed to refresh mentor profile:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const res = await fetchMentorProfile();
          setMentorProfile(res.mentor);
        } catch (err) {
          console.error("Failed to load mentor profile on login:", err);
        }
      } else {
        setMentorProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    if (isSigningIn) {
      return { user: null, cancelled: true };
    }
    setIsSigningIn(true);
    const resetTimer = setTimeout(() => {
      setIsSigningIn(false);
    }, 2500);
    try {
      const result = await signInWithGoogle();
      if (result.cancelled) {
        setIsSigningIn(false);
      }
      return result;
    } catch (error: any) {
      console.error("Sign in failed:", error);
      throw error;
    } finally {
      clearTimeout(resetTimer);
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        mentorProfile,
        loading,
        isSigningIn,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
