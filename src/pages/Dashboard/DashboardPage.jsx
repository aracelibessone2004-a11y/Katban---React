import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/SideBar';
import Modal from '../../components/Modal';
import { Link, navigate } from '../../App';

const COLORS = ['colorBrief', 'colorProceso', 'colorRevision', 'colorAprobado'];
const PASTEL_COLORS = ['#7F9C96', '#b5c68a', '#e3c27f', '#d8a7a7', '#9fb8d0', '#bca3cc'];

// Unique ID generator mirroring the original id() function
const id = () => `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;

function getDemoProjects() {
  const defaultCols = [
    { name: 'Brief', colorClass: 'colorBrief' },
    { name: 'En proceso', colorClass: 'colorProceso' },
    { name: 'Revisión del cliente', colorClass: 'colorRevision' },
    { name: 'Aprobado', colorClass: 'colorAprobado' }
  ];

  const demo = [
    {
      titulo: 'Rebranding Café Aurora',
      imagen: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
      tasksByColumn: {
        'Brief': [
          { title: 'Definir concepto visual de la nueva marca', labels: ['Logo'], priority: 'Media', dueDate: '2026-07-04', description: '' }
        ],
        'En proceso': [
          { title: 'Diseñar primeras propuestas de logotipo', labels: ['Logo'], priority: 'Alta', dueDate: '2026-07-07', description: '' },
          { title: 'Crear paleta de colores corporativa', labels: ['Logo'], priority: 'Media', dueDate: '2026-07-08', description: '' }
        ],
        'Revisión del cliente': [
          { title: 'Ajustar isotipo según comentarios del cliente', labels: ['Logo'], priority: 'Alta', dueDate: '2026-07-10', description: '' }
        ],
        'Aprobado': [
          { title: 'Entregar manual básico de identidad', labels: ['Logo'], priority: 'Baja', dueDate: '2026-07-12', description: '' }
        ]
      }
    },
    {
      titulo: 'Landing Page TechNova',
      imagen: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      tasksByColumn: {
        'Brief': [
          { title: 'Analizar requerimientos UX', labels: ['UI'], priority: 'Media', dueDate: '2026-07-05', description: '' }
        ],
        'En proceso': [
          { title: 'Wireframes de escritorio', labels: ['UI'], priority: 'Alta', dueDate: '2026-07-09', description: '' },
          { title: 'Diseño responsive mobile', labels: ['UI'], priority: 'Alta', dueDate: '2026-07-11', description: '' }
        ],
        'Revisión del cliente': [
          { title: 'Correcciones de navegación solicitadas', labels: ['UI'], priority: 'Muy Alta', dueDate: '2026-07-13', description: '' }
        ],
        'Aprobado': [
          { title: 'Diseño final aprobado', labels: ['UI'], priority: 'Baja', dueDate: '2026-07-15', description: '' }
        ]
      }
    },
    {
      titulo: 'App Financiera WalletPro',
      imagen: '',
      color: 'colorAprobado',
      tasksByColumn: {
        'Brief': [
          { title: 'Reunión inicial con producto', labels: ['UI'], priority: 'Media', dueDate: '2026-07-04', description: '' }
        ],
        'En proceso': [
          { title: 'Dashboard principal', labels: ['UI'], priority: 'Alta', dueDate: '2026-07-08', description: '' },
          { title: 'Pantalla de movimientos', labels: ['UI'], priority: 'Media', dueDate: '2026-07-10', description: '' }
        ],
        'Revisión del cliente': [
          { title: 'Ajustar componentes según feedback', labels: ['UI'], priority: 'Muy Alta', dueDate: '2026-07-12', description: '' }
        ],
        'Aprobado': [
          { title: 'Sistema visual aprobado', labels: ['UI'], priority: 'Baja', dueDate: '2026-07-14', description: '' }
        ]
      }
    }
  ];

  return demo.map((p, index) => {
    const columns = defaultCols.map(col => {
      const rawTasks = p.tasksByColumn[col.name] || [];
      const tasks = rawTasks.map(t => ({
        id: id(),
        title: t.title,
        labels: t.labels,
        dueDate: t.dueDate,
        description: t.description || '',
        priority: t.priority
      }));
      return {
        id: id(),
        name: col.name,
        colorClass: col.colorClass,
        tasks: tasks
      };
    });

    return {
      titulo: p.titulo,
      imagen: p.imagen || '',
      color: p.color || 'colorBrief',
      columnas: columns,
      lastModified: Date.now() - (index * 1000)
    };
  });
}

export default function DashboardPage({ routeParams }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newColor, setNewColor] = useState('colorBrief');
  const [titleInvalid, setTitleInvalid] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      let list = await api.getProjects();

      // Seed demo projects if list is empty
      if (list.length === 0) {
        const demos = getDemoProjects();
        for (const d of demos) {
          // Create project
          const proj = await api.createProject(d.titulo, d.imagen, d.color);

          // Seed columns & tasks
          if (d.columnas && proj.columnas) {
            for (const col of d.columnas) {
              const targetCol = proj.columnas.find(c => c.name === col.name);
              if (targetCol && col.tasks) {
                for (const t of col.tasks) {
                  await api.createTask(targetCol.id, t.title, t.labels, t.dueDate, t.description, t.priority);
                }
              }
            }
          }
        }
        list = await api.getProjects();
      }

      // Sort: most recent modified first
      list.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
      setProjects(list);
    } catch (e) {
      console.error('Error fetching projects:', e);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Listen to ?new=1 query param to open project creation modal
  useEffect(() => {
    if (routeParams && routeParams.get('new') === '1') {
      setIsModalOpen(true);
      // Clean query parameter from address bar
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [routeParams]);

  const handleDeleteProject = async (e, id, title) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`¿Estás seguro de que querés eliminar el proyecto "${title}"? Esta acción no se puede deshacer.`)) {
      try {
        await api.deleteProject(id);
        fetchProjects();
      } catch (err) {
        console.error('Error deleting project:', err);
      }
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setTitleInvalid(false);

    if (!newTitle.trim()) {
      setTitleInvalid(true);
      return;
    }

    try {
      const newProj = await api.createProject(newTitle.trim(), newImage.trim(), newColor);
      setIsModalOpen(false);
      // Clear fields
      setNewTitle('');
      setNewImage('');
      setNewColor('colorBrief');

      // Navigate to the new project's board
      navigate(`board.html?id=${newProj.id}`);
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  // Filter projects by search query
  const filteredProjects = projects.filter((p) => {
    const title = p.titulo ? p.titulo.toLowerCase() : '';
    return title.includes(searchQuery.toLowerCase().trim());
  });

  return (
    <div className="dashboard-body min-vh-100">
      {/* NAVBAR */}
      <Navbar type="dashboard" />

      {/* SIDEBAR */}
      <Sidebar onNewProjectClick={() => setIsModalOpen(true)} />

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <h1 className="fs-3 fw-bold mb-1">
          ¡Bienvenido/a, <span id="nombreUsuario">{user?.name || 'Usuario/a'}</span>!
        </h1>
        <p className="text-secondary mb-4">Mis proyectos ...</p>

        {/* SEARCH BAR */}
        <div className="mt-3 mb-5 d-flex justify-content-start">
          <div className="input-group rounded-pill overflow-hidden border bg-white shadow-sm" style={{ maxWidth: '500px' }}>
            <span className="input-group-text bg-transparent border-0 text-secondary ps-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              id="search-projects-input"
              className="form-control bg-transparent border-0 shadow-none ps-1"
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                id="clear-projects-btn"
                className="btn btn-link text-decoration-none text-muted border-0 pe-3"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* PROJECTS CONTAINER */}
        <div className="d-flex flex-wrap align-items-stretch gap-3" id="projects-container">
          {loadingProjects ? (
            <div className="w-100 py-5 text-center text-secondary">
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              Cargando proyectos...
            </div>
          ) : (
            <>
              {filteredProjects.map((proj, index) => {
                const title = proj.titulo || 'Sin título';
                const tasks = proj.columnas ? proj.columnas.flatMap((c) => c.tasks || []) : [];
                const totalTasks = tasks.length;
                const fallbackColor = PASTEL_COLORS[index % PASTEL_COLORS.length];

                let coverStyle = {};
                let coverClassExtra = '';

                if (proj.imagen) {
                  coverStyle = {
                    backgroundImage: `url('${proj.imagen}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  };
                } else if (proj.color) {
                  if (proj.color.startsWith('#')) {
                    coverStyle = { backgroundColor: proj.color };
                  } else {
                    coverClassExtra = proj.color; // CSS class, e.g. colorBrief
                  }
                } else {
                  coverStyle = { backgroundColor: fallbackColor };
                }

                return (
                  <div key={proj.id} className="project-card card border-0 overflow-hidden position-relative">
                    <button
                      className="btn btn-sm btn-light position-absolute end-0 top-0 m-2 rounded-circle shadow-sm btn-delete-project border-0"
                      title="Eliminar proyecto"
                      style={{
                        zIndex: 10,
                        opacity: 0.9,
                        width: '28px',
                        height: '28px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onClick={(e) => handleDeleteProject(e, proj.id, title)}
                    >
                      <i className="bi bi-trash text-danger" style={{ fontSize: '0.85rem' }}></i>
                    </button>
                    <Link href={`board.html?id=${proj.id}`} className="text-decoration-none text-reset">
                      <div className={`project-card-cover ${coverClassExtra}`} style={coverStyle}></div>
                      <div className="card-body p-3">
                        <p className="card-title small fw-semibold text-truncate mb-2">{title}</p>
                        <div className="d-flex align-items-center flex-wrap gap-2">
                          <span className="small text-secondary">Tareas</span>
                          <span className="small text-muted d-flex align-items-center gap-1">
                            <span className="stat-dot rounded-circle d-inline-block bg-success"></span> {totalTasks}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}

              {/* NEW PROJECT CARD */}
              <a
                className="project-card-new d-flex flex-column align-items-center justify-content-center gap-3 py-4 text-decoration-none"
                href="#"
                id="card-new-project"
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
              >
                <div className="new-project-icon rounded-circle d-flex align-items-center justify-content-center">
                  <i className="bi bi-plus"></i>
                </div>
                <span className="small fw-semibold text-primary-brand">Nuevo proyecto</span>
              </a>
            </>
          )}
        </div>
      </main>

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewTitle('');
          setNewImage('');
          setNewColor('colorBrief');
          setTitleInvalid(false);
        }}
        title="Crear Proyecto"
      >
        <form onSubmit={handleCreateProject}>
          <div className="mb-3">
            <label htmlFor="new-project-title" className="form-label fw-medium">Nombre del proyecto</label>
            <input
              type="text"
              className={`form-control ${titleInvalid ? 'is-invalid' : ''}`}
              id="new-project-title"
              placeholder="Ej: Rebranding Café Aurora"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (e.target.value.trim()) setTitleInvalid(false);
              }}
            />
            {titleInvalid && <div className="invalid-feedback">Ingresá un nombre para el proyecto.</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="new-project-image" className="form-label fw-medium">URL de la imagen del proyecto</label>
            <input
              type="url"
              className="form-control"
              id="new-project-image"
              placeholder="Ej: https://images.unsplash.com/..."
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
            />
            <div className="form-text text-muted small">
              Colocá el enlace de la imagen o dejalo vacío para usar el color seleccionado abajo.
            </div>
          </div>

          <p className="form-label fw-medium mb-2">
            Color de portada (si no ingresás una URL de imagen)
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-4 mb-3">
            {COLORS.map((color, i) => (
              <React.Fragment key={color}>
                <input
                  type="radio"
                  className="btn-check"
                  name="new-project-color"
                  id={`project-color-${i}`}
                  value={color}
                  checked={newColor === color}
                  onChange={() => setNewColor(color)}
                />
                <label
                  className={`color-swatch rounded-circle ${color} border ${newColor === color ? 'border-primary border-3 shadow' : 'border-secondary'
                    }`}
                  htmlFor={`project-color-${i}`}
                  title={color}
                  aria-label={color}
                ></label>
              </React.Fragment>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setIsModalOpen(false);
                setNewTitle('');
                setNewImage('');
                setNewColor('colorBrief');
                setTitleInvalid(false);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn navbarColor text-white border-secondary">
              Crear proyecto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
