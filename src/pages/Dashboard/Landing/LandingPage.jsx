import React from 'react';
import Navbar from '../../components/common/Navbar';
import { Link } from '../../App';
import boardPreviewImg from '../../assets/board_preview.png';

export default function LandingPage() {
  return (
    <div className="bg-white min-vh-100">
      {/* NAVBAR */}
      <Navbar type="landing" />

      {/* HERO PRINCIPAL */}
      <header className="py-5 bg-light" id="hero-section">
        <div className="container py-lg-5">
          <div className="row align-items-center g-5">
            {/* Columna Izquierda: Títulos y CTA */}
            <div className="col-lg-6 text-center" id="hero-content">
              <h1 className="display-5 fw-bold text-dark mb-4 lh-sm">
                Organizá tus proyectos de diseño de forma simple y visual.
              </h1>
              
              <div className="bg-success-subtle text-dark p-4 rounded-4 shadow-sm mb-4" id="hero-desc-container">
                <p className="lead mb-0 fs-6 text-secondary-emphasis">
                  TaskBoard es una herramienta inspirada en la metodología Kanban que te permite planificar, organizar y hacer seguimiento de tus proyectos de diseño desde un único lugar.
                </p>
              </div>
              
              <Link href="login.html" className="btn btn-outline-primary rounded-pill px-5 py-2 fw-semibold shadow-sm" id="btn-hero-cta">
                Comenzar ahora
              </Link>
            </div>
            
            {/* Columna Derecha: Imagen del Tablero */}
            <div className="col-lg-6 text-center" id="hero-image-container">
              <img 
                src={boardPreviewImg} 
                alt="Previsualización del Tablero de Proyectos en TaskBoard" 
                className="img-fluid rounded-4 shadow-lg border border-light-subtle"
              />
            </div>
          </div>
        </div>
      </header>

      {/* BENEFICIOS */}
      <section className="py-5 bg-white" id="benefits-section">
        <div className="container py-lg-5">
          {/* Título de Sección */}
          <div className="text-start mb-5" id="benefits-header">
            <h2 className="text-uppercase fw-bold text-dark mb-0 fs-4 text-decoration-underline" style={{ textUnderlineOffset: '10px' }}>
              ¿Qué podés hacer con TaskBoard?
            </h2>
          </div>

          {/* Grilla de Tarjetas */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4" id="benefits-grid">
            
            {/* Tarjeta 1: Gestionar proyectos */}
            <div className="col">
              <div className="card h-100 border-0 shadow rounded-4 overflow-hidden bg-brief-pastel" id="benefit-card-1">
                <div className="card-header bg-white bg-opacity-50 border-0 py-3 text-center">
                  <h3 className="card-title fs-5 fw-bold text-dark mb-0">Gestionar proyectos</h3>
                </div>
                <div className="card-body bg-transparent text-center py-4">
                  <p className="card-text text-dark mb-0 fw-medium">
                    Creá un tablero para cada proyecto y mantené toda la información organizada.
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Administrar tareas */}
            <div className="col">
              <div className="card h-100 border-0 shadow rounded-4 overflow-hidden bg-revision-pastel" id="benefit-card-2">
                <div className="card-header bg-white bg-opacity-50 border-0 py-3 text-center">
                  <h3 className="card-title fs-5 fw-bold text-dark mb-0">Administrar tareas</h3>
                </div>
                <div className="card-body bg-transparent text-center py-4">
                  <p className="card-text text-dark mb-0 fw-medium">
                    Registrá cada trabajo con su descripción, prioridad, etiquetas y fecha límite.
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Visualizar el proceso */}
            <div className="col">
              <div className="card h-100 border-0 shadow rounded-4 overflow-hidden bg-proceso-pastel" id="benefit-card-3">
                <div className="card-header bg-white bg-opacity-50 border-0 py-3 text-center">
                  <h3 className="card-title fs-5 fw-bold text-dark mb-0">Visualizar el proceso</h3>
                </div>
                <div className="card-body bg-transparent text-center py-4">
                  <p className="card-text text-dark mb-0 fw-medium">
                    Mové las tareas entre las distintas etapas del proyecto para conocer su estado en todo momento.
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta 4: Controlar entregas */}
            <div className="col">
              <div className="card h-100 border-0 shadow rounded-4 overflow-hidden bg-aprobado-pastel" id="benefit-card-4">
                <div className="card-header bg-white bg-opacity-50 border-0 py-3 text-center">
                  <h3 className="card-title fs-5 fw-bold text-dark mb-0">Controlar entregas</h3>
                </div>
                <div className="card-body bg-transparent text-center py-4">
                  <p className="card-text text-dark mb-0 fw-medium">
                    Identificá rápidamente qué tareas están próximas a vencer o requieren atención.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ÚLTIMA SECCIÓN: DISEÑADORES & FLUJO */}
      <section className="py-5 bg-light" id="how-it-works-section">
        <div className="container py-lg-5">
          <div className="row g-5">
            
            {/* Columna Izquierda: Pensado para diseñadores */}
            <div className="col-lg-6" id="designers-column">
              <div className="text-center mb-4">
                <h2 className="text-uppercase fw-bold text-dark mb-0 fs-4 text-decoration-underline" style={{ textUnderlineOffset: '10px' }}>
                  Pensado para diseñadores
                </h2>
              </div>
              
              <div className="bg-aprobado-pastel text-dark p-4 rounded-4 shadow-sm" id="designers-box">
                <p className="lead mb-0 fs-6 text-dark fw-medium lh-lg">
                  Organizá proyectos de identidad visual, redes sociales, interfaces, banners, piezas publicitarias y mucho más mediante una herramienta intuitiva que te permite concentrarte en tu trabajo creativo.
                </p>
              </div>
            </div>

            {/* Columna Derecha: ¿Cómo funciona? */}
            <div className="col-lg-6" id="flow-column">
              <div className="text-center mb-4">
                <h2 className="text-uppercase fw-bold text-dark mb-0 fs-4 text-decoration-underline" style={{ textUnderlineOffset: '10px' }}>
                  ¿Cómo funciona?
                </h2>
              </div>

              <div className="d-flex flex-column align-items-start gap-1 ps-md-3" id="flow-steps">
                
                {/* Paso 1 */}
                <div className="bg-secondary-subtle text-dark py-2 px-4 rounded-pill fw-semibold shadow-sm flow-step-1" id="step-1">
                  Crear un proyecto
                </div>
                
                {/* Flecha Curva 1 */}
                <div className="flow-arrow-1 my-1" style={{ width: '35px', height: '35px' }}>
                  <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M10 5 C 10 20, 20 25, 28 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <path d="M22 19 L 29 25 L 23 31" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                
                {/* Paso 2 */}
                <div className="bg-secondary-subtle text-dark py-2 px-4 rounded-pill fw-semibold shadow-sm flow-step-2" id="step-2">
                  Agregar tareas
                </div>
                
                {/* Flecha Curva 2 */}
                <div className="flow-arrow-2 my-1" style={{ width: '35px', height: '35px' }}>
                  <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M10 5 C 10 20, 20 25, 28 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <path d="M22 19 L 29 25 L 23 31" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                
                {/* Paso 3 */}
                <div className="bg-secondary-subtle text-dark py-2 px-4 rounded-pill fw-semibold shadow-sm flow-step-3" id="step-3">
                  Organizarlas por estado
                </div>
                
                {/* Flecha Curva 3 */}
                <div className="flow-arrow-3 my-1" style={{ width: '35px', height: '35px' }}>
                  <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M10 5 C 10 20, 20 25, 28 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <path d="M22 19 L 29 25 L 23 31" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                
                {/* Paso 4 */}
                <div className="bg-secondary-subtle text-dark py-2 px-4 rounded-pill fw-semibold shadow-sm flow-step-4" id="step-4">
                  Entregá a tiempo
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
