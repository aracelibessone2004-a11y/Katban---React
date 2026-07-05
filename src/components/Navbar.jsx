import React from 'react';
import logo from '../../assets/LOGO.png';
import { Link } from '../../App';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ type, projectTitle }) {
  const { logout } = useAuth();

  if (type === 'landing') {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3" id="main-navbar">
        <div className="container d-flex justify-content-between align-items-center">
          {/* Logo y Marca */}
          <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" href="index.html" id="brand-logo">
            <span className="fs-4 fw-bold text-dark">Kat<span className="text-primary">Ban</span></span>
            <img src={logo} alt="Logo de TaskBoard" width="32" height="32" className="d-inline-block" />
          </Link>

          {/* Accesos e Inicio de Sesión */}
          <div className="d-flex align-items-center" id="navbar-auth-links">
            <Link href="login.html" className="nav-link text-secondary fw-medium px-2" id="btn-login">Iniciar sesión</Link> 
            <div className="vr mx-2 text-muted" style={{ height: '18px', opacity: 0.35 }}></div>
            <Link href="login.html?register=1" className="nav-link text-secondary fw-medium px-2" id="btn-register">Regístrate</Link> 
          </div>
        </div>
      </nav>
    );
  }

  if (type === 'dashboard') {
    return (
      <header className="dashboard-navbar position-fixed top-0 start-0 end-0 d-flex align-items-center justify-content-between px-4 shadow-sm">
        <div className="ms-auto d-flex align-items-center gap-3">
          <img src={logo} alt="Logo" width="50" height="50" />
          <button onClick={logout} className="btn btn-outline-light btn-sm" title="Cerrar sesión">
            <i className="bi bi-box-arrow-right"></i> Salir
          </button>
        </div>
      </header>
    );
  }

  if (type === 'board') {
    return (
      <nav className="navbar navbarColor py-1 sticky-top">
        <div className="d-flex align-items-center ms-4 gap-2">
          <Link href="home.html" className="text-decoration-none text-secondary fw-medium">Mis Proyectos</Link>
          <i className="bi bi-chevron-right text-secondary"></i>
          <span className="text-white" id="navbar-project-title">{projectTitle || 'Título del proyecto'}</span>
        </div>

        <div className="ms-auto me-4">
          <img src={logo} alt="Logo" width="50" height="50" />
        </div>
      </nav>
    );
  }

  if (type === 'editor') {
    return (
      <header className="text-white p-3 mb-4 shadow-sm custom-navbar">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <span className="fs-6 text-white-50">
            <Link href="home.html" className="nav-link-custom">Mis proyectos</Link>
            {' > '}<strong className="text-white" id="nombre-proyecto-nav">{projectTitle || 'Título del proyecto'}</strong>
          </span>
          <div className="rounded-circle bg-light overflow-hidden d-flex align-items-center justify-content-center logo-container">
            <img src={logo} alt="Logo Katban" className="logo-img" />
          </div>
        </div>
      </header>
    );
  }

  return null;
}
