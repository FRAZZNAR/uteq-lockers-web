import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Usuario, LoginDto } from "../types";
import api from "../services/api";

interface AuthStore {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAlumno: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,
      isAdmin: false,
      isAlumno: false,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: async (dto) => {
        const res = await api.auth.login(dto);
        const { token, usuario } = res.data.data!;
        set({
          token,
          usuario,
          isAuthenticated: true,
          isAdmin: usuario.rol === "Admin",
          isAlumno: usuario.rol === "Alumno",
        });
      },

      logout: () => {
        set({
          token: null,
          usuario: null,
          isAuthenticated: false,
          isAdmin: false,
          isAlumno: false,
        });
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && state?.usuario) {
          state.isAuthenticated = true;
          state.isAdmin = state.usuario.rol === "Admin";
          state.isAlumno = state.usuario.rol === "Alumno";
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useAuthStore;
