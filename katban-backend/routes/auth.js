const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const existingUser = db.get('usuarios').find({ email }).value();
  if (existingUser) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = uid();

  db.get('usuarios').push({ id, nombre, email, password: hashedPassword }).write();

  const token = jwt.sign({ id, nombre, email }, JWT_SECRET, { expiresIn: '7d' });
  return res.status(201).json({ token, nombre });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  const user = db.get('usuarios').find({ email }).value();
  if (!user) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { id: user.id, nombre: user.nombre, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({ token, nombre: user.nombre });
});

// GET /api/auth/validate
router.get('/validate', authMiddleware, (req, res) => {
  return res.json({ valid: true, user: req.user });
});

// POST /api/auth/recover
router.post('/recover', (req, res) => {
  // Stub: siempre responde igual por seguridad
  return res.json({ message: 'Si el email existe, recibirás instrucciones.' });
});

module.exports = router;
