import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import Column from './Column';
import { api } from '../../services/api';
import { Link, navigate } from '../../App';

const COLORS = ['colorBrief', 'colorProceso', 'colorRevision', 'colorAprobado'];

export default function BoardPage({ routeParams }) {
  const projectId = routeParams ? routeParams.get('id') : null;

  // Board State
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Project description local fallback state
  const [projectDescription, setProjectDescription] = useState('Descripción');

  // Drag & Drop States
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedFromColumnId, setDraggedFromColumnId] = useState(null);

  // Modals Visibility
  const [activeModal, setActiveModal] = useState(null); // 'addColumn' | 'deleteColumn' | null
  const [selectedColumnId, setSelectedColumnId] = useState(null);

  // New Column Inputs
  const [newColName, setNewColName] = useState('');
  const [newColColor, setNewColColor] = useState(COLORS[0]);
  const [colNameInvalid, setColNameInvalid] = useState(false);

  // Refs for editable text elements
  const titleRef = useRef(null);
  const descRef = useRef(null);

  const fetchProjectData = async () => {
    if (!projectId) {
      navigate('home.html');
      return;
    }

    try {
      setLoading(true);
      const list = await api.getProjects();
      const proj = list.find(p => p.id === projectId);

      if (!proj) {
        // If project ID is not found, fallback to dashboard
        navigate('home.html');
        return;
      }

      // Normalizar nombres de columnas para que coincidan con los estilos de la app
      if (proj.columnas) {
        proj.columnas.forEach(column => {
          if (['Revision', 'Revisión'].includes(column.name)) column.name = 'Revisión del cliente';
          if (column.name === 'En Proceso') column.name = 'En proceso';
        });
      }

      setProject(proj);
    } catch (e) {
      console.error('Error fetching project:', e);
      navigate('home.html');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  // Handle Project Title Update (Inline edit)
  const handleUpdateProjectTitle = async () => {
    const text = titleRef.current?.textContent.trim() || 'Sin título';
    try {
      await api.updateProject(projectId, { titulo: text });
      setProject(prev => prev ? { ...prev, titulo: text } : null);
    } catch (e) {
      console.error('Error saving project name:', e);
      if (titleRef.current) titleRef.current.textContent = project?.titulo || 'Sin título';
    }
  };

  // Handle Project Description Update (Inline edit - local memory only as per model specification)
  const handleUpdateProjectDesc = () => {
    const text = descRef.current?.textContent.trim() || 'Descripción';
    setProjectDescription(text);
  };

  // Add Column
  const handleAddColumn = async (e) => {
    e.preventDefault();
    setColNameInvalid(false);

    if (!newColName.trim()) {
      setColNameInvalid(true);
      return;
    }

    try {
      const newCol = await api.createColumn(newColName.trim(), newColColor, projectId);
      setProject(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columnas: [...(prev.columnas || []), { ...newCol, tasks: [] }]
        };
      });
      setActiveModal(null);
      setNewColName('');
      setNewColColor(COLORS[0]);
    } catch (err) {
      console.error('Error creating column:', err);
    }
  };

  // Delete Column
  const handleDeleteColumn = async () => {
    if (!selectedColumnId) return;

    try {
      await api.deleteColumn(selectedColumnId);
      setProject(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columnas: prev.columnas.filter(c => c.id !== selectedColumnId)
        };
      });
      setActiveModal(null);
      setSelectedColumnId(null);
    } catch (err) {
      console.error('Error deleting column:', err);
    }
  };

  // Update Column Title Inline
  const handleUpdateColumnName = async (columnId, newName) => {
    try {
      await api.updateColumn(columnId, newName);
      setProject(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columnas: prev.columnas.map(col => col.id === columnId ? { ...col, name: newName } : col)
        };
      });
    } catch (err) {
      console.error('Error updating column name:', err);
      // Re-trigger refresh to reset visual state on error
      fetchProjectData();
    }
  };

  // Delete Task
  const handleDeleteTask = async (columnId, taskId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar esta tarea?')) {
      try {
        await api.deleteTask(taskId);
        setProject(prev => {
          if (!prev) return null;
          return {
            ...prev,
            columnas: prev.columnas.map(col => {
              if (col.id !== columnId) return col;
              return {
                ...col,
                tasks: col.tasks.filter(t => t.id !== taskId)
              };
            })
          };
        });
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  // Move Task (Drag & Drop handler)
  const handleMoveTask = async (fromColumnId, toColumnId, taskId, afterTaskId) => {
    if (fromColumnId === toColumnId && !afterTaskId) return;

    try {
      // Reorder locally first for instant visual feedback, but fetch full data on failure
      const updatedProject = { ...project };
      const fromCol = updatedProject.columnas.find(c => c.id === fromColumnId);
      const toCol = updatedProject.columnas.find(c => c.id === toColumnId);

      if (!fromCol || !toCol) return;

      const taskIndex = fromCol.tasks.findIndex(t => t.id === taskId);
      if (taskIndex < 0) return;

      const [movedTask] = fromCol.tasks.splice(taskIndex, 1);

      // Perform API call
      await api.updateTask(taskId, { columnaId: toColumnId });

      // Put in correct position in target list
      const afterIndex = afterTaskId ? toCol.tasks.findIndex(t => t.id === afterTaskId) : -1;
      toCol.tasks.splice(afterIndex < 0 ? toCol.tasks.length : afterIndex, 0, movedTask);

      setProject(updatedProject);
    } catch (err) {
      console.error('Error moving task:', err);
      // Rollback to original server state
      fetchProjectData();
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando tablero...</span>
        </div>
      </div>
    );
  }

  // Get total tasks in columns of this column to show warning on deletion
  const colToDelete = project?.columnas?.find(c => c.id === selectedColumnId);
  const tasksCountInColToDelete = colToDelete?.tasks?.length || 0;

  return (
    <div className="bg-white min-vh-100">
      {/* NAVBAR */}
      <Navbar type="board" projectTitle={project?.titulo} />

      {/* SEARCH TASKS */}
      <div className="container-fluid mt-3 d-flex justify-content-center">
        <div className="input-group search-box rounded-pill overflow-hidden" style={{ maxWidth: '500px' }}>
          <span className="input-group-text bg-transparent border-0 text-secondary ps-3">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            id="search-tasks-input"
            className="form-control bg-transparent border-0 shadow-none ps-1"
            placeholder="Buscar tareas en este tablero..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              id="clear-tasks-btn"
              className="btn btn-link text-decoration-none text-muted border-0 pe-3"
              onClick={() => setSearchQuery('')}
            >✕</button>
          )}
        </div>
      </div>

      {/* BOARD HEADERS & COLUMNS */}
      <section className="bg-white pb-4">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <h1 className="mt-4 fw-semibold">
                <span
                  id="project-title"
                  ref={titleRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck="false"
                  onBlur={handleUpdateProjectTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  style={{ outline: 'none' }}
                >
                  {project?.titulo || 'Título del proyecto'}
                </span>
                <i
                  className="bi bi-pencil fs-6 ms-2"
                  id="edit-project-title"
                  role="button"
                  onClick={() => titleRef.current?.focus()}
                ></i>
              </h1>

              <p className="ms-2 text-secondary">
                <span
                  id="project-description"
                  ref={descRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck="false"
                  onBlur={handleUpdateProjectDesc}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  style={{ outline: 'none' }}
                >
                  {projectDescription}
                </span>
                <i
                  className="bi bi-pencil fs-6 ms-2"
                  id="edit-project-desc"
                  role="button"
                  onClick={() => descRef.current?.focus()}
                ></i>
              </p>
            </div>
          </div>
        </div>

        {/* COLUMNS CONTAINER */}
        <div className="container-fluid">
          <div
            id="board-container"
            className="d-flex flex-nowrap overflow-auto gap-3 pb-3 align-items-start board-min-height"
          >
            {project?.columnas && project.columnas.map(col => (
              <Column
                key={col.id}
                column={col}
                projectId={projectId}
                onDeleteColumn={(id) => {
                  setSelectedColumnId(id);
                  setActiveModal('deleteColumn');
                }}
                onUpdateColumnName={handleUpdateColumnName}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                draggedTaskId={draggedTaskId}
                setDraggedTaskId={setDraggedTaskId}
                draggedFromColumnId={draggedFromColumnId}
                setDraggedFromColumnId={setDraggedFromColumnId}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="container-fluid">
          <div className="position-relative d-flex justify-content-center align-items-center mt-3 mb-4" id="btn-add-column">
            <Link href="home.html" className="btn btn-link text-decoration-none text-secondary px-0 position-absolute start-0">
              <i className="bi bi-chevron-left"></i> Volver a mis proyectos
            </Link>
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-3 px-4 py-2 btn-dashed"
              onClick={() => setActiveModal('addColumn')}
            >
              <i className="bi bi-plus"></i> Añadir columna
            </button>
          </div>
        </div>
      </section>

      {/* ADD COLUMN MODAL */}
      <Modal
        isOpen={activeModal === 'addColumn'}
        onClose={() => {
          setActiveModal(null);
          setNewColName('');
          setNewColColor(COLORS[0]);
          setColNameInvalid(false);
        }}
        title="Añadir columna"
      >
        <form onSubmit={handleAddColumn}>
          <div className="mb-3">
            <label htmlFor="new-column-name" className="form-label fw-medium">Nombre de la columna</label>
            <input
              type="text"
              className={`form-control ${colNameInvalid ? 'is-invalid' : ''}`}
              id="new-column-name"
              placeholder="Ej: Diseño"
              value={newColName}
              onChange={(e) => {
                setNewColName(e.target.value);
                if (e.target.value.trim()) setColNameInvalid(false);
              }}
            />
            {colNameInvalid && <div className="invalid-feedback">Ingresá un nombre para la columna.</div>}
          </div>

          <p className="form-label fw-medium mb-2">Color de la columna</p>
          <div className="d-flex flex-wrap justify-content-center gap-4 mb-3">
            {COLORS.map((color, i) => (
              <React.Fragment key={color}>
                <input
                  type="radio"
                  className="btn-check"
                  name="new-column-color"
                  id={`column-color-${i}`}
                  value={color}
                  checked={newColColor === color}
                  onChange={() => setNewColColor(color)}
                />
                <label
                  className={`color-swatch rounded-circle ${color} border ${newColColor === color ? 'border-primary border-3 shadow' : 'border-secondary'
                    }`}
                  htmlFor={`column-color-${i}`}
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
                setActiveModal(null);
                setNewColName('');
                setNewColColor(COLORS[0]);
                setColNameInvalid(false);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn navbarColor text-white border-secondary">
              Crear columna
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE COLUMN MODAL */}
      <Modal
        isOpen={activeModal === 'deleteColumn'}
        onClose={() => {
          setActiveModal(null);
          setSelectedColumnId(null);
        }}
        title="Eliminar columna"
      >
        <p className="mb-2 fw-medium">
          ¿Eliminar la columna "{colToDelete?.name}"?
        </p>
        <p className="mb-0 text-secondary">
          {tasksCountInColToDelete > 0
            ? `También se eliminarán sus ${tasksCountInColToDelete} tarea(s).`
            : 'Esta acción no se puede deshacer.'
          }
        </p>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setActiveModal(null);
              setSelectedColumnId(null);
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn navbarColor text-white border-secondary"
            onClick={handleDeleteColumn}
          >
            Eliminar columna
          </button>
        </div>
      </Modal>
    </div>
  );
}
