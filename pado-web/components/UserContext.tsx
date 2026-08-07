"use client";
import { createContext, useContext } from "react";

export interface PadoUser {
  student_id: string;
  name: string;
  [key: string]: any;
}

const UserContext = createContext<PadoUser | null>(null);

export function UserProvider({ user, children }: { user: PadoUser; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): PadoUser {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
