import { useEffect, useState } from 'react'
import { Select, Space, Card } from 'antd'
import useAuth from '../../hooks/useAuth'
import api from '../../services/api'
import AccesoLogTable from '../../components/AccesoLogTable/AccesoLogTable'
import type { AccesoLog } from '../../types'

const { Option } = Select

const HistorialPage = () => {
  const [accesos, setAccesos] = useState<AccesoLog[]>([])
  const [cargando, setCargando] = useState(true)
  const [resultado, setResultado] = useState<string | undefined>()
  const [metodo, setMetodo] = useState<string | undefined>()
  const { usuario } = useAuth()

  useEffect(() => {
    const cargar = async () => {
      if (!usuario) return
      setCargando(true)
      try {
        const res = await api.accesos.listar({
          alumnoId: usuario.id,
          resultado, metodo,
          page: 1, pageSize: 30,
        })
        setAccesos(res.data.data ?? [])
      } finally { setCargando(false) }
    }
    cargar()
  }, [usuario, resultado, metodo])

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder="Resultado" allowClear style={{ width: 140 }}
            onChange={(v) => setResultado(v)}
          >
            <Option value="Exitoso">Exitoso</Option>
            <Option value="Fallido">Fallido</Option>
          </Select>
          <Select
            placeholder="Método" allowClear style={{ width: 120 }}
            onChange={(v) => setMetodo(v)}
          >
            <Option value="RFID">RFID</Option>
            <Option value="OTP">OTP</Option>
          </Select>
        </Space>
      </Card>

      <AccesoLogTable accesos={accesos} cargando={cargando} paginacion={false} />
    </div>
  )
}

export default HistorialPage
