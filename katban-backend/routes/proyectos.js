const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const DEFAULT_COLUMNS = [
  { name: 'Brief', colorClass: 'colorBrief' },
  { name: 'En proceso', colorClass: 'colorProceso' },
  { name: 'Revisión del cliente', colorClass: 'colorRevision' },
  { name: 'Aprobado', colorClass: 'colorAprobado' },
];

// Helper: construir proyecto completo con columnas y tareas
function buildProject(proyecto) {
  const columnas = db
    .get('columnas')
    .filter({ proyectoId: proyecto.id })
    .sortBy('orden')
    .value();

  const columnasConTareas = columnas.map(col => {
    const tasks = db
      .get('tareas')
      .filter({ columnaId: col.id })
      .sortBy('orden')
      .value()
      .map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        labels: Array.isArray(t.labels) ? t.labels : [],
        dueDate: t.dueDate || null,
        priority: t.priority,
        columnaId: t.columnaId,
      }));

    return {
      id: col.id,
      name: col.nombre,
      colorClass: col.colorClass,
      tasks,
    };
  });

  return {
    id: proyecto.id,
    titulo: proyecto.titulo,
    imagen: proyecto.imagen || '',
    color: proyecto.color || 'colorBrief',
    lastModified: proyecto.lastModified || Date.now(),
    columnas: columnasConTareas,
  };
}

// GET /api/proyectos
router.get('/', authMiddleware, (req, res) => {
  const proyectos = db
    .get('proyectos')
    .filter({ usuarioId: req.user.id })
    .sortBy(p => -(p.lastModified || 0))
    .value();

  const result = proyectos.map(buildProject);
  return res.json(result);
});

// POST /api/proyectos
router.post('/', authMiddleware, (req, res) => {
  const { titulo, imagen = '', color = 'colorBrief' } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: 'El título es obligatorio' });
  }

  const id = uid();
  const now = Date.now();

  const newProject = { id, titulo, imagen, color, usuarioId: req.user.id, lastModified: now };
  db.get('proyectos').push(newProject).write();

  // Crear columnas default
  DEFAULT_COLUMNS.forEach((col, index) => {
    db.get('columnas').push({
      id: uid(),
      nombre: col.name,
      colorClass: col.colorClass,
      proyectoId: id,
      orden: index,
    }).write();
  });

  const created = db.get('proyectos').find({ id }).value();
  return res.status(201).json(buildProject(created));
});

// PUT /api/proyectos/:id
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { titulo, imagen, color } = req.body;

  const proyecto = db.get('proyectos').find({ id, usuarioId: req.user.id }).value();
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' });
  }

  const update = { lastModified: Date.now() };
  if (titulo !== undefined) update.titulo = titulo;
  if (imagen !== undefined) update.imagen = imagen;
  if (color !== undefined) update.color = color;

  db.get('proyectos').find({ id }).assign(update).write();

  const updated = db.get('proyectos').find({ id }).value();
  return res.json(buildProject(updated));
});

// DELETE /api/proyectos/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  const proyecto = db.get('proyectos').find({ id, usuarioId: req.user.id }).value();
  if (!proyecto) {
    return res.status(404).json({ error: 'Proyecto no encontrado' });
  }

  // Eliminar tareas de columnas del proyecto
  const columnas = db.get('columnas').filter({ proyectoId: id }).value();
  columnas.forEach(col => {
    db.get('tareas').remove({ columnaId: col.id }).write();
  });

  // Eliminar columnas
  db.get('columnas').remove({ proyectoId: id }).write();

  // Eliminar proyecto
  db.get('proyectos').remove({ id }).write();

  return res.status(204).send();
});

module.exports = router;
