const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getHeaders() {
  const token = localStorage.getItem('token_mediaPila');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res;
  },

  async register(nombre, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    return res;
  },

  async recover(email) {
    const res = await fetch(`${API_BASE_URL}/auth/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res;
  },

  async validateToken(token) {
    const res = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res;
  },

  // Projects
  async getProjects() {
    const res = await fetch(`${API_BASE_URL}/proyectos`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener proyectos');
    return res.json();
  },

  async createProject(titulo, imagen, color) {
    const res = await fetch(`${API_BASE_URL}/proyectos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ titulo, imagen, color })
    });
    if (!res.ok) throw new Error('Error al crear proyecto');
    return res.json();
  },

  async updateProject(id, data) {
    const res = await fetch(`${API_BASE_URL}/proyectos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar proyecto');
    return res.json();
  },

  async deleteProject(id) {
    const res = await fetch(`${API_BASE_URL}/proyectos/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar proyecto');
    return res;
  },

  // Columns
  async createColumn(nombre, colorClass, proyectoId) {
    const res = await fetch(`${API_BASE_URL}/columnas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nombre: nombre, colorClass, proyectoId })
    });
    if (!res.ok) throw new Error('Error al crear columna');
    return res.json();
  },

  async updateColumn(id, nombre) {
    const res = await fetch(`${API_BASE_URL}/columnas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ nombre })
    });
    if (!res.ok) throw new Error('Error al actualizar columna');
    return res.json();
  },

  async deleteColumn(id) {
    const res = await fetch(`${API_BASE_URL}/columnas/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar columna');
    return res;
  },

  // Tasks
  async createTask(columnaId, title, labels = [], dueDate = null, description = '', priority = 'Media') {
    const res = await fetch(`${API_BASE_URL}/tareas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, description, labels, dueDate, priority, columnaId })
    });
    if (!res.ok) throw new Error('Error al crear tarea');
    return res.json();
  },

  async updateTask(id, data) {
    const res = await fetch(`${API_BASE_URL}/tareas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar tarea');
    return res.json();
  },

  async deleteTask(id) {
    const res = await fetch(`${API_BASE_URL}/tareas/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar tarea');
    return res;
  }
};
