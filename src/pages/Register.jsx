import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import './Auth.css';

export default function Register({ setActiveView }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const { success, error: showError } = useNotification();

    async function handleSubmit(e) {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('รหัสผ่านไม่ตรงกัน');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, username);
            success('สมัครสมาชิกสำเร็จ!');
            setActiveView('dashboard');
        } catch (err) {
            setError('Failed to create an account: ' + err.message);
            showError('สมัครสมาชิกไม่สำเร็จ: ' + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <img src="/logo.png" alt="Logo" />
                </div>
                <h2>สมัครสมาชิก</h2>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>ชื่อผู้ใช้ (Username)</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your Name"
                        />
                    </div>
                    <div className="form-group">
                        <label>อีเมล</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>รหัสผ่าน</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="form-group">
                        <label>ยืนยันรหัสผ่าน</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button disabled={loading} type="submit" className="auth-btn">
                        {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
                    </button>
                </form>
                <div className="auth-footer">
                    มีบัญชีแล้ว? <span onClick={() => setActiveView('login')}>เข้าสู่ระบบ</span>
                </div>
            </div>
        </div>
    );
}
