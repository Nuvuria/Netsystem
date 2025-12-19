import React from 'react';
import { useConfirmModal } from '../../context/ConfirmModalContext';
import './ConfirmModal.css';

const ConfirmModal = () => {
  const { isOpen, title, message, confirmText, cancelText, onConfirm, onCancel } = useConfirmModal();

  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-container">
        <div className="confirm-modal-header">
          <div className="mensalix-logo-text">MENSALIX</div>
        </div>
        <div className="confirm-modal-content">
          <h3 className="confirm-modal-title">{title}</h3>
          <p className="confirm-modal-message">{message}</p>
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-btn cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="confirm-modal-btn confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
