import React, { useState } from 'react';
import { Icons } from './Icons';
import './Sidebar.css';

const navItems = [
    { id: 'dashboard', label: 'หน้าหลัก', icon: Icons.Dashboard },
    { id: 'calendar', label: 'ปฏิทิน', icon: Icons.Calendar },
    { id: 'homework', label: 'การบ้าน', icon: Icons.Book },
    { id: 'work', label: 'งาน', icon: Icons.Briefcase },
];

function Sidebar({ activeView, setActiveView }) {
    const [isOpen, setIsOpen] = useState(false);

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
                            return (
                                <li key={item.id}>
                                    <button
                                        className={`nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveView(item.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <span className="nav-icon">
                                            <Icon />
                                        </span>
                                        <span className="nav-label">{item.label}</span>
                                        {isActive && <span className="nav-indicator" />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div className="user-card">
                        <div className="user-avatar">
                            <span>👤</span>
                        </div>
                        <div className="user-info">
                            <span className="user-name">ผู้ใช้งาน</span>
                            <span className="user-status">ออนไลน์</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
