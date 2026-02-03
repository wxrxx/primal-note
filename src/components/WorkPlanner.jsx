import React, { useState } from 'react';
import { Icons } from './Icons';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { th } from 'date-fns/locale';
import './WorkPlanner.css';

const workCategories = [
    { id: 'video', label: 'วิดีโอ', color: '#EF4444', icon: Icons.Video },
    { id: 'graphics', label: 'กราฟิก', color: '#22D3EE', icon: Icons.Image },
    { id: 'audio', label: 'เสียง', color: '#8B5CF6', icon: Icons.Music },
    { id: 'research', label: 'วิจัย', color: '#10B981', icon: Icons.Search },
    { id: 'football', label: 'ฟุตบอล', color: '#F59E0B', icon: Icons.Target },
    { id: 'other', label: 'อื่นๆ', color: '#64748B', icon: Icons.ListTodo },
];

function WorkPlanner({ workTasks, setWorkTasks }) {
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'video',
        deadline: '',
        subtasks: [],
    });
    const [newSubtask, setNewSubtask] = useState('');

    const today = new Date();

    const handleAdd = () => {
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            category: 'video',
            deadline: format(new Date(), 'yyyy-MM-dd'),
            subtasks: [],
        });
        setShowModal(true);
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            category: task.category,
            deadline: format(new Date(task.deadline), 'yyyy-MM-dd'),
            subtasks: task.subtasks || [],
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        setWorkTasks(workTasks.filter(t => t.id !== id));
        setShowDetailModal(false);
    };

    const handleViewDetails = (task) => {
        setSelectedTask(task);
        setShowDetailModal(true);
    };

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        setFormData({
            ...formData,
            subtasks: [...formData.subtasks, { id: Date.now().toString(), title: newSubtask, completed: false }],
        });
        setNewSubtask('');
    };

    const handleRemoveSubtask = (subtaskId) => {
        setFormData({
            ...formData,
            subtasks: formData.subtasks.filter(s => s.id !== subtaskId),
        });
    };

    const handleToggleSubtask = (taskId, subtaskId) => {
        setWorkTasks(workTasks.map(task => {
            if (task.id !== taskId) return task;
            const updatedSubtasks = task.subtasks.map(s =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
            );
            const completedCount = updatedSubtasks.filter(s => s.completed).length;
            const progress = updatedSubtasks.length > 0
                ? Math.round((completedCount / updatedSubtasks.length) * 100)
                : 0;
            return { ...task, subtasks: updatedSubtasks, progress };
        }));
        // Update selected task for detail modal
        if (selectedTask?.id === taskId) {
            setSelectedTask(prev => {
                const updatedSubtasks = prev.subtasks.map(s =>
                    s.id === subtaskId ? { ...s, completed: !s.completed } : s
                );
                const completedCount = updatedSubtasks.filter(s => s.completed).length;
                const progress = updatedSubtasks.length > 0
                    ? Math.round((completedCount / updatedSubtasks.length) * 100)
                    : 0;
                return { ...prev, subtasks: updatedSubtasks, progress };
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.deadline) return;

        const completedCount = formData.subtasks.filter(s => s.completed).length;
        const progress = formData.subtasks.length > 0
            ? Math.round((completedCount / formData.subtasks.length) * 100)
            : 0;

        if (editingTask) {
            setWorkTasks(workTasks.map(t =>
                t.id === editingTask.id
                    ? { ...t, ...formData, deadline: new Date(formData.deadline).toISOString(), progress }
                    : t
            ));
        } else {
            const newTask = {
                id: Date.now().toString(),
                ...formData,
                deadline: new Date(formData.deadline).toISOString(),
                progress,
                createdAt: new Date().toISOString(),
            };
            setWorkTasks([...workTasks, newTask]);
        }

        setShowModal(false);
    };

    const getDeadlineStatus = (deadline) => {
        const d = new Date(deadline);
        const diff = differenceInDays(d, today);

        if (isPast(d) && !isToday(d)) return { text: 'เลยกำหนด', class: 'overdue' };
        if (isToday(d)) return { text: 'วันนี้', class: 'today' };
        if (diff === 1) return { text: 'พรุ่งนี้', class: 'tomorrow' };
        if (diff <= 7) return { text: `อีก ${diff} วัน`, class: 'soon' };
        return { text: format(d, 'd MMM', { locale: th }), class: 'normal' };
    };

    // Sort by progress ascending, then by deadline
    const sortedTasks = [...workTasks].sort((a, b) => {
        if (a.progress !== b.progress) return a.progress - b.progress;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    const activeCount = workTasks.filter(t => t.progress < 100).length;
    const completedCount = workTasks.filter(t => t.progress === 100).length;

    return (
        <div className="work-page animate-fade-in">
            {/* Header */}
            <header className="work-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <Icons.Briefcase />
                        โปรเจกต์และงาน
                    </h1>
                    <div className="header-stats">
                        <span className="stat active">{activeCount} กำลังทำ</span>
                        <span className="stat done">{completedCount} เสร็จ</span>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Icons.Plus />
                    สร้างโปรเจกต์ใหม่
                </button>
            </header>

            {/* Work Grid */}
            <div className="work-grid">
                {sortedTasks.length === 0 ? (
                    <div className="empty-state glass-card">
                        <div className="empty-icon">🎬</div>
                        <h3 className="empty-state-title">ยังไม่มีโปรเจกต์</h3>
                        <p className="empty-state-text">
                            เริ่มต้นสร้างโปรเจกต์มัลติมีเดียของคุณ เช่น งานฟุตบอล งานวิดีโอ หรืองานกราฟิก
                        </p>
                        <button className="btn btn-primary" onClick={handleAdd}>
                            <Icons.Plus />
                            สร้างโปรเจกต์ใหม่
                        </button>
                    </div>
                ) : (
                    sortedTasks.map((task, index) => {
                        const category = workCategories.find(c => c.id === task.category);
                        const CategoryIcon = category?.icon || Icons.ListTodo;
                        const deadline = getDeadlineStatus(task.deadline);
                        const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                        const totalSubtasks = task.subtasks?.length || 0;

                        return (
                            <div
                                key={task.id}
                                className={`work-card glass-card ${task.progress === 100 ? 'completed' : ''}`}
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => handleViewDetails(task)}
                            >
                                <div className="work-card-header">
                                    <div
                                        className="category-icon"
                                        style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                                    >
                                        <CategoryIcon />
                                    </div>
                                    <span
                                        className="category-badge"
                                        style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                                    >
                                        {category?.label}
                                    </span>
                                </div>

                                <h3 className="work-card-title">{task.title}</h3>
                                {task.description && (
                                    <p className="work-card-description">{task.description}</p>
                                )}

                                <div className="work-progress-section">
                                    <div className="progress-info">
                                        <span>ความคืบหน้า</span>
                                        <span className="progress-percent">{task.progress}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${task.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="work-card-footer">
                                    <span className={`deadline-badge ${deadline.class}`}>
                                        <Icons.Clock />
                                        {deadline.text}
                                    </span>
                                    <span className="subtasks-count">
                                        <Icons.Check />
                                        {completedSubtasks}/{totalSubtasks}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedTask && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{selectedTask.title}</h3>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDetailModal(false);
                                        handleEdit(selectedTask);
                                    }}
                                >
                                    <Icons.Edit />
                                </button>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleDelete(selectedTask.id)}
                                >
                                    <Icons.Trash />
                                </button>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowDetailModal(false)}>
                                    <Icons.X />
                                </button>
                            </div>
                        </div>

                        <div className="modal-body">
                            {selectedTask.description && (
                                <p className="detail-description">{selectedTask.description}</p>
                            )}

                            <div className="detail-meta">
                                <div className="meta-item">
                                    <span className="meta-label">หมวดหมู่</span>
                                    <span
                                        className="category-badge"
                                        style={{
                                            backgroundColor: `${workCategories.find(c => c.id === selectedTask.category)?.color}20`,
                                            color: workCategories.find(c => c.id === selectedTask.category)?.color
                                        }}
                                    >
                                        {workCategories.find(c => c.id === selectedTask.category)?.label}
                                    </span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">กำหนดส่ง</span>
                                    <span className={`deadline-badge ${getDeadlineStatus(selectedTask.deadline).class}`}>
                                        {format(new Date(selectedTask.deadline), 'd MMMM yyyy', { locale: th })}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-progress">
                                <div className="progress-info">
                                    <span>ความคืบหน้าโดยรวม</span>
                                    <span className="progress-percent">{selectedTask.progress}%</span>
                                </div>
                                <div className="progress-bar progress-bar-lg">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${selectedTask.progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="subtasks-section">
                                <h4 className="subtasks-title">
                                    งานย่อย ({selectedTask.subtasks?.filter(s => s.completed).length || 0}/{selectedTask.subtasks?.length || 0})
                                </h4>
                                {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) ? (
                                    <p className="no-subtasks">ยังไม่มีงานย่อย</p>
                                ) : (
                                    <ul className="subtasks-list">
                                        {selectedTask.subtasks.map(subtask => (
                                            <li key={subtask.id} className={`subtask-item ${subtask.completed ? 'completed' : ''}`}>
                                                <label className="checkbox-wrapper">
                                                    <input
                                                        type="checkbox"
                                                        checked={subtask.completed}
                                                        onChange={() => handleToggleSubtask(selectedTask.id, subtask.id)}
                                                    />
                                                    <span className="checkbox-custom">
                                                        <Icons.Check />
                                                    </span>
                                                </label>
                                                <span className="subtask-title">{subtask.title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingTask ? 'แก้ไขโปรเจกต์' : 'สร้างโปรเจกต์ใหม่'}
                            </h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <Icons.X />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="input-group">
                                    <label className="input-label">ชื่อโปรเจกต์</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="เช่น วิดีโอไฮไลท์ฟุตบอล..."
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">รายละเอียด</label>
                                    <textarea
                                        className="input"
                                        placeholder="อธิบายเกี่ยวกับโปรเจกต์นี้..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label className="input-label">หมวดหมู่</label>
                                        <select
                                            className="input"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {workCategories.map(c => (
                                                <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">กำหนดส่ง</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={formData.deadline}
                                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="subtasks-input-section">
                                    <label className="input-label">งานย่อย</label>
                                    <div className="subtask-input-wrapper">
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="เพิ่มงานย่อย..."
                                            value={newSubtask}
                                            onChange={e => setNewSubtask(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddSubtask();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleAddSubtask}
                                        >
                                            <Icons.Plus />
                                        </button>
                                    </div>
                                    {formData.subtasks.length > 0 && (
                                        <ul className="subtasks-preview">
                                            {formData.subtasks.map(subtask => (
                                                <li key={subtask.id} className="subtask-preview-item">
                                                    <span>{subtask.title}</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        onClick={() => handleRemoveSubtask(subtask.id)}
                                                    >
                                                        <Icons.X />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingTask ? 'บันทึก' : 'สร้าง'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkPlanner;
