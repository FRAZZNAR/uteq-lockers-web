import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";
import useAuthStore from "../../stores/authStore";
import "./LoginPage.css";

type Paso = "credenciales" | "codigo";

const LoginPage = () => {
  const [paso, setPaso] = useState<Paso>("credenciales");
  const [cargando, setCargando] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sesionToken, setSesionToken] = useState("");
  const [codigo, setCodigo] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const codigoRef = useRef<HTMLInputElement>(null);

  // Paso 1: solicitar código 2FA
  const onSubmitCredenciales = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@uteq.edu.mx')) {
      message.error('Solo se aceptan correos institucionales (@uteq.edu.mx)');
      return;
    }
    if (password.length < 8) {
      message.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setCargando(true);
    try {
      const res = await api.auth.solicitarCodigo({ email, password });
      if (!res.data.success || !res.data.data) throw new Error("Error al solicitar código");
      setSesionToken(res.data.data.sesionToken);
      setPaso("codigo");
      message.success("Código enviado a tu correo institucional");
      setTimeout(() => codigoRef.current?.focus(), 100);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: string[] } } })?.response?.data
          ?.errors?.[0] ?? "Credenciales incorrectas";
      message.error(msg);
    } finally {
      setCargando(false);
    }
  };

  // Paso 2: verificar código 2FA
  const onSubmitCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (codigo.length !== 6) {
      message.warning("Ingresa el código de 6 dígitos");
      return;
    }
    setCargando(true);
    try {
      const res = await api.auth.verificarCodigo({ sesionToken, codigo });
      const { token, usuario } = res.data.data!;
      useAuthStore.setState({
        token,
        usuario,
        isAuthenticated: true,
        isAdmin: usuario.rol === "Admin",
        isAlumno: usuario.rol === "Alumno",
      });
      sessionStorage.setItem("userId", usuario.id);
      if (usuario.rol === "Admin") navigate("/admin/dashboard");
      else navigate("/alumno/mi-locker");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: string[] } } })?.response?.data
          ?.errors?.[0] ?? "Código incorrecto o expirado";
      message.error(msg);
      setCodigo("");
    } finally {
      setCargando(false);
    }
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCodigo(val);
  };

  return (
    <div className="lp-root">
      {/* Panel izquierdo */}
      <div className="lp-left">
        <div className="lp-grid-bg" />
        <div className="lp-orb" />
        <div className="lp-left-top">
          <div className="lp-chip">
            <span className="lp-pulse" />
            Sistema activo
          </div>
          <h1 className="lp-big-title">
            UTEQ
            <br />
            <span>Lock</span>ers
          </h1>
          <p className="lp-desc">
            Administración inteligente de casilleros para la Universidad
            Tecnológica de Querétaro.
          </p>
        </div>
        <div className="lp-stats">
          <div className="lp-stat">
            <span className="lp-stat-n">2</span>
            <span className="lp-stat-l">Edificios</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-n">340</span>
            <span className="lp-stat-l">Casilleros</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-n">98%</span>
            <span className="lp-stat-l">Disponibles</span>
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="lp-right">
        <div className="lp-form-wrapper">

          {/* PASO 1: Credenciales */}
          {paso === "credenciales" && (
            <>
              <div className="lp-form-header">
                <p className="lp-welcome">Bienvenido de vuelta</p>
                <h2 className="lp-form-title">Inicia sesión</h2>
              </div>

              <form onSubmit={onSubmitCredenciales} autoComplete="off">
                <div className="lp-field">
                  <label htmlFor="email">Correo</label>
                  <div className="lp-input-row">
                    <span className="lp-input-icon">
                      <MailOutlined />
                    </span>
                    <input
                      id="email"
                      type="email"
                      placeholder="usuario@uteq.edu.mx"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="lp-input-with-icon"
                    />
                  </div>
                </div>

                <div className="lp-field">
                  <label htmlFor="password">Contraseña</label>
                  <div className="lp-input-row">
                    <span className="lp-input-icon">
                      <LockOutlined />
                    </span>
                    <input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="lp-input-with-icon"
                    />
                    <button
                      type="button"
                      className="lp-eye"
                      onClick={() => setShowPwd((v) => !v)}
                    >
                      {showPwd ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="lp-btn" disabled={cargando}>
                  {cargando ? "Verificando..." : "Continuar"}
                  <span className="lp-btn-arrow">
                    <ArrowRightOutlined />
                  </span>
                </button>
              </form>

              <p className="lp-footer" style={{ marginTop: 16 }}>
                <SafetyCertificateOutlined style={{ marginRight: 6 }} />
                Autenticación en dos pasos habilitada
              </p>
            </>
          )}

          {/* PASO 2: Código de verificación */}
          {paso === "codigo" && (
            <>
              <div className="lp-form-header">
                <p className="lp-welcome">Verificación en dos pasos</p>
                <h2 className="lp-form-title">Ingresa el código</h2>
                <p style={{ color: "#888", fontSize: 14, marginTop: 8 }}>
                  Enviamos un código de 6 dígitos a{" "}
                  <strong>{email}</strong>. Revisa tu bandeja de entrada.
                </p>
              </div>

              <form onSubmit={onSubmitCodigo} autoComplete="off">
                <div className="lp-field">
                  <label htmlFor="codigo">Código de verificación</label>
                  <div className="lp-input-row">
                    <span className="lp-input-icon">
                      <SafetyCertificateOutlined />
                    </span>
                    <input
                      id="codigo"
                      ref={codigoRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="000000"
                      value={codigo}
                      onChange={handleCodigoChange}
                      required
                      maxLength={6}
                      className="lp-input-with-icon"
                      style={{ letterSpacing: "0.4em", fontWeight: "bold", fontSize: 22 }}
                    />
                  </div>
                </div>

                <button type="submit" className="lp-btn" disabled={cargando || codigo.length !== 6}>
                  {cargando ? "Verificando..." : "Entrar al sistema"}
                  <span className="lp-btn-arrow">
                    <ArrowRightOutlined />
                  </span>
                </button>
              </form>

              <button
                className="lp-link"
                style={{ background: "none", border: "none", cursor: "pointer", marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => { setPaso("credenciales"); setCodigo(""); setSesionToken(""); }}
              >
                <ArrowLeftOutlined />
                Volver e ingresar credenciales nuevamente
              </button>

              <p className="lp-footer">
                ¿Problemas? Contacta a soporte técnico UTEQ
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
