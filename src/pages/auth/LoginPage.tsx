import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";
import useAuthStore from "../../stores/authStore";
import "./LoginPage.css";

const LoginPage = () => {
  const [cargando, setCargando] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

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
      const res = await api.auth.login({ email, password });
      if (!res.data.success || !res.data.data) throw new Error("Credenciales incorrectas");
      const { token, usuario } = res.data.data;
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
          ?.errors?.[0] ?? "Credenciales incorrectas";
      message.error(msg);
    } finally {
      setCargando(false);
    }
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
              {cargando ? "Verificando..." : "Iniciar sesión"}
              <span className="lp-btn-arrow">
                <ArrowRightOutlined />
              </span>
            </button>
          </form>

          <p className="lp-footer" style={{ marginTop: 16 }}>
            <SafetyCertificateOutlined style={{ marginRight: 6 }} />
            Acceso seguro UTEQ Lockers
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
