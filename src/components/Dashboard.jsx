import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Icons } from './Icons';
import { format, isToday, isTomorrow, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, subDays, isWithinInterval } from 'date-fns';
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

    // Urgent items (due today or tomorrow, or overdue)
    const urgentItems = [
        ...homework.filter(h => !h.completed && differenceInDays(new Date(h.deadline), today) <= 1)
            .map(h => ({ type: 'homework', title: h.title, deadline: h.deadline, overdue: differenceInDays(new Date(h.deadline), today) < 0 })),
        ...workTasks.filter(t => t.progress < 100 && differenceInDays(new Date(t.deadline), today) <= 1)
            .map(t => ({ type: 'work', title: t.title, deadline: t.deadline, overdue: differenceInDays(new Date(t.deadline), today) < 0 })),
        ...events.filter(e => isToday(new Date(e.date)))
            .map(e => ({ type: 'event', title: e.title, deadline: e.date, overdue: false }))
    ].slice(0, 3);

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

    // Weekly productivity data (last 7 days)
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, 6 - i);
        const dayEvents = events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.toDateString() === date.toDateString();
        }).length;
        const dayHomework = homework.filter(h => {
            const dueDate = new Date(h.deadline);
            return h.completed && dueDate.toDateString() === date.toDateString();
        }).length;
        const dayTasks = workTasks.filter(t => {
            const taskDate = new Date(t.deadline);
            return t.progress === 100 && taskDate.toDateString() === date.toDateString();
        }).length;
        return {
            date,
            dayName: format(date, 'EEE', { locale: th }),
            dayNum: format(date, 'd'),
            total: dayEvents + dayHomework + dayTasks,
            events: dayEvents,
            homework: dayHomework,
            tasks: dayTasks,
            isToday: isToday(date)
        };
    });

    const maxDayTotal = Math.max(...weekDays.map(d => d.total), 1);

    // Productivity score (simple calculation)
    const totalCompleted = homework.filter(h => h.completed).length + workTasks.filter(t => t.progress === 100).length;
    const totalItems = homework.length + workTasks.length;
    const productivityScore = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

    // Detailed completion trackers
    const homeworkCompleted = homework.filter(h => h.completed).length;
    const homeworkTotal = homework.length;
    const homeworkPercent = homeworkTotal > 0 ? Math.round((homeworkCompleted / homeworkTotal) * 100) : 0;

    const workCompleted = workTasks.filter(t => t.progress === 100).length;
    const workTotal = workTasks.length;
    const workPercent = workTotal > 0 ? Math.round((workCompleted / workTotal) * 100) : 0;

    const avgWorkProgress = workTotal > 0
        ? Math.round(workTasks.reduce((sum, t) => sum + t.progress, 0) / workTotal)
        : 0;

    // Calculate productivity streak (consecutive days with completed tasks)
    const calculateStreak = () => {
        let streak = 0;
        const allCompletedDates = [
            ...homework.filter(h => h.completed && h.deadline).map(h => new Date(h.deadline).toDateString()),
            ...workTasks.filter(t => t.progress === 100 && t.deadline).map(t => new Date(t.deadline).toDateString()),
            ...events.map(e => new Date(e.date).toDateString())
        ];

        // Check from today backwards
        for (let i = 0; i < 30; i++) {
            const checkDate = subDays(today, i);
            const dateStr = checkDate.toDateString();
            if (allCompletedDates.includes(dateStr) || weekDays.find(d => d.date.toDateString() === dateStr && d.total > 0)) {
                streak++;
            } else if (i > 0) {
                // Allow today to be empty but break if any previous day is empty
                break;
            }
        }
        return streak;
    };

    const currentStreak = calculateStreak();
    const streakEmoji = currentStreak >= 7 ? '🔥' : currentStreak >= 3 ? '⚡' : '✨';

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

                {/* Streak Badge */}
                {currentStreak > 0 && (
                    <div className="streak-badge glass-card">
                        <span className="streak-emoji">{streakEmoji}</span>
                        <div className="streak-info">
                            <span className="streak-count">{currentStreak}</span>
                            <span className="streak-label">วัน streak</span>
                        </div>
                    </div>
                )}

                {!currentUser && (
                    <div className="guest-badge glass-card" onClick={() => setActiveView('login')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Icons.Lock />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Guest Mode (เข้าสู่ระบบเพื่อซิงค์ข้อมูล)</span>
                    </div>
                )}
            </header>

            {/* Urgent Alerts Banner */}
            {urgentItems.length > 0 && (
                <section className="urgent-alerts-banner glass-card">
                    <div className="urgent-header">
                        <Icons.AlertTriangle />
                        <span>ต้องทำเร่งด่วน!</span>
                    </div>
                    <div className="urgent-items">
                        {urgentItems.map((item, index) => (
                            <div key={index} className={`urgent-item ${item.overdue ? 'overdue' : ''}`}>
                                {item.type === 'homework' && <Icons.Book />}
                                {item.type === 'work' && <Icons.Briefcase />}
                                {item.type === 'event' && <Icons.Calendar />}
                                <span className="urgent-title">{item.title}</span>
                                <span className="urgent-deadline">
                                    {item.overdue ? 'เลยกำหนด!' : isToday(new Date(item.deadline)) ? 'วันนี้' : 'พรุ่งนี้'}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

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

            {/* Weekly Productivity Chart */}
            <section className="productivity-section">
                <div className="weekly-chart-card glass-card">
                    <div className="section-header">
                        <h2 className="section-title">
                            <Icons.Activity />
                            กิจกรรมในสัปดาห์นี้
                        </h2>
                    </div>
                    <div className="weekly-chart">
                        {weekDays.map((day, index) => (
                            <div
                                key={index}
                                className={`chart-bar-wrapper ${day.isToday ? 'today' : ''}`}
                            >
                                <div className="chart-bar-container">
                                    <div
                                        className="chart-bar"
                                        style={{
                                            height: `${(day.total / maxDayTotal) * 100}%`,
                                            animationDelay: `${index * 100}ms`
                                        }}
                                    >
                                        {day.total > 0 && (
                                            <span className="chart-bar-value">{day.total}</span>
                                        )}
                                    </div>
                                </div>
                                <span className="chart-day-name">{day.dayName}</span>
                                <span className="chart-day-num">{day.dayNum}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="productivity-score-card glass-card">
                    <div className="section-header">
                        <h2 className="section-title">
                            <Icons.Target />
                            ความคืบหน้า
                        </h2>
                    </div>
                    <div className="score-ring-container">
                        <svg className="score-ring" viewBox="0 0 100 100">
                            <circle
                                className="score-ring-bg"
                                cx="50"
                                cy="50"
                                r="42"
                                strokeWidth="8"
                                fill="none"
                            />
                            <circle
                                className="score-ring-progress"
                                cx="50"
                                cy="50"
                                r="42"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${productivityScore * 2.64} 264`}
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="score-value">
                            <span className="score-number">{productivityScore}</span>
                            <span className="score-percent">%</span>
                        </div>
                    </div>
                    <div className="score-label">
                        เสร็จแล้ว {totalCompleted} จาก {totalItems} รายการ
                    </div>
                </div>

                {/* Completion Trackers */}
                <div className="completion-trackers-card glass-card">
                    <div className="section-header">
                        <h2 className="section-title">
                            <Icons.Check />
                            สถานะงาน
                        </h2>
                    </div>
                    <div className="trackers-list">
                        <div className="tracker-item">
                            <div className="tracker-header">
                                <Icons.Book />
                                <span className="tracker-name">การบ้าน</span>
                                <span className="tracker-count">{homeworkCompleted}/{homeworkTotal}</span>
                            </div>
                            <div className="tracker-bar-bg">
                                <div
                                    className="tracker-bar-fill homework"
                                    style={{ width: `${homeworkPercent}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="tracker-item">
                            <div className="tracker-header">
                                <Icons.Briefcase />
                                <span className="tracker-name">โปรเจกต์เสร็จ</span>
                                <span className="tracker-count">{workCompleted}/{workTotal}</span>
                            </div>
                            <div className="tracker-bar-bg">
                                <div
                                    className="tracker-bar-fill work"
                                    style={{ width: `${workPercent}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="tracker-item">
                            <div className="tracker-header">
                                <Icons.Activity />
                                <span className="tracker-name">ความคืบหน้าเฉลี่ย</span>
                                <span className="tracker-count">{avgWorkProgress}%</span>
                            </div>
                            <div className="tracker-bar-bg">
                                <div
                                    className="tracker-bar-fill average"
                                    style={{ width: `${avgWorkProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
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
            <button
                className={`quick-add-btn btn btn-primary ${!currentUser ? 'disabled' : ''}`}
                onClick={() => currentUser ? setActiveView('calendar') : setActiveView('login')}
            >
                {currentUser ? (
                    <>
                        <Icons.Plus />
                        <span>เพิ่มกำหนดการ</span>
                    </>
                ) : (
                    <>
                        <Icons.Lock />
                        <span>กรุณาเข้าสู่ระบบ</span>
                    </>
                )}
            </button>
        </div>
    );
}

export default Dashboard;
