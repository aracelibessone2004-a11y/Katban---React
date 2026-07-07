const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

// Verificar que la columna pertenece al usuario
function getColumnIfOwned(columnId, userId) {
  const col = db.get('columnas').find({ id: columnId }).value();
  if (!col) return null;
  const proyecto = db.get('proyectos').find({ id: col.proyectoId, usuarioId: userId }).value();
  return proyecto ? col : null;
}

// POST /api/columnas
router.post('/', authMiddleware, (req, res) => {
  const { nombre, colorClass = 'colorBrief', proyectoId } = req.body;

  if (!nombre || !proyectoId) {
    return res.status(400).json({ error: 'nombre y proyectoId son obligatorios' });
  }

  const proyecto = db.get('proyectos').find({ id: proyectoId, usuarioId: req.user.id }).value();
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' });
  }

  const lastOrden = db.get('columnas')
    .filter({ proyectoId })
    .map('orden')
    .max()
    .value();
  const orden = (isFinite(lastOrden) ? lastOrden : -1) + 1;

  const id = uid();
  db.get('columnas').push({ id, nombre, colorClass, proyectoId, orden }).write();
  db.get('proyectos').find({ id: proyectoId }).assign({ lastModified: Date.now() }).write();

  return res.status(201).json({ id, name: nombre, colorClass, tasks: [] });
});

// PUT /api/columnas/:id
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  const col = getColumnIfOwned(id, req.user.id);
  if (!col) return res.status(404).json({ error: 'Columna no encontrada' });

  db.get('columnas').find({ id }).assign({ nombre: nombre || col.nombre }).write();
  db.get('proyectos').find({ id: col.proyectoId }).assign({ lastModified: Date.now() }).write();

  const updated = db.get('columnas').find({ id }).value();
  return res.json({ id: updated.id, name: updated.nombre, colorClass: updated.colorClass });
});

// DELETE /api/columnas/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  const col = getColumnIfOwned(id, req.user.id);
  if (!col) return res.status(404).json({ error: 'Columna no encontrada' });

  // Eliminar tareas de la columna
  db.get('tareas').remove({ columnaId: id }).write();
  db.get('columnas').remove({ id }).write();
  db.get('proyectos').find({ id: col.proyectoId }).assign({ lastModified: Date.now() }).write();

  return res.status(204).send();
});

module.exports = router;
