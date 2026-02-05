import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Icons } from './Icons';
import './ThemeSettings.css';

export default function ThemeSettings({ isOpen, onClose }) {
    const { mode, toggleMode, accentId, setAccentId, accentColors, customSecondary, setCustomSecondary, resetSecondary, currentAccent } = useTheme();

    if (!isOpen) return null;

    const secondaryColors = [
        { id: 'default', name: 'ค่าเริ่มต้น', color: currentAccent.secondary },
        { id: '#6366F1', name: 'คราม', color: '#6366F1' },
        { id: '#8B5CF6', name: 'ม่วง', color: '#8B5CF6' },
        { id: '#EC4899', name: 'ชมพู', color: '#EC4899' },
        { id: '#22D3EE', name: 'ฟ้าอ่อน', color: '#22D3EE' },
        { id: '#10B981', name: 'เขียว', color: '#10B981' },
        { id: '#F59E0B', name: 'ส้ม', color: '#F59E0B' },
    ];

    const handleSecondaryChange = (colorId) => {
        if (colorId === 'default') {
            resetSecondary();
        } else {
            setCustomSecondary(colorId);
        }
    };

    const currentSecondaryId = customSecondary || 'default';

    return (
        <div className="theme-overlay animate-fade-in" onClick={onClose}>
            <div className="theme-panel glass-card animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="theme-header">
                    <h2>
                        <Icons.Settings />
                        ตั้งค่าธีม
                    </h2>
                    <button className="btn-ghost btn-icon" onClick={onClose}>
                        <Icons.X />
                    </button>
                </div>

                <div className="theme-section">
                    <h3>โหมด</h3>
                    <div className="mode-toggle">
                        <button
                            className={`mode-btn ${mode === 'dark' ? 'active' : ''}`}
                            onClick={() => mode !== 'dark' && toggleMode()}
                        >
                            <Icons.Moon />
                            มืด
                        </button>
                        <button
                            className={`mode-btn ${mode === 'light' ? 'active' : ''}`}
                            onClick={() => mode !== 'light' && toggleMode()}
                        >
                            <Icons.Sun />
                            สว่าง
                        </button>
                    </div>
                </div>

                <div className="theme-section">
                    <h3>สีหลัก</h3>
                    <div className="color-options">
                        {accentColors.map(color => (
                            <button
                                key={color.id}
                                className={`color-option ${accentId === color.id ? 'active' : ''}`}
                                style={{ '--color': color.primary }}
                                onClick={() => setAccentId(color.id)}
                                title={color.name}
                            >
                                <span className="color-circle" style={{ background: color.primary }}></span>
                                <span className="color-name">{color.name}</span>
                                {accentId === color.id && <Icons.Check />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="theme-section">
                    <h3>สีรอง (Secondary)</h3>
                    <div className="color-options secondary-colors">
                        {secondaryColors.map(color => (
                            <button
                                key={color.id}
                                className={`color-option ${currentSecondaryId === color.id ? 'active' : ''}`}
                                style={{ '--color': color.color }}
                                onClick={() => handleSecondaryChange(color.id)}
                                title={color.name}
                            >
                                <span className="color-circle" style={{ background: color.color }}></span>
                                <span className="color-name">{color.name}</span>
                                {currentSecondaryId === color.id && <Icons.Check />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="theme-preview">
                    <p className="preview-label">ตัวอย่าง</p>
                    <div className="preview-card glass-card">
                        <div className="preview-header">
                            <span className="preview-dot" style={{ background: 'var(--accent-primary)' }}></span>
                            <span className="preview-dot" style={{ background: 'var(--accent-secondary)' }}></span>
                            <span>การ์ดตัวอย่าง</span>
                        </div>
                        <div className="preview-body">
                            <button className="btn btn-primary btn-sm">ปุ่มหลัก</button>
                            <button className="btn btn-ghost btn-sm">ปุ่มรอง</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
