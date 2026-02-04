import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import './Auth.css';

export default function Login({ setActiveView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { success, error: showError } = useNotification();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            success('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ!');
            setActiveView('dashboard');
        } catch (err) {
            setError('Failed to log in: ' + err.message);
            showError('เข้าสู่ระบบไม่สำเร็จ: ' + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <img src="/logo.png" alt="Logo" />
                </div>
                <h2>เข้าสู่ระบบ</h2>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
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
                    <button disabled={loading} type="submit" className="auth-btn">
                        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>
                </form>
                <div className="auth-footer">
                    ยังไม่มีบัญชี? <span onClick={() => setActiveView('register')}>สมัครสมาชิก</span>
                </div>
            </div>
        </div>
    );
}
