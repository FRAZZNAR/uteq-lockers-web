import LockerCard from './LockerCard'
import type { LockerMapaItem } from '../../types'
import './LockerGrid.css'

interface Props {
  pisos: { pisoNumero: number; lockers: LockerMapaItem[] }[]
  onLockerClick?: (locker: LockerMapaItem) => void
}

const LockerGrid = ({ pisos, onLockerClick }: Props) => {
  if (!pisos.length) return <p>Sin lockers</p>

  return (
    <div>
      {pisos.map((piso) => (
        <div key={piso.pisoNumero}>
          <div className="piso-titulo">Piso {piso.pisoNumero}</div>
          <div className="locker-grid">
            {piso.lockers.map((locker) => (
              <LockerCard
                key={locker.id}
                locker={locker}
                onClick={onLockerClick ? () => onLockerClick(locker) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default LockerGrid
