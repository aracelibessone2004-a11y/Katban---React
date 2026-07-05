import React from 'react';
import TaskCard from './TaskCard';
import { api } from '../../services/api';

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('[data-task-id]:not(.opacity-50)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: -Infinity }).element;
}

export default function Column({ 
  column, 
  projectId,
  onDeleteColumn,
  onUpdateColumnName,
  onDeleteTask,
  onMoveTask,
  draggedTaskId,
  setDraggedTaskId,
  draggedFromColumnId,
  setDraggedFromColumnId,
  searchQuery
}) {

  const handleDragOverBody = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-body-secondary');
  };

  const handleDragLeaveBody = (e) => {
    e.currentTarget.classList.remove('bg-body-secondary');
  };

  const handleDropBody = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-body-secondary');

    if (!draggedTaskId || !draggedFromColumnId) return;

    const afterElement = getDragAfterElement(e.currentTarget, e.clientY);
    const afterTaskId = afterElement ? afterElement.dataset.taskId : null;

    onMoveTask(draggedFromColumnId, column.id, draggedTaskId, afterTaskId);
  };

  const handleDropColumn = (e) => {
    e.preventDefault();
    // Only handle column-level drops if not dropped inside the task list body
    if (e.target.closest('.card-body')) return;

    if (draggedTaskId && draggedFromColumnId) {
      onMoveTask(draggedFromColumnId, column.id, draggedTaskId, null);
    }
  };

  return (
    <div 
      className="card bg-light shadow rounded-3 column-width border-0"
      data-column-id={column.id}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropColumn}
    >
      {/* Header */}
      <div className={`card-header d-flex align-items-center justify-content-between ${column.colorClass || 'colorBrief'} rounded-top-3`}>
        <h5 
          className="mb-0 text-white fw-semibold editable-title" 
          contentEditable 
          suppressContentEditableWarning
          spellCheck="false" 
          onBlur={(e) => {
            const val = e.currentTarget.textContent.trim();
            if (val) {
              onUpdateColumnName(column.id, val);
            } else {
              e.currentTarget.textContent = column.name; // Reset if empty
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {column.name}
        </h5>
        
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-dark rounded-pill">
            {column.tasks ? column.tasks.length : 0}
          </span>
          <button 
            className="btn btn-sm p-0 text-white border-0" 
            title="Eliminar columna" 
            onClick={() => onDeleteColumn(column.id)}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      {/* Body */}
      <div 
        className="card-body p-2 d-flex flex-column gap-2 overflow-y-auto column-tasks-scroll"
        data-column-id={column.id}
        onDragOver={handleDragOverBody}
        onDragLeave={handleDragLeaveBody}
        onDrop={handleDropBody}
      >
        {column.tasks && column.tasks.map(task => (
          <TaskCard 
            key={task.id}
            task={task}
            columnId={column.id}
            onDeleteTask={onDeleteTask}
            draggedTaskId={draggedTaskId}
            setDraggedTaskId={setDraggedTaskId}
            setDraggedFromColumnId={setDraggedFromColumnId}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="card-footer bg-transparent border-top-0 p-2 d-flex justify-content-center">
        <button 
          className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-1 rounded-3 px-3 btn-dashed"
          onClick={() => {
            // Redirect to editor
            window.location.href = `editortareas.html?id=${projectId}&columnId=${encodeURIComponent(column.id)}`;
          }}
        >
          <i className="bi bi-plus"></i> Añadir tarea
        </button>
      </div>
    </div>
  );
}
