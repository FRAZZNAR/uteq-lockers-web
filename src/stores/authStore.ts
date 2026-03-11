import { create } from 'zustand'
import type { Usuario, LoginDto } from '../types'
import api from '../services/api'

interface AuthStore {
  token: string | null
  usuario: Usuario | null
  isAuthenticated: boolean
  isAdmin: boolean
  isAlumno: boolean
  login: (dto: LoginDto) => Promise<void>
  logout: () => void
  init: () => void
}

const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  usuario: null,
  isAuthenticated: false,
  isAdmin: false,
  isAlumno: false,

  // Recupera sesión del localStorage al cargar la app
  init: () => {
    const raw = localStorage.getItem('auth')
    if (raw) {
      try {
        const { token, usuario } = JSON.parse(raw)
        set({
          token,
          usuario,
          isAuthenticated: true,
          isAdmin: usuario.rol === 'Admin',
          isAlumno: usuario.rol === 'Alumno',
        })
      } catch {
        localStorage.removeItem('auth')
      }
    }
  },

  login: async (dto) => {
    const res = await api.auth.login(dto)
    const { token, usuario } = res.data.data!
    localStorage.setItem('auth', JSON.stringify({ token, usuario }))
    set({
      token,
      usuario,
      isAuthenticated: true,
      isAdmin: usuario.rol === 'Admin',
      isAlumno: usuario.rol === 'Alumno',
    })
  },

  logout: () => {
    localStorage.removeItem('auth')
    set({
      token: null,
      usuario: null,
      isAuthenticated: false,
      isAdmin: false,
      isAlumno: false,
    })
  },
}))

export default useAuthStore
