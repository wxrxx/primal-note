import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { Icons } from './Icons';
import ThemeSettings from './ThemeSettings';
import AvatarSelector from './AvatarSelector';
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
    const [showThemeSettings, setShowThemeSettings] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const { currentUser } = useAuth();
    const { success, error } = useNotification();
    const { mode, toggleMode } = useTheme();

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

                {/* Theme Toggle & Settings */}
                <div className="sidebar-actions">
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleMode}
                        title={mode === 'dark' ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมมืด'}
                    >
                        {mode === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
                    </button>
                    <button
                        className="settings-btn"
                        onClick={() => setShowThemeSettings(true)}
                        title="ตั้งค่าธีม"
                    >
                        <Icons.Settings />
                    </button>
                </div>

                {/* Footer */}
                <div className="sidebar-footer">
                    {isAuthenticated ? (
                        <>
                            <div
                                className="user-profile"
                                onClick={() => {
                                    setActiveView('profile');
                                    setIsOpen(false);
                                }}
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px'
                                }}
                            >
                                {currentUser?.photoURL ? (
                                    <img
                                        src={currentUser.photoURL}
                                        alt="Profile"
                                        className="user-avatar-img"
                                        style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }}
                                    />
                                ) : (
                                    <div
                                        className="user-avatar"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            minWidth: '36px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            flexShrink: 0
                                        }}
                                    >
                                        {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                                    </div>
                                )}
                                <div className="user-info" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <span className="user-name" style={{ fontSize: '13px', fontWeight: 500, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {currentUser?.displayName || 'ผู้ใช้งาน'}
                                    </span>
                                    <span className="user-status" style={{ fontSize: '11px', display: 'block' }}>ออนไลน์</span>
                                </div>
                                <div style={{ flexShrink: 0 }}>
                                    <Icons.ChevronRight size={16} />
                                </div>
                            </div>

                            <button className="btn-logout-sidebar" onClick={handleLogout} title="ออกจากระบบ">
                                <Icons.LogOut size={18} />
                                <span>ออกจากระบบ</span>
                            </button>
                        </>
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
                                    background: 'var(--accent-primary)',
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

            {/* Theme Settings Modal */}
            <ThemeSettings
                isOpen={showThemeSettings}
                onClose={() => setShowThemeSettings(false)}
            />

            {/* Avatar Selector Modal */}
            <AvatarSelector
                isOpen={showAvatarSelector}
                onClose={() => setShowAvatarSelector(false)}
            />
        </>
    );
}

export default Sidebar;
