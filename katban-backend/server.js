const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/auth');
const proyectosRoutes = require('./routes/proyectos');
const columnasRoutes = require('./routes/columnas');
const tareasRoutes = require('./routes/tareas');

const app = express();
const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────────────
// Middlewares globales
// ──────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:4173',  // Vite preview
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────────
// Rutas API
// ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/columnas', columnasRoutes);
app.use('/api/tareas', tareasRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Katban Backend corriendo ✅', port: PORT });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('Error interno:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ──────────────────────────────────────────────
// Iniciar servidor
// ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║        KATBAN BACKEND INICIADO        ║');
  console.log(`║   Servidor corriendo en puerto ${PORT}  ║`);
  console.log('║   http://localhost:5000/api/health    ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log('');
});
