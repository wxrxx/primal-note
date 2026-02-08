import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SplashScreen from './components/SplashScreen';
import DynamicIsland from './components/DynamicIsland';

import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import HomeworkPlanner from './components/HomeworkPlanner';
import WorkPlanner from './components/WorkPlanner';
import Ideas from './components/Ideas';
import Profile from './components/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginRequired from './components/LoginRequired';
import { useCloudStorage } from './hooks/useCloudStorage';
import { useAuth } from './contexts/AuthContext';
import NotificationToast from './components/NotificationToast';

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [events, setEvents] = useCloudStorage('primal-events', []);
    const [homework, setHomework] = useCloudStorage('primal-homework', []);
    const [workTasks, setWorkTasks] = useCloudStorage('primal-work', []);
    const [ideas, setIdeas] = useCloudStorage('primal-ideas', []);
    const { currentUser, logout } = useAuth();

    // Show splash screen on first load
    if (isLoading) {
        return <SplashScreen onComplete={() => setIsLoading(false)} />;
    }

    // Let's check if activeView is login/register
    if (activeView === 'login') {
        return <Login setActiveView={setActiveView} />;
    }
    if (activeView === 'register') {
        return <Register setActiveView={setActiveView} />;
    }

    const renderView = () => {
        // Restricted views check
        const isRestricted = ['calendar', 'homework', 'work', 'ideas'].includes(activeView);
        if (isRestricted && !currentUser) {
            const featureNames = {
                calendar: 'ปฏิทิน',
                homework: 'การบ้าน',
                work: 'โปรเจกต์งาน',
                ideas: 'คลังไอเดีย/บันทึก'
            };
            return <LoginRequired setActiveView={setActiveView} featureName={featureNames[activeView]} />;
        }

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
            case 'ideas':
                return <Ideas ideas={ideas} setIdeas={setIdeas} />;
            case 'profile':
                return <Profile setActiveView={setActiveView} />;
            default:
                return <Dashboard events={events} homework={homework} workTasks={workTasks} setActiveView={setActiveView} />;
        }
    };

    return (
        <div className="app-container">
            <Sidebar activeView={activeView} setActiveView={setActiveView} isAuthenticated={!!currentUser} logout={logout} />
            <DynamicIsland events={events} />
            <main className="main-content">
                {renderView()}
            </main>
            <NotificationToast />
        </div>
    );
}

export default App;
