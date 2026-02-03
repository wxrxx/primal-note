import React, { useState } from 'react';
import { Icons } from './Icons';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isToday,
} from 'date-fns';
import { th } from 'date-fns/locale';
import './Calendar.css';

const categories = [
    { id: 'study', label: 'เรียน', color: '#8B5CF6' },
    { id: 'work', label: 'งาน', color: '#22D3EE' },
    { id: 'personal', label: 'ส่วนตัว', color: '#10B981' },
    { id: 'important', label: 'สำคัญ', color: '#EF4444' },
];

function Calendar({ events, setEvents }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'study',
        time: '',
    });

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
    }

    const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

    const getEventsForDay = (date) => {
        return events.filter(event => isSameDay(new Date(event.date), date));
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
    };

    const handleDayClick = (date) => {
        setSelectedDate(date);
    };

    const handleAddEvent = () => {
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            category: 'study',
            time: '',
        });
        setShowModal(true);
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description || '',
            category: event.category,
            time: event.time || '',
        });
        setShowModal(true);
    };

    const handleDeleteEvent = (eventId) => {
        setEvents(events.filter(e => e.id !== eventId));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        if (editingEvent) {
            setEvents(events.map(ev =>
                ev.id === editingEvent.id
                    ? { ...ev, ...formData, date: selectedDate.toISOString() }
                    : ev
            ));
        } else {
            const newEvent = {
                id: Date.now().toString(),
                ...formData,
                date: selectedDate.toISOString(),
            };
            setEvents([...events, newEvent]);
        }

        setShowModal(false);
        setFormData({ title: '', description: '', category: 'study', time: '' });
    };

    const selectedDayEvents = getEventsForDay(selectedDate);

    return (
        <div className="calendar-page animate-fade-in">
            {/* Header */}
            <header className="calendar-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <Icons.Calendar />
                        ปฏิทิน
                    </h1>
                    <span className="current-date">
                        {format(currentMonth, 'MMMM yyyy', { locale: th })}
                    </span>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary btn-sm" onClick={handleToday}>
                        วันนี้
                    </button>
                    <div className="month-nav">
                        <button className="btn btn-ghost btn-icon" onClick={handlePrevMonth}>
                            <Icons.ChevronLeft />
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={handleNextMonth}>
                            <Icons.ChevronRight />
                        </button>
                    </div>
                    <button className="btn btn-primary" onClick={handleAddEvent}>
                        <Icons.Plus />
                        เพิ่มกิจกรรม
                    </button>
                </div>
            </header>

            <div className="calendar-layout">
                {/* Calendar Grid */}
                <div className="calendar-container glass-card">
                    {/* Week days header */}
                    <div className="calendar-weekdays">
                        {weekDays.map(d => (
                            <div key={d} className="weekday">{d}</div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="calendar-days">
                        {days.map((day, index) => {
                            const dayEvents = getEventsForDay(day);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isSelected = isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);

                            return (
                                <div
                                    key={index}
                                    className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
                                    onClick={() => handleDayClick(day)}
                                >
                                    <span className="day-number">{format(day, 'd')}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="day-events">
                                            {dayEvents.slice(0, 3).map(event => {
                                                const cat = categories.find(c => c.id === event.category);
                                                return (
                                                    <div
                                                        key={event.id}
                                                        className="day-event-dot"
                                                        style={{ backgroundColor: cat?.color }}
                                                        title={event.title}
                                                    />
                                                );
                                            })}
                                            {dayEvents.length > 3 && (
                                                <span className="more-events">+{dayEvents.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Day Panel */}
                <div className="day-panel glass-card">
                    <div className="panel-header">
                        <h2 className="panel-title">
                            {format(selectedDate, 'd MMMM yyyy', { locale: th })}
                        </h2>
                        <button className="btn btn-primary btn-sm" onClick={handleAddEvent}>
                            <Icons.Plus />
                        </button>
                    </div>

                    <div className="panel-content">
                        {selectedDayEvents.length === 0 ? (
                            <div className="empty-state">
                                <Icons.Calendar />
                                <p>ไม่มีกิจกรรมในวันนี้</p>
                                <button className="btn btn-secondary btn-sm" onClick={handleAddEvent}>
                                    เพิ่มกิจกรรม
                                </button>
                            </div>
                        ) : (
                            <ul className="events-list">
                                {selectedDayEvents.map(event => {
                                    const cat = categories.find(c => c.id === event.category);
                                    return (
                                        <li key={event.id} className="event-card">
                                            <div className="event-color" style={{ backgroundColor: cat?.color }} />
                                            <div className="event-content">
                                                <div className="event-header">
                                                    <span className="event-title">{event.title}</span>
                                                    <div className="event-actions">
                                                        <button
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                            onClick={() => handleEditEvent(event)}
                                                        >
                                                            <Icons.Edit />
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                            onClick={() => handleDeleteEvent(event.id)}
                                                        >
                                                            <Icons.Trash />
                                                        </button>
                                                    </div>
                                                </div>
                                                {event.time && (
                                                    <span className="event-time">
                                                        <Icons.Clock /> {event.time}
                                                    </span>
                                                )}
                                                {event.description && (
                                                    <p className="event-description">{event.description}</p>
                                                )}
                                                <span className="event-category badge" style={{ backgroundColor: `${cat?.color}20`, color: cat?.color }}>
                                                    {cat?.label}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingEvent ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรม'}
                            </h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <Icons.X />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="input-group">
                                    <label className="input-label">ชื่อกิจกรรม</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="เช่น ประชุมทีม, ส่งงาน..."
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">รายละเอียด</label>
                                    <textarea
                                        className="input"
                                        placeholder="รายละเอียดเพิ่มเติม..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label className="input-label">เวลา</label>
                                        <input
                                            type="time"
                                            className="input"
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">หมวดหมู่</label>
                                        <select
                                            className="input"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingEvent ? 'บันทึก' : 'เพิ่ม'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Calendar;
