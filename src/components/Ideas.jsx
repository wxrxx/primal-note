import React, { useState } from 'react';
import { Icons } from './Icons';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import './Ideas.css';

// Predefined tags with colors
const TAGS = [
    { id: 'work', label: 'งาน', color: '#6366f1' },
    { id: 'personal', label: 'ส่วนตัว', color: '#10b981' },
    { id: 'project', label: 'โปรเจกต์', color: '#8b5cf6' },
    { id: 'learning', label: 'เรียนรู้', color: '#f59e0b' },
    { id: 'creative', label: 'ครีเอทีฟ', color: '#ec4899' },
];

function Ideas({ ideas, setIdeas }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Tag filter state
    const [selectedTag, setSelectedTag] = useState(null);
    const [selectedTagForNew, setSelectedTagForNew] = useState(null);

    // Sort state
    const [sortBy, setSortBy] = useState('newest');

    // Editing state
    const [editingIdea, setEditingIdea] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editTag, setEditTag] = useState(null);

    // Filter ideas based on search query and tag
    const filteredIdeas = ideas.filter(idea => {
        // Tag filter
        if (selectedTag && idea.tag !== selectedTag) return false;
        // Search filter
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return idea.title.toLowerCase().includes(query) ||
            (idea.content && idea.content.toLowerCase().includes(query));
    });

    // Sort: apply selected sort option (pinned always first)
    const sortedIdeas = [...filteredIdeas].sort((a, b) => {
        // Pinned items always come first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        // Then apply selected sort
        switch (sortBy) {
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'title-az':
                return a.title.localeCompare(b.title, 'th');
            case 'title-za':
                return b.title.localeCompare(a.title, 'th');
            case 'newest':
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    const handleAddIdea = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newIdea = {
            id: Date.now(),
            title: title.trim(),
            content: content.trim(),
            createdAt: new Date().toISOString(),
            color: selectedTagForNew ? TAGS.find(t => t.id === selectedTagForNew)?.color : getRandomBrandColor(),
            tag: selectedTagForNew
        };

        setIdeas([newIdea, ...ideas]);
        setTitle('');
        setContent('');
        setSelectedTagForNew(null);
        setIsExpanded(false);
    };

    const handleDeleteIdea = (id) => {
        if (window.confirm('คุณต้องการลบบันทึกนี้ใช่หรือไม่?')) {
            setIdeas(ideas.filter(idea => idea.id !== id));
        }
    };

    const handleTogglePin = (id) => {
        const updatedIdeas = ideas.map(idea =>
            idea.id === id ? { ...idea, pinned: !idea.pinned } : idea
        );
        setIdeas(updatedIdeas);
    };

    const handleEditClick = (idea) => {
        setEditingIdea(idea);
        setEditTitle(idea.title);
        setEditContent(idea.content || '');
    };

    const handleUpdateIdea = (e) => {
        e.preventDefault();
        if (!editTitle.trim()) return;

        const updatedIdeas = ideas.map(idea =>
            idea.id === editingIdea.id
                ? { ...idea, title: editTitle.trim(), content: editContent.trim() }
                : idea
        );

        setIdeas(updatedIdeas);
        setEditingIdea(null);
    };

    const getRandomBrandColor = () => {
        const colors = ['#8b5cf6', '#6366f1', '#22d3ee', '#10b981'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <div className="ideas-container animate-fade-in">
            <header className="ideas-header">
                <div>
                    <h1 className="ideas-title">
                        <Icons.Lightbulb />
                        คลังไอเดีย & บันทึก
                    </h1>
                    <p className="ideas-subtitle">พื้นที่รวบรวมความคิดสร้างสรรค์และบันทึกสำคัญของคุณ</p>
                </div>
            </header>

            {/* Search Bar */}
            {ideas.length > 0 && (
                <div className="search-bar-wrapper">
                    <div className="search-bar glass-card">
                        <Icons.Search />
                        <input
                            type="text"
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ค้นหาไอเดีย..."
                        />
                        {searchQuery && (
                            <button
                                className="search-clear-btn"
                                onClick={() => setSearchQuery('')}
                                title="ล้างการค้นหา"
                            >
                                <Icons.X />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <span className="search-result-count">
                            พบ {filteredIdeas.length} จาก {ideas.length} รายการ
                        </span>
                    )}
                </div>
            )}

            {/* Tag Filter Bar */}
            {ideas.length > 0 && (
                <div className="tag-filter-bar">
                    <button
                        className={`tag-filter-btn ${!selectedTag ? 'active' : ''}`}
                        onClick={() => setSelectedTag(null)}
                    >
                        ทั้งหมด
                    </button>
                    {TAGS.map(tag => (
                        <button
                            key={tag.id}
                            className={`tag-filter-btn ${selectedTag === tag.id ? 'active' : ''}`}
                            onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                            style={{ '--tag-color': tag.color }}
                        >
                            <span className="tag-dot" style={{ background: tag.color }}></span>
                            {tag.label}
                        </button>
                    ))}

                    {/* Sort Dropdown */}
                    <div className="sort-dropdown-wrapper">
                        <select
                            className="sort-dropdown"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">ใหม่ล่าสุด</option>
                            <option value="oldest">เก่าที่สุด</option>
                            <option value="title-az">ชื่อ ก-ฮ</option>
                            <option value="title-za">ชื่อ ฮ-ก</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="add-idea-wrapper">
                <form
                    className={`add-idea-form-new glass-card ${isExpanded ? 'expanded' : ''}`}
                    onSubmit={handleAddIdea}
                >
                    {!isExpanded ? (
                        <div className="input-placeholder" onClick={() => setIsExpanded(true)}>
                            จดบันทึกอะไรบางอย่าง...
                        </div>
                    ) : (
                        <div className="idea-form-expanded animate-fade-in">
                            <input
                                type="text"
                                className="idea-input-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="หัวข้อบันทึก..."
                                autoFocus
                                required
                            />
                            <textarea
                                className="idea-input-content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="รายละเอียด..."
                            />
                            <div className="tag-selector">
                                <span className="tag-selector-label">หมวดหมู่:</span>
                                {TAGS.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        className={`tag-option ${selectedTagForNew === tag.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedTagForNew(selectedTagForNew === tag.id ? null : tag.id)}
                                        style={{ '--tag-color': tag.color }}
                                    >
                                        <span className="tag-dot" style={{ background: tag.color }}></span>
                                        {tag.label}
                                    </button>
                                ))}
                            </div>
                            <div className="idea-form-actions">
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsExpanded(false)}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm">
                                    <Icons.Plus />
                                    บันทึกไอเดีย
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            <div className="ideas-grid-refined">
                {filteredIdeas.length === 0 && searchQuery ? (
                    <div className="empty-ideas glass-card">
                        <div className="empty-icon-wrapper">
                            <Icons.Search />
                        </div>
                        <h3>ไม่พบผลลัพธ์</h3>
                        <p>ลองค้นหาด้วยคำอื่นดูนะครับ</p>
                    </div>
                ) : filteredIdeas.length === 0 ? (
                    <div className="empty-ideas glass-card">
                        <div className="empty-icon-wrapper">
                            <Icons.Lightbulb />
                        </div>
                        <h3>ยังไม่มีไอเดียที่บันทึกไว้</h3>
                        <p>จดจ่อกับสิ่งที่คิดได้แล้วเริ่มบันทึกมันที่นี่</p>
                    </div>
                ) : (
                    sortedIdeas.map((idea, index) => (
                        <div
                            key={idea.id}
                            className="idea-card-new glass-card-hover animate-slide-up"
                            style={{
                                animationDelay: `${index * 50}ms`,
                                borderTop: `4px solid ${idea.color || '#8b5cf6'}`
                            }}
                        >
                            <div className="idea-card-header">
                                {idea.pinned && (
                                    <span className="pin-indicator" title="ปักหมุดแล้ว">
                                        <Icons.Star />
                                    </span>
                                )}
                                <h3 className="idea-card-title">{idea.title}</h3>
                                <div className="idea-card-actions">
                                    <button
                                        className={`pin-idea-btn ${idea.pinned ? 'pinned' : ''}`}
                                        onClick={() => handleTogglePin(idea.id)}
                                        title={idea.pinned ? 'เลิกปักหมุด' : 'ปักหมุด'}
                                    >
                                        <Icons.Star />
                                    </button>
                                    <button
                                        className="edit-idea-btn"
                                        onClick={() => handleEditClick(idea)}
                                        title="แก้ไขไอเดีย"
                                    >
                                        <Icons.Edit />
                                    </button>
                                    <button
                                        className="delete-idea-btn-new"
                                        onClick={() => handleDeleteIdea(idea.id)}
                                        title="ลบไอเดีย"
                                    >
                                        <Icons.Trash />
                                    </button>
                                </div>
                            </div>
                            {idea.content && (
                                <p className="idea-card-content">{idea.content}</p>
                            )}
                            {idea.tag && (
                                <span
                                    className="idea-tag-badge"
                                    style={{
                                        '--tag-color': TAGS.find(t => t.id === idea.tag)?.color || '#8b5cf6'
                                    }}
                                >
                                    {TAGS.find(t => t.id === idea.tag)?.label}
                                </span>
                            )}
                            <div className="idea-card-footer">
                                <span className="idea-date">
                                    <Icons.Calendar />
                                    {format(new Date(idea.createdAt), 'd MMM yyyy', { locale: th })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {editingIdea && (
                <div className="modal-overlay animate-fade-in" onClick={() => setEditingIdea(null)}>
                    <div className="modal glass-card animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">แก้ไขบันทึก</h2>
                            <button className="btn-ghost btn-icon" onClick={() => setEditingIdea(null)}>
                                <Icons.X />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateIdea}>
                            <div className="modal-body">
                                <div className="input-group">
                                    <label className="input-label">หัวข้อ</label>
                                    <input
                                        type="text"
                                        className="idea-input-title"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        required
                                        style={{ borderBottom: '1px solid var(--border-color)', borderRadius: 0, padding: '12px 0' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">รายละเอียด</label>
                                    <textarea
                                        className="idea-input-content"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        style={{ minHeight: '150px' }}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setEditingIdea(null)}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    บันทึกการแก้ไข
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Ideas;
