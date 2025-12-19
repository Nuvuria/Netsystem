import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import './Notification.css';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((note) => (
        <div 
          key={note.id} 
          className={`notification-toast notification-${note.type}`}
          onClick={() => removeNotification(note.id)}
        >
          <div className="notification-icon">
            {note.type === 'success' && '✅'}
            {note.type === 'error' && '🚨'}
            {note.type === 'warning' && '⚠️'}
            {note.type === 'info' && 'ℹ️'}
          </div>
          <div className="notification-message">
            {note.message}
          </div>
          <div className="notification-close">×</div>
          
          <div className="notification-progress"></div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
