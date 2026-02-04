import React from 'react';
import { Icons } from './Icons';
import './LoginRequired.css';

function LoginRequired({ setActiveView, featureName }) {
    return (
        <div className="login-required-container animate-fade-in">
            <div className="login-required-card glass-card">
                <div className="lock-icon-wrapper">
                    <Icons.Lock />
                </div>
                <h2 className="login-required-title">เข้าถึงไม่ได้</h2>
                <p className="login-required-text">
                    ฟีเจอร์ <strong>{featureName}</strong> สงวนไว้สำหรับสมาชิกเท่านั้น <br />
                    กรุณาเข้าสู่ระบบเพื่อซิงค์ข้อมูลของคุณขึ้น Cloud
                </p>
                <div className="login-required-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setActiveView('login')}
                    >
                        เข้าสู่ระบบ
                    </button>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setActiveView('register')}
                    >
                        สมัครสมาชิก
                    </button>
                </div>
                <button
                    className="back-to-dashboard-btn"
                    onClick={() => setActiveView('dashboard')}
                >
                    กลับไปหน้าหลัก (พรีวิว)
                </button>
            </div>
        </div>
    );
}

export default LoginRequired;
