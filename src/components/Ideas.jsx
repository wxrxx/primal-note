import React, { useState } from 'react';
import { Icons } from './Icons';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import './Ideas.css';

function Ideas({ ideas, setIdeas }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleAddIdea = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newIdea = {
            id: Date.now(),
            title: title.trim(),
            content: content.trim(),
            createdAt: new Date().toISOString()
        };

        setIdeas([newIdea, ...ideas]);
        setTitle('');
        setContent('');
    };

    const handleDeleteIdea = (id) => {
        if (window.confirm('ต้องการลบไอเดียนี้ใช่หรือไม่?')) {
            setIdeas(ideas.filter(idea => idea.id !== id));
        }
    };

    return (
        <div className="ideas-container animate-fade-in">
            <header className="ideas-header">
                <h1 className="ideas-title">
                    <Icons.Lightbulb />
                    คลังไอเดีย & บันทึก
                </h1>
            </header>

            <form className="add-idea-form glass-card" onSubmit={handleAddIdea}>
                <div className="idea-input-group">
                    <label>หัวข้อไอเดีย</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="คิดอะไรออกบ้าง..."
                        required
                    />
                </div>
                <div className="idea-input-group">
                    <label>รายละเอียด (ถ้ามี)</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="อธิบายไอเดียของคุณหน่อย..."
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                    <Icons.Plus />
                    บันทึกไอเดีย
                </button>
            </form>

            <div className="ideas-grid">
                {ideas.length === 0 ? (
                    <div className="empty-ideas">
                        <Icons.Lightbulb />
                        <p>ยังไม่มีไอเดียที่บันทึกไว้ เริ่มจดบันทึกไอเดียแรกของคุณเลย!</p>
                    </div>
                ) : (
                    ideas.map((idea) => (
                        <div key={idea.id} className="idea-card glass-card animate-slide-up">
                            <div className="idea-card-header">
                                <h3 className="idea-card-title">{idea.title}</h3>
                                <button
                                    className="delete-idea-btn btn-ghost"
                                    onClick={() => handleDeleteIdea(idea.id)}
                                    title="ลบไอเดีย"
                                >
                                    <Icons.Trash />
                                </button>
                            </div>
                            {idea.content && (
                                <p className="idea-card-content">{idea.content}</p>
                            )}
                            <div className="idea-card-footer">
                                <span>
                                    {format(new Date(idea.createdAt), 'd MMM yyyy HH:mm', { locale: th })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Ideas;
