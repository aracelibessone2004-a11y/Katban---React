import React from 'react';
import { api } from '../../services/api';

const LABELS = [
  { name: 'UI', badgeClass: 'colorBrief text-dark' },
  { name: 'Redes', badgeClass: 'colorProceso text-dark' },
  { name: 'Logo', badgeClass: 'colorAprobado text-dark' },
  { name: 'Banner', badgeClass: 'colorRevision text-dark' }
];

function getRelativeDateText(dateString) {
  if (!dateString) return { text: '', cssClass: '' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(`${dateString}T00:00:00`);
  const diffDays = Math.round((targetDate - today) / 86400000);

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return { text: `Venció hace ${days} día${days === 1 ? '' : 's'}`, cssClass: 'text-danger' };
  }
  if (diffDays === 0) {
    return { text: 'Vence hoy', cssClass: 'text-danger' };
  }
  if (diffDays === 1) {
    return { text: 'Vence mañana', cssClass: 'text-warning' };
  }
  return { text: `Vence en ${diffDays} días`, cssClass: 'text-secondary' };
}

export default function TaskCard({ 
  task, 
  columnId, 
  onDeleteTask, 
  draggedTaskId,
  setDraggedTaskId,
  setDraggedFromColumnId,
  searchQuery
}) {

  const handleDragStart = (e) => {
    setDraggedTaskId(task.id);
    setDraggedFromColumnId(columnId);
    e.currentTarget.classList.add('opacity-50');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedTaskId(null);
    setDraggedFromColumnId(null);
    
    // Clean up any remaining hover backgrounds from columns
    const columns = document.querySelectorAll('.bg-body-secondary');
    columns.forEach(el => el.classList.remove('bg-body-secondary'));
  };

  // Format date to DD/MM
  let formattedDate = '';
  if (task.dueDate) {
    const due = new Date(`${task.dueDate}T00:00:00`);
    const day = String(due.getDate()).padStart(2, '0');
    const month = String(due.getMonth() + 1).padStart(2, '0');
    formattedDate = `${day}/${month}`;
  }

  // Highlight outline based on search query matching title
  const isHighlighted = searchQuery.trim() !== '' && 
    task.title?.toLowerCase().includes(searchQuery.toLowerCase().trim());

  const cardStyle = isHighlighted 
    ? { outline: '2px solid #0d6efd', boxShadow: '0 0 10px rgba(13,110,253,.35)' }
    : {};

  return (
    <div 
      className="card border shadow-sm task-card"
      data-task-id={task.id}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={cardStyle}
    >
      <div className="card-body p-2">
        <div className="d-flex align-items-start justify-content-between mb-1">
          <span className="fw-medium small flex-grow-1">{task.title}</span>
          <div className="d-flex gap-1 ms-1">
            <button 
              className="btn btn-sm p-0 border-0 text-secondary" 
              title="Eliminar tarea"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(columnId, task.id);
              }}
            >
              <i className="bi bi-trash icon-xs"></i>
            </button>
          </div>
        </div>

        {task.labels && task.labels.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-1">
            {task.labels.map(name => {
              const label = LABELS.find(item => item.name === name);
              if (!label) return null;
              return (
                <span 
                  key={name} 
                  className={`badge ${label.badgeClass} rounded-pill text-badge-sm`}
                >
                  {name}
                </span>
              );
            })}
          </div>
        )}

        {task.dueDate && (
          <div className="d-flex align-items-center gap-2 mt-1 text-badge-sm">
            <span className="small fw-medium d-flex align-items-center gap-1 text-secondary">
              <i className="bi bi-calendar-event"></i> {formattedDate}
            </span>
            <span className={`ms-auto fw-medium text-badge-sm ${getRelativeDateText(task.dueDate).cssClass}`}>
              {getRelativeDateText(task.dueDate).text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
