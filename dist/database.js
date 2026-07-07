const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'katban_db.json'));
const db = low(adapter);

// Estructura inicial de la base de datos
db.defaults({
  usuarios: [],
  proyectos: [],
  columnas: [],
  tareas: [],
}).write();

module.exports = db;
