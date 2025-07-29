"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { cloudflareClient } from "./cloudflare-client"

interface User {
  id: string
  email: string
  name: string
}

interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, name: string) => Promise<User>
  logout: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      login: async (email: string, name: string) => {
        const user = await cloudflareClient.createOrGetUser(email, name)
        set({ user })
        return user
      },
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
)
