import { create } from 'zustand'
import type { LockerMapaItem } from '../types'
import api from '../services/api'

interface LockerStore {
  mapaH: { pisoNumero: number; lockers: LockerMapaItem[] }[]
  mapaK: { pisoNumero: number; lockers: LockerMapaItem[] }[]
  cargando: boolean
  fetchMapa: (edificioId: string, edificio: 'H' | 'K') => Promise<void>
}

const useLockerStore = create<LockerStore>((set) => ({
  mapaH: [],
  mapaK: [],
  cargando: false,

  fetchMapa: async (edificioId, edificio) => {
    set({ cargando: true })
    try {
      const res = await api.lockers.mapa(edificioId)
      const pisos = res.data.data ?? []
      if (edificio === 'H') {
        set({ mapaH: pisos })
      } else {
        set({ mapaK: pisos })
      }
    } finally {
      set({ cargando: false })
    }
  },
}))

export default useLockerStore
