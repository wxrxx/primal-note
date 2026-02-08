import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Icons } from './Icons';
import './AvatarSelector.css';

// Preset seeds for consistent avatars
const NOTION_SEEDS = ['Felix', 'Aneka', 'Bandit', 'Bubba', 'Callie', 'Garfield', 'Gizmo', 'Leo', 'Loki', 'Luna', 'Misty', 'Oreo'];
const ADVENTURER_SEEDS = ['Felix', 'Aneka', 'Bandit', 'Bubba', 'Callie', 'Garfield', 'Gizmo', 'Leo', 'Loki', 'Luna', 'Misty', 'Oreo'];

export default function AvatarSelector({ isOpen, onClose }) {
    const { currentUser, updateUserProfile } = useAuth();
    const { success, error } = useNotification();
    const [loading, setLoading] = useState(false);
    const [customUrl, setCustomUrl] = useState('');

    if (!isOpen) return null;

    const handleSelectAvatar = async (url) => {
        setLoading(true);
        try {
            await updateUserProfile({ photoURL: url });
            success('อัพเดทรูปโปรไฟล์สำเร็จ!');
            onClose();
        } catch (err) {
            console.error(err);
            error('เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomUrl = async (e) => {
        e.preventDefault();
        if (!customUrl) return;
        handleSelectAvatar(customUrl);
    };

    return (
        <div className="avatar-selector-overlay animate-fade-in" onClick={onClose}>
            <div className="avatar-selector-modal glass-card animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="avatar-selector-header">
                    <h2>
                        <Icons.User />
                        เลือกรูปโปรไฟล์
                    </h2>
                    <button className="btn-ghost btn-icon" onClick={onClose}>
                        <Icons.X />
                    </button>
                </div>

                <div className="avatar-selector-body">
                    {/* Minimalist Style (Notion) */}
                    <div className="avatar-section">
                        <h3 className="avatar-section-title">Minimalist Style</h3>
                        <div className="avatar-grid">
                            {NOTION_SEEDS.map(seed => {
                                const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=e5e7eb,fcd34d,fca5a5,bae6fd`;
                                return (
                                    <div
                                        key={seed}
                                        className={`avatar-option ${currentUser.photoURL === url ? 'selected' : ''}`}
                                        onClick={() => handleSelectAvatar(url)}
                                    >
                                        <img src={url} alt={`Avatar ${seed}`} loading="lazy" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3D Fun Style */}
                    <div className="avatar-section">
                        <h3 className="avatar-section-title">3D Characters</h3>
                        <div className="avatar-grid">
                            {ADVENTURER_SEEDS.map(seed => {
                                const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                                return (
                                    <div
                                        key={seed}
                                        className={`avatar-option ${currentUser.photoURL === url ? 'selected' : ''}`}
                                        onClick={() => handleSelectAvatar(url)}
                                    >
                                        <img src={url} alt={`Avatar ${seed}`} loading="lazy" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom URL */}
                    <div className="avatar-custom-input">
                        <h3 className="avatar-section-title">ใช้รูปจากลิงก์</h3>
                        <form onSubmit={handleCustomUrl} className="input-with-button">
                            <input
                                type="url"
                                className="input"
                                placeholder="วางลิงก์รูปภาพ..."
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                บันทึก
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
