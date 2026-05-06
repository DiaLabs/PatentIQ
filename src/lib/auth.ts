import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

const ignoredAuthErrorCodes = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
]);

export type SignInResult = {
  user: User | null;
  cancelled: boolean;
};

export const signInWithGoogle = async (): Promise<SignInResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, cancelled: false };
  } catch (error: any) {
    const code = error?.code;
    if (typeof code === "string" && ignoredAuthErrorCodes.has(code)) {
      return { user: null, cancelled: true };
    }

    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
