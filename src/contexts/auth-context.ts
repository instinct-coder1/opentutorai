import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthResult {
  error: string | null;
}

export interface SignUpResult extends AuthResult {
  needsConfirmation: boolean;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName: string) => Promise<SignUpResult>;
  signOut: () => Promise<AuthResult>;
  requestPasswordSetup: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
