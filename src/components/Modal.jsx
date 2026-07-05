import React, { useEffect } from 'react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  contentClassName = 'modal-content-custom' 
}) {
  
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    // Add class to body to prevent scrolling, just like bootstrap does
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="modal fade show" 
        style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
        tabIndex="-1"
        onClick={onClose}
      >
        <div 
          className="modal-dialog modal-dialog-centered" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`modal-content ${contentClassName}`}>
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title modal-title-custom fw-bold w-100 text-center text-uppercase mt-3">
                {title}
              </h5>
              <button 
                type="button" 
                className="btn-close shadow-none" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            
            <div className="modal-body px-4 pb-4">
              {children}
            </div>

            {footer && (
              <div className="modal-footer border-0 pt-0 d-flex justify-content-center">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
