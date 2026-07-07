const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

// Verificar que la tarea pertenece al usuario
function getTaskIfOwned(taskId, userId) {
  const task = db.get('tareas').find({ id: taskId }).value();
  if (!task) return null;
  const col = db.get('columnas').find({ id: task.columnaId }).value();
  if (!col) return null;
  const proyecto = db.get('proyectos').find({ id: col.proyectoId, usuarioId: userId }).value();
  return proyecto ? { task, col, proyecto } : null;
}

// POST /api/tareas
router.post('/', authMiddleware, (req, res) => {
  const { title, description = '', labels = [], dueDate = null, priority = 'Media', columnaId } = req.body;

  if (!title || !columnaId) {
    return res.status(400).json({ error: 'title y columnaId son obligatorios' });
  }

  const col = db.get('columnas').find({ id: columnaId }).value();
  if (!col) return res.status(404).json({ error: 'Columna no encontrada' });

  const proyecto = db.get('proyectos').find({ id: col.proyectoId, usuarioId: req.user.id }).value();
  if (!proyecto) return res.status(403).json({ error: 'Sin acceso' });

  const lastOrden = db.get('tareas')
    .filter({ columnaId })
    .map('orden')
    .max()
    .value();
  const orden = (isFinite(lastOrden) ? lastOrden : -1) + 1;

  const id = uid();
  const newTask = {
    id,
    title,
    description,
    labels: Array.isArray(labels) ? labels : [],
    dueDate,
    priority,
    columnaId,
    orden,
  };

  db.get('tareas').push(newTask).write();
  db.get('proyectos').find({ id: col.proyectoId }).assign({ lastModified: Date.now() }).write();

  return res.status(201).json(newTask);
});

// PUT /api/tareas/:id
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, description, labels, dueDate, priority, columnaId } = req.body;

  const owned = getTaskIfOwned(id, req.user.id);
  if (!owned) return res.status(404).json({ error: 'Tarea no encontrada' });

  const { task, proyecto } = owned;

  const update = { lastModified: Date.now() };
  if (title !== undefined) update.title = title;
  if (description !== undefined) update.description = description;
  if (labels !== undefined) update.labels = Array.isArray(labels) ? labels : [];
  if (dueDate !== undefined) update.dueDate = dueDate;
  if (priority !== undefined) update.priority = priority;
  if (columnaId !== undefined) update.columnaId = columnaId;

  db.get('tareas').find({ id }).assign(update).write();
  db.get('proyectos').find({ id: proyecto.id }).assign({ lastModified: Date.now() }).write();

  const updated = db.get('tareas').find({ id }).value();
  return res.json(updated);
});

// DELETE /api/tareas/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  const owned = getTaskIfOwned(id, req.user.id);
  if (!owned) return res.status(404).json({ error: 'Tarea no encontrada' });

  db.get('tareas').remove({ id }).write();
  db.get('proyectos').find({ id: owned.proyecto.id }).assign({ lastModified: Date.now() }).write();

  return res.status(204).send();
});

module.exports = router;
