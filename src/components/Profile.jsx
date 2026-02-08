import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Icons } from './Icons';
import './Profile.css';

export default function Profile({ setActiveView }) {
    const { currentUser, logout } = useAuth();
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
            if (file.size > 2 * 1024 * 1024) {
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

    const handleLogout = async () => {
        try {
            await logout();
            setActiveView('dashboard');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="profile-page animate-fade-in">
            <header className="profile-header">
                <h1><Icons.User /> โปรไฟล์</h1>
            </header>

            {/* User Info Section */}
            <section className="profile-section glass-card">
                <div className="user-info">
                    <div className="user-avatar">
                        {currentUser?.photoURL ? (
                            <img src={currentUser.photoURL} alt="Avatar" />
                        ) : (
                            <div className="avatar-placeholder">
                                <Icons.User />
                            </div>
                        )}
                    </div>
                    <div className="user-details">
                        <h2 className="user-name">
                            {currentUser?.displayName || 'ผู้ใช้งาน'}
                        </h2>
                        <p className="user-email">{currentUser?.email || 'Guest Mode'}</p>
                    </div>
                </div>

                {currentUser ? (
                    <button className="btn-logout" onClick={handleLogout}>
                        <Icons.LogOut />
                        ออกจากระบบ
                    </button>
                ) : (
                    <div className="guest-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => setActiveView('login')}
                        >
                            <Icons.Lock />
                            เข้าสู่ระบบ
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={() => setActiveView('register')}
                        >
                            สมัครสมาชิก
                        </button>
                    </div>
                )}
            </section>

            {/* Theme Settings */}
            <section className="profile-section glass-card">
                <h3 className="section-title">
                    <Icons.Settings />
                    ตั้งค่าธีม (Smart Theme)
                </h3>

                {/* Mode Toggle */}
                <div className="setting-group">
                    <label className="setting-label">โหมด</label>
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

                {/* Active Theme Colors Display */}
                <div className="setting-group">
                    <label className="setting-label">สีที่ใช้งาน (Auto-Generated)</label>
                    <div className="color-options" style={{ display: 'flex', gap: '10px' }}>
                        <div className="color-option active" style={{ cursor: 'default' }}>
                            <span className="color-circle" style={{ background: themeColors?.primary }}></span>
                            <span className="color-name">Primary</span>
                        </div>
                        <div className="color-option active" style={{ cursor: 'default' }}>
                            <span className="color-circle" style={{ background: themeColors?.secondary }}></span>
                            <span className="color-name">Secondary</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Background Settings */}
            <section className="profile-section glass-card">
                <h3 className="section-title">
                    <Icons.Image />
                    พื้นหลัง
                </h3>

                <div className="setting-group">
                    <div className="bg-options-grid">
                        <button
                            className={`bg-option ${!bgImage ? 'active' : ''}`}
                            onClick={() => setBgImage(null)}
                        >
                            <span className="bg-preview-none"></span>
                            <span className="bg-label">เดิม</span>
                        </button>

                        <label className="bg-option upload-btn">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                            <span className="bg-icon"><Icons.Image /></span>
                            <span className="bg-label">อัพโหลด</span>
                        </label>
                    </div>

                    <form onSubmit={handleUrlSubmit} className="bg-url-input-group">
                        <input
                            type="url"
                            placeholder="หรือวางลิงก์รูปภาพ..."
                            className="bg-input"
                            value={bgInputUrl}
                            onChange={(e) => setBgInputUrl(e.target.value)}
                        />
                        <button type="submit" className="btn-icon-small">
                            <Icons.Check />
                        </button>
                    </form>

                    {bgImage && (
                        <>
                            <div className="opacity-control">
                                <div className="opacity-header">
                                    <span>ความเข้มพื้นหลัง</span>
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

                            <div className="opacity-control" style={{ marginTop: '1rem' }}>
                                <div className="opacity-header">
                                    <span>ความโปร่งใสเมนู</span>
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

                            <div className="opacity-control" style={{ marginTop: '1rem' }}>
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
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
