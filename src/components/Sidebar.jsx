import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Icons } from './Icons';
import './Sidebar.css';

const navItems = [
    { id: 'dashboard', label: 'หน้าหลัก', icon: Icons.Dashboard },
    { id: 'calendar', label: 'ปฏิทิน', icon: Icons.Calendar },
    { id: 'homework', label: 'การบ้าน', icon: Icons.Book },
    { id: 'work', label: 'งาน', icon: Icons.Briefcase },
    { id: 'ideas', label: 'ไอเดีย/บันทึก', icon: Icons.Lightbulb },
];

function Sidebar({ activeView, setActiveView, isAuthenticated, logout }) {
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser } = useAuth();
    const { success, error } = useNotification();

    const handleLogout = async () => {
        try {
            await logout();
            success('ออกจากระบบแล้ว');
        } catch (err) {
            error('เกิดข้อผิดพลาดในการออกจากระบบ');
        }
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                <Icons.Menu />
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">
                            <Icons.Target />
                        </div>
                        <div className="logo-text">
                            <span className="logo-title">Primal Note</span>
                            <span className="logo-subtitle">Life Planner</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeView === item.id;
                            const isLocked = !isAuthenticated && item.id !== 'dashboard';

                            return (
                                <li key={item.id}>
                                    <button
                                        className={`nav-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                        onClick={() => {
                                            setActiveView(item.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <span className="nav-icon">
                                            <Icon />
                                        </span>
                                        <span className="nav-label">{item.label}</span>
                                        {isLocked && (
                                            <span className="lock-indicator">
                                                <Icons.Lock />
                                            </span>
                                        )}
                                        {isActive && <span className="nav-indicator" />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    {isAuthenticated ? (
                        <div className="user-card" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                            <div className="user-avatar">
                                <span>👤</span>
                            </div>
                            <div className="user-info">
                                <span className="user-name">{currentUser?.displayName || 'บัญชีของฉัน'}</span>
                                <span className="user-status" style={{ color: '#ef4444' }}>ออกจากระบบ</span>
                            </div>
                        </div>
                    ) : (
                        <div className="auth-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => setActiveView('login')}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontFamily: 'var(--font-family)'
                                }}
                            >
                                เข้าสู่ระบบ
                            </button>
                            <button
                                onClick={() => setActiveView('register')}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontFamily: 'var(--font-family)'
                                }}
                            >
                                สมัครสมาชิก
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
