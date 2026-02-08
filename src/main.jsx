import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Detect iOS standalone PWA mode
const isIOSStandalone = ('standalone' in window.navigator) && window.navigator.standalone;
const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

if (isIOSStandalone || isIOSDevice) {
    document.body.classList.add('ios-device');
}
if (isIOSStandalone) {
    document.body.classList.add('ios-standalone');
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider>
            <NotificationProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </NotificationProvider>
        </ThemeProvider>
    </React.StrictMode>,
)
