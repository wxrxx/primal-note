import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { Icons } from './Icons';
import './NotificationToast.css';

export default function NotificationToast() {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div className="toast-container">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`toast toast-${notification.type}`}
                    onClick={() => removeNotification(notification.id)}
                >
                    <div className="toast-icon">
                        {notification.type === 'success' && <Icons.CheckCircle />}
                        {notification.type === 'error' && <Icons.AlertCircle />}
                        {notification.type === 'info' && <Icons.Info />}
                        {notification.type === 'warning' && <Icons.AlertTriangle />}
                        {notification.type === 'reminder' && <Icons.Bell />}
                    </div>
                    <div className="toast-message">{notification.message}</div>
                    <div className="toast-close">×</div>
                </div>
            ))}
        </div>
    );
}
