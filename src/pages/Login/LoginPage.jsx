import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import logo from '../../assets/LOGO.png';
import { navigate } from '../../App';

export default function LoginPage() {
  const { login } = useAuth();

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Register State
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Recover State
  const [recupEmail, setRecupEmail] = useState('');
  const [recoverError, setRecoverError] = useState('');
  const [recoverSuccess, setRecoverSuccess] = useState('');

  // Modals Visibility
  const [activeModal, setActiveModal] = useState(null); // 'register' | 'recover' | null

  // Sincronizar parámetro ?register=1 desde la URL para abrir el modal al cargar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('register') === '1') {
      setActiveModal('register');
      // Limpiar el parámetro de la barra de direcciones sin refrescar
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Por favor, ingresa email y contraseña.');
      return;
    }

    try {
      const response = await api.login(email.trim(), password);
      const data = await response.json();

      if (response.ok) {
        login(data.token, data.nombre);
        navigate('home.html');
      } else {
        setErrorMsg(data.error || 'Email o contraseña incorrectos');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regNombre.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await api.register(regNombre.trim(), regEmail.trim(), regPassword.trim());
      const data = await response.json();

      if (response.ok) {
        setRegSuccess('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
        // Limpiar formulario de registro
        setRegNombre('');
        setRegEmail('');
        setRegPassword('');
        // Cerrar modal tras un breve lapso o directamente
        setTimeout(() => {
          setActiveModal(null);
          setRegSuccess('');
        }, 2000);
      } else {
        setRegError(data.error || 'Error al registrar.');
      }
    } catch (err) {
      setRegError('Error de conexión con el servidor.');
    }
  };

  const handleRecover = async (e) => {
    e.preventDefault();
    setRecoverError('');
    setRecoverSuccess('');

    if (!recupEmail.trim()) {
      setRecoverError('Por favor, ingresa tu email.');
      return;
    }

    try {
      const response = await api.recover(recupEmail.trim());
      const data = await response.json();

      if (response.ok) {
        setRecoverSuccess(`Tu contraseña es: ${data.password}`);
      } else {
        setRecoverError(data.error || 'Error al recuperar la contraseña.');
      }
    } catch (err) {
      setRecoverError('Error de conexión con el servidor.');
    }
  };

  // Limpiar estados al cerrar modals
  const handleCloseRegister = () => {
    setActiveModal(null);
    setRegNombre('');
    setRegEmail('');
    setRegPassword('');
    setRegError('');
    setRegSuccess('');
  };

  const handleCloseRecover = () => {
    setActiveModal(null);
    setRecupEmail('');
    setRecoverError('');
    setRecoverSuccess('');
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="d-flex flex-column align-items-center w-100 py-4">

        {/* Logo del Gatito flotando */}
        <div className="login-logo-container">
          <img src={logo} alt="Logo de la aplicación" />
        </div>

        {/* Tarjeta de formulario */}
        <div className="login-card p-4 p-md-5 mx-3">
          <div className="pt-3">
            <h3 className="fw-bold text-center mb-4 mt-2 text-uppercase"
              style={{ fontSize: '1.25rem', letterSpacing: '1px', color: '#333' }}>
              Iniciar Sesión
            </h3>

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="inputEmail" className="form-label-custom">Email:</label>
                <input
                  type="email"
                  id="inputEmail"
                  className="form-control form-control-custom"
                  placeholder="mediapila@mediapila.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Contraseña */}
              <div className="mb-3">
                <label htmlFor="inputPassword" className="form-label-custom">Contraseña:</label>
                <input
                  type="password"
                  id="inputPassword"
                  className="form-control form-control-custom"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="text-end mt-2">
                  <a
                    href="#"
                    className="login-link text-decoration-none"
                    onClick={(e) => { e.preventDefault(); setActiveModal('recover'); }}
                  >
                    Olvidé mi contraseña
                  </a>
                </div>
              </div>

              {/* Botón Ingresar */}
              <div className="d-flex justify-content-center mt-4">
                <button type="submit" className="btn btn-ingresar rounded-pill shadow-sm px-4">
                  Ingresar
                </button>
              </div>
            </form>

            {/* Crear Cuenta */}
            <div className="text-center mt-3">
              <a
                href="#"
                className="login-link text-decoration-none"
                onClick={(e) => { e.preventDefault(); setActiveModal('register'); }}
              >
                Crear cuenta
              </a>
            </div>

            {/* Mensaje de Error/Éxito */}
            {errorMsg && (
              <div id="mensaje" className="mt-3">
                <div className="alert alert-danger">{errorMsg}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Registro */}
      <Modal
        isOpen={activeModal === 'register'}
        onClose={handleCloseRegister}
        title="Crear Cuenta"
      >
        <form onSubmit={handleRegister}>
          {regError && <div className="alert alert-danger p-2 fs-7 mb-2">{regError}</div>}
          {regSuccess && <div className="alert alert-success p-2 fs-7 mb-2">{regSuccess}</div>}

          <div className="mb-3">
            <label htmlFor="regNombre" className="form-label-custom">Nombre:</label>
            <input
              type="text"
              id="regNombre"
              className="form-control form-control-custom"
              placeholder="Ej: Maria"
              value={regNombre}
              onChange={(e) => setRegNombre(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="regEmail" className="form-label-custom">Email:</label>
            <input
              type="email"
              id="regEmail"
              className="form-control form-control-custom"
              placeholder="Ej: mediapila@mediapila.com"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="regPassword" className="form-label-custom">Contraseña:</label>
            <input
              type="password"
              id="regPassword"
              className="form-control form-control-custom"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-center mt-4">
            <button type="submit" className="btn btn-ingresar rounded-pill px-4 shadow-sm">
              Registrarse
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Recuperar */}
      <Modal
        isOpen={activeModal === 'recover'}
        onClose={handleCloseRecover}
        title="Recuperar Contraseña"
      >
        <form onSubmit={handleRecover}>
          {recoverError && <div className="alert alert-danger p-2 fs-7 mb-2">{recoverError}</div>}
          {recoverSuccess && <div className="alert alert-success p-2 fs-7 mb-2" style={{ wordBreak: 'break-all' }} dangerouslySetInnerHTML={{ __html: recoverSuccess }}></div>}

          <p className="text-muted text-center small mb-3">
            Ingresa tu correo registrado para recuperar tu contraseña.
          </p>
          <div className="mb-3">
            <label htmlFor="recupEmail" className="form-label-custom">Email:</label>
            <input
              type="email"
              id="recupEmail"
              className="form-control form-control-custom"
              placeholder="Ej: mediapila@mediapila.com"
              value={recupEmail}
              onChange={(e) => setRecupEmail(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-center mt-4">
            <button type="submit" className="btn btn-ingresar rounded-pill px-4 shadow-sm">
              Recuperar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
