import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Icons } from './Icons';
import './ThemeSettings.css';

export default function ThemeSettings({ isOpen, onClose }) {

    const {
        mode, toggleMode,
        bgImage, setBgImage, bgOpacity, setBgOpacity,
        glassOpacity, setGlassOpacity,
        glassBlur, setGlassBlur,
        themeColors
    } = useTheme();

    const [bgInputUrl, setBgInputUrl] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('ขนาดไฟล์ต้องไม่เกิน 2MB ครับ');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setBgImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (bgInputUrl) {
            setBgImage(bgInputUrl);
            setBgInputUrl('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="theme-overlay" onClick={onClose}>
            <div className="theme-panel" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="theme-header">
                    <h2>
                        <Icons.Settings />
                        ตั้งค่าตกแต่ง
                    </h2>
                    <button className="btn-icon" onClick={onClose}>
                        <Icons.X />
                    </button>
                </div>

                <div className="theme-content">
                    {/* Appearance Mode */}
                    <div className="theme-section">
                        <h3>โหมดยูสเซอร์ (Appearance)</h3>
                        <div className="setting-group-card">
                            <div className="mode-toggle">
                                <button
                                    className={`mode-btn ${mode === 'dark' ? 'active' : ''}`}
                                    onClick={() => mode !== 'dark' && toggleMode()}
                                >
                                    <Icons.Moon />
                                    <span>มืด (Dark)</span>
                                </button>
                                <button
                                    className={`mode-btn ${mode === 'light' ? 'active' : ''}`}
                                    onClick={() => mode !== 'light' && toggleMode()}
                                >
                                    <Icons.Sun />
                                    <span>สว่าง (Light)</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Auto-Theme Preview */}
                    <div className="theme-section">
                        <h3>สีธีมอัตโนมัติ (Smart Palette)</h3>
                        <div className="setting-group-card">
                            <div className="color-options" style={{ display: 'flex', gap: '12px', padding: '4px' }}>
                                <div className="color-option active" style={{ cursor: 'default', flex: 1 }}>
                                    <span className="color-circle" style={{ background: themeColors?.primary }}></span>
                                    <span className="color-name">สีหลัก</span>
                                </div>
                                <div className="color-option active" style={{ cursor: 'default', flex: 1 }}>
                                    <span className="color-circle" style={{ background: themeColors?.secondary }}></span>
                                    <span className="color-name">สีรอง</span>
                                </div>
                            </div>
                            <p style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                marginTop: '8px',
                                textAlign: 'center'
                            }}>
                                *ระบบวิเคราะห์สีจากภาพพื้นหลังอัตโนมัติ
                            </p>
                        </div>
                    </div>

                    {/* Background Settings */}
                    <div className="theme-section">
                        <h3>พื้นหลัง (Background)</h3>
                        <div className="setting-group-card">
                            <div className="bg-options-grid">
                                <button
                                    className={`bg-option ${!bgImage ? 'active' : ''}`}
                                    onClick={() => setBgImage(null)}
                                >
                                    <div className="bg-preview-none">
                                        <Icons.X size={24} />
                                    </div>
                                    <span className="bg-label">ไม่มี (เดิม)</span>
                                </button>

                                <label className="bg-option">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <span className="bg-icon"><Icons.Image /></span>
                                    <span className="bg-label">อัพโหลด</span>
                                </label>

                                <button
                                    className={`bg-option ${bgImage && bgImage.startsWith('http') ? 'active' : ''}`}
                                    onClick={() => document.getElementById('bg-url-input').focus()}
                                >
                                    <span className="bg-icon"><Icons.Link /></span>
                                    <span className="bg-label">ลิงก์</span>
                                </button>
                            </div>

                            <form onSubmit={handleUrlSubmit} className="bg-url-input-group">
                                <input
                                    id="bg-url-input"
                                    type="url"
                                    placeholder="วางลิงก์รูปภาพ (URL)..."
                                    className="bg-input"
                                    value={bgInputUrl}
                                    onChange={(e) => setBgInputUrl(e.target.value)}
                                />
                                <button type="submit" className="btn-icon">
                                    <Icons.Check />
                                </button>
                            </form>

                            {bgImage && (
                                <div style={{ marginTop: '20px' }}>
                                    <div className="opacity-control">
                                        <div className="opacity-header">
                                            <span>Background Opacity</span>
                                            <span>{Math.round(bgOpacity * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={bgOpacity}
                                            onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                                            className="opacity-slider"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Global Glass Settings - Always Visible */}
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                                <div className="opacity-control">
                                    <div className="opacity-header">
                                        <span>Glass Opacity</span>
                                        <span>{Math.round(glassOpacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="0.95"
                                        step="0.05"
                                        value={glassOpacity}
                                        onChange={(e) => setGlassOpacity(parseFloat(e.target.value))}
                                        className="opacity-slider"
                                    />
                                </div>

                                <div className="opacity-control">
                                    <div className="opacity-header">
                                        <span>ความเบลอ (Blur)</span>
                                        <span>{glassBlur}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="60"
                                        step="1"
                                        value={glassBlur}
                                        onChange={(e) => setGlassBlur(parseInt(e.target.value))}
                                        className="opacity-slider"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
