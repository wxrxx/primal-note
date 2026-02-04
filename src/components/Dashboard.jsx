import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Icons } from './Icons';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import './Dashboard.css';

function Dashboard({ events, homework, workTasks, ideas = [], setActiveView }) {
    const { currentUser } = useAuth();
    const today = new Date();

    // Get upcoming events (next 7 days)
    const upcomingEvents = events
        .filter(e => {
            const eventDate = new Date(e.date);
            const diff = differenceInDays(eventDate, today);
            return diff >= 0 && diff <= 7;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    // Get pending homework
    const pendingHomework = homework
        .filter(h => !h.completed)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);

    // Get active work tasks
    const activeWorkTasks = workTasks
        .filter(t => t.progress < 100)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);

    // Get latest ideas (last 3)
    const latestIdeas = (ideas || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

    // Stats
    const stats = [
        {
            label: 'งานวันนี้',
            value: events.filter(e => isToday(new Date(e.date))).length,
            icon: Icons.Calendar,
            color: 'var(--accent-primary)',
        },
        {
            label: 'การบ้านค้าง',
            value: homework.filter(h => !h.completed).length,
            icon: Icons.Book,
            color: 'var(--accent-warning)',
        },
        {
            label: 'โปรเจกต์',
            value: workTasks.length,
            icon: Icons.Briefcase,
            color: 'var(--accent-tertiary)',
        },
        {
            label: 'เสร็จแล้ว',
            value: homework.filter(h => h.completed).length + workTasks.filter(t => t.progress === 100).length,
            icon: Icons.Check,
            color: 'var(--accent-success)',
        },
    ];

    const formatDeadline = (date) => {
        const d = new Date(date);
        if (isToday(d)) return 'วันนี้';
        if (isTomorrow(d)) return 'พรุ่งนี้';
        return format(d, 'd MMM', { locale: th });
    };

    const getDaysLeft = (date) => {
        const diff = differenceInDays(new Date(date), today);
        if (diff < 0) return 'เลยกำหนด';
        if (diff === 0) return 'วันนี้';
        if (diff === 1) return 'พรุ่งนี้';
        return `อีก ${diff} วัน`;
    };

    return (
        <div className="dashboard animate-fade-in">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <h1 className="header-title">
                        สวัสดี{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}! 👋
                    </h1>
                    <p className="header-subtitle">
                        วันนี้ {format(today, 'EEEE d MMMM yyyy', { locale: th })}
                    </p>
                </div>
            </header>

            {/* Stats Grid */}
            <section className="stats-grid">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="stat-card glass-card"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                                <Icon />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Upcoming Events */}
                <section className="dashboard-section glass-card">
                    <div className="section-header">
                        <h2 className="section-title">
                            <Icons.Calendar />
                            กำหนดการที่ใกล้ถึง
                        </h2>
                        <button className="btn btn-ghost btn-sm" onClick={() => setActiveView('calendar')}>
                            ดูทั้งหมด
                        </button>
                    </div>
                    <div className="section-content">
                        {upcomingEvents.length === 0 ? (
                            <div className="empty-message">
                                <span>ไม่มีกำหนดการในสัปดาห์นี้</span>
                            </div>
                        ) : (
                            <ul className="event-list">
                                {upcomingEvents.map((event, index) => (
                                    <li key={event.id} className="event-item" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="event-date">
                                            <span className="event-day">{format(new Date(event.date), 'd')}</span>
                                            <span className="event-month">{format(new Date(event.date), 'MMM', { locale: th })}</span>
                                        </div>
                                        <div className="event-info">
                                            <span className="event-title">{event.title}</span>
                                            <span className="event-category badge badge-primary">{event.category}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                {/* Pending Homework */}
                <section className="dashboard-section glass-card">
                    <div className="section-header">
                        <h2 className="section-title">
                            <Icons.Book />
                            การบ้านที่ต้องทำ
                        </h2>
                        <button className="btn btn-ghost btn-sm" onClick={() => setActiveView('homework')}>
                            ดูทั้งหมด
                        </button>
                    </div>
                    <div className="section-content">
                        {pendingHomework.length === 0 ? (
                            <div className="empty-message">
                                <span>🎉 ทำการบ้านเสร็จหมดแล้ว!</span>
                            </div>
                        ) : (
                            <ul className="homework-list">
                                {pendingHomework.map((hw, index) => (
                                    <li key={hw.id} className="homework-item" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="homework-info">
                                            <span className="homework-title">{hw.title}</span>
                                            <span className="homework-subject badge">{hw.subject}</span>
                                        </div>
                                        <div className={`homework-deadline ${differenceInDays(new Date(hw.deadline), today) <= 1 ? 'urgent' : ''}`}>
                                            <Icons.Clock />
                                            {getDaysLeft(hw.deadline)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                {/* Work Tasks */}
                <section className="dashboard-section glass-card full-width">
                    <div className="section-header">
                        <h2 className="section-title">
                            <Icons.Briefcase />
                            โปรเจกต์และงาน
                        </h2>
                        <button className="btn btn-ghost btn-sm" onClick={() => setActiveView('work')}>
                            ดูทั้งหมด
                        </button>
                    </div>
                    <div className="section-content">
                        {activeWorkTasks.length === 0 ? (
                            <div className="empty-message">
                                <span>ยังไม่มีโปรเจกต์ที่กำลังทำ</span>
                            </div>
                        ) : (
                            <div className="work-grid">
                                {activeWorkTasks.map((task, index) => (
                                    <div key={task.id} className="work-card" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="work-header">
                                            <span className="work-title">{task.title}</span>
                                            <span className={`badge ${task.category === 'video' ? 'badge-danger' : task.category === 'graphics' ? 'badge-cyan' : 'badge-primary'}`}>
                                                {task.category}
                                            </span>
                                        </div>
                                        <p className="work-description">{task.description}</p>
                                        <div className="work-progress">
                                            <div className="progress-header">
                                                <span>ความคืบหน้า</span>
                                                <span>{task.progress}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${task.progress}%` }} />
                                            </div>
                                        </div>
                                        <div className="work-footer">
                                            <span className="work-deadline">
                                                <Icons.Clock />
                                                {formatDeadline(task.deadline)}
                                            </span>
                                            <span className="work-subtasks">
                                                {task.subtasks?.filter(s => s.completed).length || 0}/{task.subtasks?.length || 0} งานย่อย
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Latest Ideas */}
                <section className="dashboard-section glass-card full-width">
                    <div className="section-header">
                        <h2 className="section-title">
                            <Icons.Lightbulb />
                            ไอเดียล่าสุด
                        </h2>
                        <button className="btn btn-ghost btn-sm" onClick={() => setActiveView('ideas')}>
                            ดูทั้งหมด
                        </button>
                    </div>
                    <div className="section-content">
                        {latestIdeas.length === 0 ? (
                            <div className="empty-message">
                                <span>ยังไม่มีไอเดียที่บันทึกไว้</span>
                            </div>
                        ) : (
                            <div className="work-grid">
                                {latestIdeas.map((idea, index) => (
                                    <div key={idea.id} className="work-card" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="work-header">
                                            <span className="work-title">{idea.title}</span>
                                        </div>
                                        {idea.content && (
                                            <p className="work-description" style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {idea.content}
                                            </p>
                                        )}
                                        <div className="work-footer">
                                            <span className="work-deadline">
                                                {format(new Date(idea.createdAt), 'd MMM yyyy', { locale: th })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Quick Add Button */}
            <button className="quick-add-btn btn btn-primary" onClick={() => setActiveView('calendar')}>
                <Icons.Plus />
                <span>เพิ่มกำหนดการ</span>
            </button>
        </div>
    );
}

export default Dashboard;
