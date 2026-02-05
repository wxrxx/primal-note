import React, { useState } from 'react';
import { Icons } from './Icons';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { th } from 'date-fns/locale';
import './HomeworkPlanner.css';

const subjects = [
    { id: 'math', label: 'คณิตศาสตร์', color: '#8B5CF6', emoji: '📐' },
    { id: 'science', label: 'วิทยาศาสตร์', color: '#10B981', emoji: '🔬' },
    { id: 'thai', label: 'ภาษาไทย', color: '#F59E0B', emoji: '📖' },
    { id: 'english', label: 'ภาษาอังกฤษ', color: '#22D3EE', emoji: '🌐' },
    { id: 'social', label: 'สังคมศึกษา', color: '#EF4444', emoji: '🌍' },
    { id: 'art', label: 'ศิลปะ', color: '#EC4899', emoji: '🎨' },
    { id: 'pe', label: 'พลศึกษา', color: '#6366F1', emoji: '⚽' },
    { id: 'other', label: 'อื่นๆ', color: '#64748B', emoji: '📝' },
];

const priorities = [
    { id: 'high', label: 'ด่วน', color: '#EF4444' },
    { id: 'medium', label: 'ปานกลาง', color: '#F59E0B' },
    { id: 'low', label: 'ไม่ด่วน', color: '#10B981' },
];

const repeatOptions = [
    { id: 'none', label: 'ไม่ซ้ำ' },
    { id: 'daily', label: 'ทุกวัน', icon: '🗓️' },
    { id: 'weekly', label: 'ทุกสัปดาห์', icon: '📅' },
    { id: 'monthly', label: 'ทุกเดือน', icon: '📆' },
];

