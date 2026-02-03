import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import HomeworkPlanner from './components/HomeworkPlanner';
import WorkPlanner from './components/WorkPlanner';
import { useLocalStorage } from './hooks/useLocalStorage';

// Sample data for initial demo
const sampleEvents = [
    {
        id: '1',
        title: 'ประชุมทีมฟุตบอล',
        description: 'วางแผนการถ่ายทำไฮไลท์',
        category: 'work',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        time: '14:00',
    },
    {
        id: '2',
        title: 'ส่งงานคณิตศาสตร์',
        description: 'แบบฝึกหัดบทที่ 5',
        category: 'study',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        time: '09:00',
    },
    {
        id: '3',
        title: 'ถ่ายวิดีโอ',
        description: 'ถ่ายเกมแข่งขัน',
        category: 'work',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        time: '16:00',
    },
];

const sampleHomework = [
    {
        id: '1',
        title: 'ทำแบบฝึกหัดหน้า 45-50',
        subject: 'math',
        priority: 'high',
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
    },
    {
        id: '2',
        title: 'เขียนเรียงความเรื่องสิ่งแวดล้อม',
        subject: 'thai',
        priority: 'medium',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
    },
    {
        id: '3',
        title: 'อ่านบทที่ 7 และสรุป',
        subject: 'science',
        priority: 'low',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        completed: true,
    },
];

const sampleWorkTasks = [
    {
        id: '1',
        title: 'วิดีโอไฮไลท์ฟุตบอล รอบชิงฯ',
        description: 'สร้างวิดีโอไฮไลท์การแข่งขันฟุตบอลรอบชิงชนะเลิศ พร้อมเอฟเฟกต์และเพลงประกอบ',
        category: 'football',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 35,
        subtasks: [
            { id: 's1', title: 'รวบรวมคลิปจากกล้องทุกตัว', completed: true },
            { id: 's2', title: 'ตัดต่อไฮไลท์ประตู', completed: true },
            { id: 's3', title: 'เพิ่มกราฟิกชื่อนักเตะ', completed: false },
            { id: 's4', title: 'ใส่เพลงประกอบ', completed: false },
            { id: 's5', title: 'Color grading', completed: false },
            { id: 's6', title: 'Export และอัพโหลด', completed: false },
        ],
    },
    {
        id: '2',
        title: 'ออกแบบโปสเตอร์งานกีฬาสี',
        description: 'ออกแบบโปสเตอร์ประชาสัมพันธ์งานกีฬาสีประจำปี',
        category: 'graphics',
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 66,
        subtasks: [
            { id: 's1', title: 'ร่างแบบ concept', completed: true },
            { id: 's2', title: 'ออกแบบใน Photoshop', completed: true },
            { id: 's3', title: 'ให้อาจารย์ approve', completed: false },
        ],
    },
];

function App() {
    const [activeView, setActiveView] = useState('dashboard');
    const [events, setEvents] = useLocalStorage('primal-events', sampleEvents);
    const [homework, setHomework] = useLocalStorage('primal-homework', sampleHomework);
    const [workTasks, setWorkTasks] = useLocalStorage('primal-work', sampleWorkTasks);

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
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="main-content">
                {renderView()}
            </main>
        </div>
    );
}

export default App;
