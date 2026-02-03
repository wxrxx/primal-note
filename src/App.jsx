import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import HomeworkPlanner from './components/HomeworkPlanner';
import WorkPlanner from './components/WorkPlanner';
import Login from './pages/Login';
import Register from './pages/Register';
import { useCloudStorage } from './hooks/useCloudStorage';
import { useAuth } from './contexts/AuthContext';
import NotificationToast from './components/NotificationToast';

function App() {
    const [activeView, setActiveView] = useState('dashboard');
    const [events, setEvents] = useCloudStorage('primal-events', []);
    const [homework, setHomework] = useCloudStorage('primal-homework', []);
    const [workTasks, setWorkTasks] = useCloudStorage('primal-work', []);
    const { currentUser, logout } = useAuth();

    // If needed to handle initial auth view logic
    // But since we want to allow guest usage? Or force login?
    // User requested "System register login", likely implies auth wall or optional auth.
    // Let's make it optional: Dashboard has a "Login" button if not logged in.
    // OR: The user can access 'login' and 'register' views via sidebar or redirect.

    // Let's check if activeView is login/register
    if (activeView === 'login') {
        return <Login setActiveView={setActiveView} />;
    }
    if (activeView === 'register') {
        return <Register setActiveView={setActiveView} />;
    }

    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <Dashboard
                        events={events}
                        homework={homework}
                        workTasks={workTasks}
                        setActiveView={setActiveView}
                    />
                );
            case 'calendar':
                return <Calendar events={events} setEvents={setEvents} />;
            case 'homework':
                return <HomeworkPlanner homework={homework} setHomework={setHomework} />;
            case 'work':
                return <WorkPlanner workTasks={workTasks} setWorkTasks={setWorkTasks} />;
            default:
                return <Dashboard events={events} homework={homework} workTasks={workTasks} setActiveView={setActiveView} />;
        }
    };

    return (
        <div className="app-container">
            <Sidebar activeView={activeView} setActiveView={setActiveView} isAuthenticated={!!currentUser} logout={logout} />
            <main className="main-content">
                {renderView()}
            </main>
            <NotificationToast />
        </div>
    );
}

export default App;