function HomeworkPlanner({ homework, setHomework }) {
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, completed
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        subject: 'math',
        description: '',
        priority: 'medium',
        deadline: '',
        repeat: 'none',
    });

    const today = new Date();

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({
            title: '',
            subject: 'math',
            description: '',
            priority: 'medium',
            deadline: format(new Date(), 'yyyy-MM-dd'),
            repeat: 'none',
        });
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            subject: item.subject,
            description: item.description || '',
            priority: item.priority,
            deadline: format(new Date(item.deadline), 'yyyy-MM-dd'),
            repeat: item.repeat || 'none',
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        setHomework(homework.filter(h => h.id !== id));
    };

    const handleToggleComplete = (id) => {
        const item = homework.find(h => h.id === id);
        if (!item) return;

        if (!item.completed && item.repeat && item.repeat !== 'none') {
            // Create next occurrence for recurring task
            const currentDeadline = new Date(item.deadline);
            let nextDeadline = new Date(currentDeadline);

            if (item.repeat === 'daily') {
                nextDeadline.setDate(nextDeadline.getDate() + 1);
            } else if (item.repeat === 'weekly') {
                nextDeadline.setDate(nextDeadline.getDate() + 7);
            } else if (item.repeat === 'monthly') {
                nextDeadline.setMonth(nextDeadline.getMonth() + 1);
            }

            const nextItem = {
                ...item,
                id: Date.now().toString(),
                deadline: nextDeadline.toISOString(),
                completed: false,
                completedAt: null,
                createdAt: new Date().toISOString(),
            };

            setHomework(prev => [
                ...prev.map(h => h.id === id ? { ...h, completed: true, completedAt: new Date().toISOString() } : h),
                nextItem
            ]);
        } else {
            setHomework(homework.map(h =>
                h.id === id ? { ...h, completed: !h.completed, completedAt: !h.completed ? new Date().toISOString() : null } : h
            ));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.deadline) return;

        if (editingItem) {
            setHomework(homework.map(h =>
                h.id === editingItem.id ? { ...h, ...formData, deadline: new Date(formData.deadline).toISOString() } : h
            ));
        } else {
            const newItem = {
                id: Date.now().toString(),
                ...formData,
                deadline: new Date(formData.deadline).toISOString(),
                completed: false,
                createdAt: new Date().toISOString(),
            };
            setHomework([...homework, newItem]);
        }

        setShowModal(false);
    };

    const getDeadlineStatus = (deadline) => {
        const d = new Date(deadline);
        const diff = differenceInDays(d, today);

        if (isPast(d) && !isToday(d)) return { text: 'เลยกำหนด', class: 'overdue' };
        if (isToday(d)) return { text: 'วันนี้', class: 'today' };
        if (diff === 1) return { text: 'พรุ่งนี้', class: 'tomorrow' };
        if (diff <= 3) return { text: `อีก ${diff} วัน`, class: 'soon' };
        return { text: format(d, 'd MMM', { locale: th }), class: 'normal' };
    };

    // Filter homework
    let filteredHomework = [...homework];

    if (filter === 'pending') {
        filteredHomework = filteredHomework.filter(h => !h.completed);
    } else if (filter === 'completed') {
        filteredHomework = filteredHomework.filter(h => h.completed);
    }

    if (subjectFilter !== 'all') {
        filteredHomework = filteredHomework.filter(h => h.subject === subjectFilter);
    }

    // Sort: uncompleted first by deadline, then completed
    filteredHomework.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    const pendingCount = homework.filter(h => !h.completed).length;
    const completedCount = homework.filter(h => h.completed).length;

    return (
        <div className="homework-page animate-fade-in">
            {/* Header */}
            <header className="homework-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <Icons.Book />
                        การบ้าน
                    </h1>
                    <div className="header-stats">
                        <span className="stat pending">{pendingCount} ค้าง</span>
                        <span className="stat completed">{completedCount} เสร็จ</span>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Icons.Plus />
                    เพิ่มการบ้าน
                </button>
            </header>

            {/* Filters */}
            <div className="filters-bar glass-card">
                <div className="filter-group">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        ทั้งหมด
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        ยังไม่เสร็จ
                    </button>
                    <button
                        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        เสร็จแล้ว
                    </button>
                </div>
                <select
                    className="input subject-filter"
                    value={subjectFilter}
                    onChange={e => setSubjectFilter(e.target.value)}
                >
                    <option value="all">ทุกวิชา</option>
                    {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
                    ))}
                </select>
            </div>

            {/* Homework List */}
            <div className="homework-list">
                {filteredHomework.length === 0 ? (
                    <div className="empty-state glass-card">
                        <div className="empty-icon">📚</div>
                        <h3 className="empty-state-title">
                            {filter === 'completed' ? 'ยังไม่มีการบ้านที่เสร็จ' : 'ไม่มีการบ้านที่ต้องทำ'}
                        </h3>
                        <p className="empty-state-text">
                            {filter === 'pending' ? '🎉 เยี่ยมมาก! ทำการบ้านครบหมดแล้ว' : 'กดปุ่ม "เพิ่มการบ้าน" เพื่อเริ่มต้น'}
                        </p>
                        {filter !== 'completed' && (
                            <button className="btn btn-primary" onClick={handleAdd}>
                                <Icons.Plus />
                                เพิ่มการบ้าน
                            </button>
                        )}
                    </div>
                ) : (
                    filteredHomework.map((item, index) => {
                        const subject = subjects.find(s => s.id === item.subject);
                        const priority = priorities.find(p => p.id === item.priority);
                        const deadline = getDeadlineStatus(item.deadline);

                        return (
                            <div
                                key={item.id}
                                className={`homework-card glass-card ${item.completed ? 'completed' : ''}`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <label className="checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={() => handleToggleComplete(item.id)}
                                    />
                                    <span className="checkbox-custom">
                                        <Icons.Check />
                                    </span>
                                </label>

                                <div className="homework-content">
                                    <div className="homework-main">
                                        <div className="homework-header-row">
                                            <span className="homework-title">{item.title}</span>
                                            <div className="homework-actions">
                                                <button
                                                    className="btn btn-ghost btn-icon btn-sm"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Icons.Edit />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-icon btn-sm"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </div>
                                        </div>
                                        {item.description && (
                                            <p className="homework-description">{item.description}</p>
                                        )}
                                    </div>

                                    <div className="homework-meta">
                                        <span
                                            className="subject-badge"
                                            style={{ backgroundColor: `${subject?.color}20`, color: subject?.color }}
                                        >
                                            {subject?.emoji} {subject?.label}
                                        </span>
                                        <span
                                            className="priority-badge"
                                            style={{ backgroundColor: `${priority?.color}20`, color: priority?.color }}
                                        >
                                            {priority?.label}
                                        </span>
                                        <span className={`deadline-badge ${deadline.class}`}>
                                            <Icons.Clock />
                                            {deadline.text}
                                        </span>
                                        {item.repeat && item.repeat !== 'none' && (
                                            <span className="repeat-badge" title="งานซ้ำ">
                                                🔄 {repeatOptions.find(r => r.id === item.repeat)?.label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingItem ? 'แก้ไขการบ้าน' : 'เพิ่มการบ้าน'}
                            </h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <Icons.X />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="input-group">
                                    <label className="input-label">หัวข้อการบ้าน</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="เช่น ทำแบบฝึกหัดหน้า 45..."
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label className="input-label">วิชา</label>
                                        <select
                                            className="input"
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        >
                                            {subjects.map(s => (
                                                <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">ความเร่งด่วน</label>
                                        <select
                                            className="input"
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            {priorities.map(p => (
                                                <option key={p.id} value={p.id}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label className="input-label">กำหนดส่ง</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={formData.deadline}
                                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">ทำซ้ำ</label>
                                        <select
                                            className="input"
                                            value={formData.repeat}
                                            onChange={e => setFormData({ ...formData, repeat: e.target.value })}
                                        >
                                            {repeatOptions.map(r => (
                                                <option key={r.id} value={r.id}>
                                                    {r.icon ? `${r.icon} ` : ''}{r.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">รายละเอียด (ไม่บังคับ)</label>
                                    <textarea
                                        className="input"
                                        placeholder="รายละเอียดเพิ่มเติม..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingItem ? 'บันทึก' : 'เพิ่ม'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomeworkPlanner;
