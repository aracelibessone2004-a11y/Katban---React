import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { api } from '../../services/api';
import { Link, navigate } from '../../App';

const MAP_PIEZA = { 'logo': 'Logo', 'banner': 'Banner', 'redes': 'Redes', 'ui': 'UI' };
const MAP_PIEZA_REVERSE = { 'Logo': 'logo', 'Banner': 'banner', 'Redes': 'redes', 'UI': 'ui' };

const MAP_ESTADO = { 'brief': 'Brief', 'proceso': 'En proceso', 'revision': 'Revisión del cliente', 'aprobado': 'Aprobado' };
const MAP_ESTADO_REVERSE = { 'Brief': 'brief', 'En proceso': 'proceso', 'Revisión del cliente': 'revision', 'Aprobado': 'aprobado' };

export default function TaskEditorPage({ routeParams }) {
  const projectId = routeParams ? routeParams.get('id') : null;
  const urlColumnId = routeParams ? routeParams.get('columnId') : null;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [pieceType, setPieceType] = useState('');
  const [taskStatus, setTaskStatus] = useState('');

  // Editing State
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingColId, setEditingColId] = useState(null);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const list = await api.getProjects();
      
      let activeProj = null;
      let activeProjId = projectId;

      if (activeProjId) {
        activeProj = list.find(p => p.id === activeProjId);
      }

      // Si no hay id en la URL o el proyecto no existe, tomamos el más reciente
      if (!activeProj && list.length > 0) {
        list.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
        activeProj = list[0];
        activeProjId = activeProj.id;
        // Reemplazar la URL en la barra de direcciones para incluir el ID del proyecto
        window.history.replaceState({}, '', window.location.pathname + '?id=' + activeProjId);
      }

      if (!activeProj) {
        navigate('home.html');
        return;
      }

      // Normalizar nombres de columnas
      if (activeProj.columnas) {
        activeProj.columnas.forEach(column => {
          if (['Revision', 'Revisión'].includes(column.name)) column.name = 'Revisión del cliente';
          if (column.name === 'En Proceso') column.name = 'En proceso';
        });
      }

      setProject(activeProj);
    } catch (e) {
      console.error('Error fetching project details:', e);
      navigate('home.html');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Pre-select column state if columnId is in query params
  useEffect(() => {
    if (project && urlColumnId) {
      const column = project.columnas.find(c => c.id === urlColumnId);
      if (column) {
        setTaskStatus(MAP_ESTADO_REVERSE[column.name] || '');
      }
    }
  }, [project, urlColumnId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskTitle.trim() || !taskStatus) return;

    const labels = [];
    if (pieceType && MAP_PIEZA[pieceType]) {
      labels.push(MAP_PIEZA[pieceType]);
    }

    // Find destination column id
    const colName = MAP_ESTADO[taskStatus];
    const targetColumn = project.columnas.find(c => c.name === colName) || project.columnas[0];
    if (!targetColumn) return;

    try {
      if (editingTaskId && editingColId) {
        // If the task status (column) changed, delete from old column and add to new one
        if (editingColId !== targetColumn.id) {
          await api.deleteTask(editingTaskId);
          await api.createTask(targetColumn.id, taskTitle.trim(), labels, taskDueDate || null);
        } else {
          // Update in place
          await api.updateTask(editingTaskId, {
            title: taskTitle.trim(),
            labels,
            dueDate: taskDueDate || null
          });
        }
      } else {
        // Create new task
        await api.createTask(targetColumn.id, taskTitle.trim(), labels, taskDueDate || null);
      }

      // Reset Form and refresh list
      handleCancel();
      fetchProjectDetails();
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleEditClick = (task, colId, colName) => {
    setTaskTitle(task.title || '');
    setTaskDueDate(task.dueDate || '');
    
    if (task.labels && task.labels.length > 0) {
      setPieceType(MAP_PIEZA_REVERSE[task.labels[0]] || '');
    } else {
      setPieceType('');
    }

    setTaskStatus(MAP_ESTADO_REVERSE[colName] || '');

    setEditingTaskId(task.id);
    setEditingColId(colId);
  };

  const handleDeleteClick = async (taskId, colId) => {
    if (window.confirm('¿Estás seguro de que querés eliminar esta tarea?')) {
      try {
        await api.deleteTask(taskId);
        fetchProjectDetails();
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  const handleCancel = () => {
    setTaskTitle('');
    setTaskDueDate('');
    setPieceType('');
    setTaskStatus('');
    setEditingTaskId(null);
    setEditingColId(null);
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-editor">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando editor...</span>
        </div>
      </div>
    );
  }

  // Get all tasks flattening columns
  const allTasks = project?.columnas 
    ? project.columnas.flatMap(c => 
        (c.tasks || []).map(t => ({ 
          ...t, 
          colName: c.name, 
          colId: c.id 
        }))
      )
    : [];

  return (
    <div className="bg-editor min-vh-100">
      {/* NAVBAR */}
      <Navbar type="editor" projectTitle={project?.titulo} />

      <main className="container-fluid my-4">
        <div className="row">
          
          {/* FORMULARIO */}
          <section className="col-md-8 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0 fw-bold" id="nombre-proyecto-main">
                {project?.titulo?.toUpperCase() || 'TITULO DEL PROYECTO'}
              </h2>
              <Link 
                href={`board.html?id=${project?.id}`} 
                className="btn px-4 py-2 fw-semibold text-white btn-cancelar small rounded-3 shadow-sm"
              >
                Volver al tablero
              </Link>
            </div>

            <form id="form-tarea" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="titulo-tarea" className="form-label fw-semibold">Título de la tarea</label>
                <input 
                  type="text" 
                  className="form-control bg-light py-2 rounded-3" 
                  id="titulo-tarea"
                  placeholder="Ej: Diseñar banner para Instagram" 
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>

              <div className="row mb-3">
                <div class="col-md-6 mb-3 mb-md-0">
                  <label htmlFor="fecha-tarea" className="form-label fw-semibold">Fecha de vencimiento</label>
                  <input 
                    type="date" 
                    className="form-control bg-light py-2 rounded-3" 
                    id="fecha-tarea"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="row mb-4">
                {/* Tipo Pieza */}
                <div className="col-md-6 mb-3 mb-md-0">
                  <label htmlFor="tipo-pieza" className="form-label fw-semibold">Tipo de pieza</label>
                  <select 
                    className="form-select bg-light py-2 select-placeholder rounded-3" 
                    id="tipo-pieza"
                    required 
                    value={pieceType}
                    onChange={(e) => setPieceType(e.target.value)}
                    style={{ color: pieceType ? '#333333' : '#a0a0a0' }}
                  >
                    <option value="" disabled className="placeholder-option">Seleccionar</option>
                    <option value="logo">Logo</option>
                    <option value="banner">Banner</option>
                    <option value="redes">Redes</option>
                    <option value="ui">UI</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Estado Tarea */}
                <div className="col-md-6">
                  <label htmlFor="estado-tarea" className="form-label fw-semibold">Estado ▽</label>
                  <select 
                    className="form-select bg-light py-2 select-placeholder rounded-3" 
                    id="estado-tarea"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    style={{ color: taskStatus ? '#333333' : '#a0a0a0' }}
                  >
                    <option value="" disabled className="placeholder-option">Seleccionar</option>
                    <option value="brief">Brief</option>
                    <option value="proceso">En proceso</option>
                    <option value="revision">Revisión del cliente</option>
                    <option value="aprobado">Aprobado</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3 mt-4">
                <button 
                  type="button"
                  className="btn px-4 py-2 fw-semibold text-white btn-cancelar small rounded-3 shadow-sm"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn px-4 py-2 fw-semibold text-white btn-crear small rounded-3 shadow-sm"
                >
                  {editingTaskId ? 'Guardar cambios' : 'Crear tarea'}
                </button>
              </div>
            </form>
          </section>

          {/* TASKS LIST SIDEBAR */}
          <aside className="col-md-4 border-start ps-4">
            <h3 className="text-center fs-5 fw-bold mb-4">MIS TAREAS</h3>

            <div id="lista-tareas" className="d-flex flex-column gap-3">
              {allTasks.length === 0 ? (
                <div className="text-center my-5 text-muted">
                  <p className="fs-4 mb-1">📋</p>
                  <p className="small fw-medium">No hay tareas cargadas todavía.</p>
                </div>
              ) : (
                allTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="p-3 bg-body-secondary border rounded-3 shadow-sm d-flex flex-column gap-1 animate-fade-in mb-3"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong className="text-dark d-block">{task.title}</strong>
                        {task.labels && task.labels.length > 0 && (
                          <span 
                            className="badge bg-secondary text-capitalize mt-1" 
                            style={{ fontSize: '10px' }}
                          >
                            {task.labels[0]}
                          </span>
                        )}
                      </div>
                      <div className="d-flex gap-1">
                        <button 
                          className="btn btn-sm btn-outline-primary border-0 p-1 btn-editar" 
                          title="Editar"
                          onClick={() => handleEditClick(task, task.colId, task.colName)}
                        >✏️</button>
                        <button 
                          className="btn btn-sm btn-outline-danger border-0 p-1 btn-eliminar" 
                          title="Eliminar"
                          onClick={() => handleDeleteClick(task.id, task.colId)}
                        >❌</button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-muted small my-2">{task.description}</p>
                    )}
                    <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: '12px' }}>
                      <span className="text-primary fw-semibold">{task.colName}</span>
                      {task.dueDate && (
                        <span className="text-muted">
                          📅 {task.dueDate.split('-').reverse().join('/')}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
