import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((type, message, duration = 3000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, message }]);

        // Auto remove
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const success = (message) => addNotification('success', message);
    const error = (message) => addNotification('error', message);
    const info = (message) => addNotification('info', message);
    const warning = (message) => addNotification('warning', message, 5000);
    const reminder = (message) => addNotification('reminder', message, 8000);

    const value = {
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        info,
        warning,
        reminder
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}
