import React from 'react';
import { Link } from '../App';

export default function Sidebar({ onNewProjectClick }) {
  return (
    <aside className="dashboard-sidebar position-fixed bottom-0 start-0 py-4 border-end">
      <div className="px-4 pb-3 fs-5 fw-bold">
        <span className="text-primary-brand">Kat</span><span>Ban</span>
      </div>

      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className="nav-link d-flex align-items-center gap-2" href="home.html">
            <i className="bi bi-house-door"></i> Inicio
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link d-flex align-items-center gap-2" href="editortareas.html">
            <i className="bi bi-check2-square"></i> Todas las tareas
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="nav-link d-flex align-items-center gap-2"
            href="home.html?new=1"
            id="sidebar-new-project"
            onClick={(e) => {
              if (onNewProjectClick) {
                e.preventDefault();
                onNewProjectClick();
              }
            }}
          >
            <i className="bi bi-plus-square"></i> Nuevo proyecto
          </Link>
        </li>
      </ul>
    </aside>
  );
}
