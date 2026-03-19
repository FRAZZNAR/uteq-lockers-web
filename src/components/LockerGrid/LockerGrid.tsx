import LockerCard from './LockerCard'
import type { LockerMapaItem } from '../../types'
import './LockerGrid.css'

interface Props {
  pisos: { pisoNumero: number; lockers: LockerMapaItem[] }[]
  onLockerClick?: (locker: LockerMapaItem) => void
}

const LockerGrid = ({ pisos, onLockerClick }: Props) => {
  if (!pisos.length)
    return <p style={{ color: '#aaaaaa', textAlign: 'center', padding: '32px 0' }}>Sin lockers</p>

  const allLockers = pisos.flatMap((p) => p.lockers)
  const disp = allLockers.filter((l) => l.estado === 'Disponible').length
  const asig = allLockers.filter((l) => l.estado === 'Asignado').length
  const mant = allLockers.filter((l) => l.estado === 'Mantenimiento').length

  // Mayor pisoNumero = Planta Alta, menor = Planta Baja
  // Si solo hay un piso, siempre es Planta Alta
  const pisosOrdenados = [...pisos].sort((a, b) => b.pisoNumero - a.pisoNumero)

  function pisoLabel(index: number): string {
    if (pisosOrdenados.length === 1) return 'Planta Alta'
    return index === 0 ? 'Planta Alta' : 'Planta Baja'
  }

  return (
    <div>

      {/* ── Leyenda + chips de stats ── */}
      <div className="lkg-header">
        <div className="lkg-legend">
          <span className="lkg-legend-item"><span className="lkg-dot lkg-dot-disponible" />Disponible</span>
          <span className="lkg-legend-item"><span className="lkg-dot lkg-dot-asignado" />Asignado</span>
          <span className="lkg-legend-item"><span className="lkg-dot lkg-dot-mantenimiento" />Mantenimiento</span>
        </div>
        <div className="lkg-chips">
          <span className="lkg-chip lkg-chip-total"><strong>{allLockers.length}</strong> total</span>
          <span className="lkg-chip lkg-chip-disp"><strong>{disp}</strong> libres</span>
          <span className="lkg-chip lkg-chip-asig"><strong>{asig}</strong> asignados</span>
          {mant > 0 && <span className="lkg-chip lkg-chip-mant"><strong>{mant}</strong> mant.</span>}
        </div>
      </div>

      {/* ── Pisos ── */}
      {pisosOrdenados.map((piso, index) => {
        const pDisp = piso.lockers.filter((l) => l.estado === 'Disponible').length
        const pAsig = piso.lockers.filter((l) => l.estado === 'Asignado').length
        const pMant = piso.lockers.filter((l) => l.estado === 'Mantenimiento').length

        return (
          <div key={piso.pisoNumero} className="lkg-floor">

            <div className="lkg-floor-header">
              <span className="piso-titulo">{pisoLabel(index)}</span>
              <span className="lkg-floor-count">{piso.lockers.length} lockers</span>
              <div className="lkg-floor-line" />
              <span className="lkg-floor-mini">
                <span style={{ color: '#1a7abf' }}>{pDisp} lib</span>
                {' · '}
                <span style={{ color: '#003B71' }}>{pAsig} asig</span>
                {pMant > 0 && <>{' · '}<span style={{ color: '#d48806' }}>{pMant} mant</span></>}
              </span>
            </div>

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
        )
      })}
    </div>
  )
}

export default LockerGrid