import React, { useState, useEffect } from 'react';
import './DynamicIsland.css';
import { Icons } from './Icons';

export default function DynamicIsland({ events = [] }) {
    // Mode: 'idle' | 'timer' | 'event' | 'music'
    const [isExpanded, setIsExpanded] = useState(false);

    // Timer State
    const [totalSeconds, setTotalSeconds] = useState(25 * 60); // 25 min default
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    // Clock State
    const [time, setTime] = useState(new Date());

    // Event State
    const [nextEvent, setNextEvent] = useState(null);
    const [showEventMode, setShowEventMode] = useState(false);

    // Playlist State (Music)
    const [playlist, setPlaylist] = useState([
        {
            id: 1,
            title: "Lo-fi Beats to Study To",
            artist: "Primal radio",
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
            src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3",
            type: 'audio'
        },
        {
            id: 2,
            title: "Lofi Girl Radio",
            artist: "YouTube",
            src: "jfKfPfyJRdk", // Video ID
            type: 'youtube'
        }
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showMusicMode, setShowMusicMode] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [addMusicUrl, setAddMusicUrl] = useState('');

    const currentTrack = playlist[currentIndex];

    // Helper: Get YouTube ID
    const getYouTubeID = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Helper: Add YouTube Track
    const handleAddYouTube = (e) => {
        e.preventDefault();
        const videoId = getYouTubeID(addMusicUrl);
        if (videoId) {
            const newTrack = {
                id: Date.now(),
                title: "New YouTube Track",
                artist: "YouTube",
                src: videoId,
                type: 'youtube',
                cover: `https://img.youtube.com/vi/${videoId}/0.jpg`
            };
            setPlaylist([...playlist, newTrack]);
            setAddMusicUrl('');
            setShowPlaylist(false);
            setCurrentIndex(playlist.length);
            setIsPlaying(true);
        }
    };

    // Audio Ref
    const audioRef = React.useRef(null);

    // Initial Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
        }
    }, []);

    // Handle Audio Playback
    useEffect(() => {
        if (currentTrack && currentTrack.type === 'audio' && audioRef.current) {
            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Audio playback error:", error);
                        setIsPlaying(false);
                    });
                }
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

    const handleNext = (e) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % playlist.length);
        setIsPlaying(true);
    };

    const handlePrev = (e) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
        setIsPlaying(true);
    };

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Find next event
    useEffect(() => {
        if (!events || events.length === 0) {
            setNextEvent(null);
            return;
        }
        const now = new Date();
        const upcoming = events
            .filter(e => new Date(e.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        setNextEvent(upcoming.length > 0 ? upcoming[0] : null);
    }, [events, time]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const formatClock = (date) => {
        return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    };

    const handleIslandClick = () => {
        setIsExpanded(!isExpanded);
    };

    const getContainerClass = () => {
        if (isExpanded) {
            return `expanded ${showPlaylist ? 'playlist-mode' : ''}`;
        }
        if (isActive || isPlaying || (timeLeft < totalSeconds && timeLeft > 0)) return 'activity';
        return 'idle';
    };

    return (
        <div className="dynamic-island-container">
            {/* Backdrop click to close */}
            {isExpanded && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: -1 }}
                    onClick={() => setIsExpanded(false)}
                />
            )}

            <div
                className={`dynamic-island ${getContainerClass()}`}
                onClick={handleIslandClick}
            >
                {/* 1. Idle Content (Clock) */}
                <div className={`di-content ${!isExpanded && !isActive && !isPlaying && timeLeft === totalSeconds ? 'active' : ''} content-idle`}>
                    <span className="idle-time">{formatClock(time)}</span>
                </div>

                {/* 2. Compact Activity */}
                <div className={`di-content ${!isExpanded && (isActive || isPlaying || (timeLeft < totalSeconds && timeLeft > 0)) ? 'active' : ''} content-timer-compact`}>
                    {isPlaying && !isActive ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={currentTrack.cover} className="mini-cover" alt="cover" />
                                <div className="mini-wave">
                                    <div className="wave-bar" style={{ background: '#22D3EE' }}></div>
                                    <div className="wave-bar" style={{ background: '#22D3EE' }}></div>
                                    <div className="wave-bar" style={{ background: '#22D3EE' }}></div>
                                </div>
                            </div>
                            <span className="mini-timer" style={{ color: '#22D3EE', fontSize: '12px', maxWidth: '80px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                {currentTrack.title}
                            </span>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="mini-icon"><Icons.Clock size={14} /></span>
                                <span className="mini-label">Focus</span>
                            </div>
                            {isActive ? (
                                <div className="mini-wave">
                                    <div className="wave-bar"></div>
                                    <div className="wave-bar"></div>
                                    <div className="wave-bar"></div>
                                </div>
                            ) : (
                                <span className="mini-label" style={{ color: '#F87171' }}>Paused</span>
                            )}
                            <span className="mini-timer">{formatTime(timeLeft)}</span>
                        </>
                    )}
                </div>

                {/* 3. Expanded Content */}
                <div className={`di-content ${isExpanded ? 'active' : ''} ${showEventMode ? 'content-event-expanded' : showMusicMode ? 'content-music-expanded' : 'content-timer-expanded'}`}>

                    {showEventMode && nextEvent ? (
                        <>
                            <div className="event-header">
                                <Icons.Calendar size={14} />
                                <span>Upcoming Event</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowEventMode(false); }}
                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                                >
                                    <Icons.Clock size={14} />
                                </button>
                            </div>
                            <div className="event-title-big">{nextEvent.title}</div>
                            <div className="event-time-big">
                                {nextEvent.time ? nextEvent.time : new Date(nextEvent.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </>
                    ) : showMusicMode ? (
                        <>
                            <div className="music-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: '#22D3EE' }}><Icons.Activity size={14} /></span>
                                    <span>Now Playing</span>
                                </div>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowPlaylist(!showPlaylist); }}
                                        style={{ background: 'none', border: 'none', color: showPlaylist ? '#22D3EE' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                                    >
                                        <Icons.ListTodo size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowMusicMode(false); }}
                                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                                    >
                                        <Icons.Clock size={14} />
                                    </button>
                                </div>
                            </div>

                            {showPlaylist ? (
                                <div className="playlist-view" onClick={(e) => e.stopPropagation()}>
                                    <div className="playlist-list">
                                        {playlist.map((track, idx) => (
                                            <div
                                                key={track.id}
                                                className={`playlist-item ${idx === currentIndex ? 'active' : ''}`}
                                                onClick={() => { setCurrentIndex(idx); setIsPlaying(true); }}
                                            >
                                                <div className="playlist-cover" style={{ backgroundImage: `url(${track.cover || 'https://via.placeholder.com/40'})` }}></div>
                                                <div className="playlist-info">
                                                    <div className="p-title">{track.title}</div>
                                                    <div className="p-artist">{track.artist}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <form onSubmit={handleAddYouTube} className="add-music-form">
                                        <input
                                            type="text"
                                            placeholder="Paste YouTube URL..."
                                            value={addMusicUrl}
                                            onChange={(e) => setAddMusicUrl(e.target.value)}
                                            className="add-music-input"
                                        />
                                        <button type="submit" className="add-music-btn">
                                            <Icons.Plus size={16} />
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="music-main">
                                    <div className={`album-cover ${isPlaying ? 'playing' : ''}`}>
                                        <img src={currentTrack.cover || `https://img.youtube.com/vi/${currentTrack.src}/0.jpg`} alt="Album Art" />
                                    </div>
                                    <div className="track-info">
                                        <div className="track-title">{currentTrack.title}</div>
                                        <div className="track-artist">{currentTrack.artist}</div>
                                    </div>
                                </div>
                            )}

                            <div className="music-controls">
                                <button className="music-btn" onClick={handlePrev}>
                                    <Icons.Rewind size={20} />
                                </button>
                                <button className="music-btn primary" onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}>
                                    {isPlaying ? <Icons.Pause size={24} /> : <Icons.Play size={24} />}
                                </button>
                                <button className="music-btn" onClick={handleNext}>
                                    <Icons.FastForward size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="timer-header">
                                <span>Focus Timer</span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ opacity: 0.5 }}>Pomodoro</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowMusicMode(true); }}
                                        style={{ background: 'rgba(34, 211, 238, 0.15)', border: 'none', borderRadius: '12px', padding: '2px 8px', color: '#22D3EE', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Icons.Music size={10} /> Music
                                    </button>
                                </div>
                            </div>
                            <div className="timer-display-big">
                                {formatTime(timeLeft)}
                            </div>
                            <div className="timer-controls">
                                <button
                                    className="timer-btn"
                                    onClick={(e) => { e.stopPropagation(); setTimeLeft(25 * 60); setIsActive(false); }}
                                >
                                    <Icons.RotateCcw size={20} />
                                </button>
                                <button
                                    className="timer-btn primary"
                                    onClick={(e) => { e.stopPropagation(); setIsActive(!isActive); }}
                                >
                                    {isActive ? <Icons.Pause size={24} /> : <Icons.Play size={24} />}
                                </button>
                                <button
                                    className="timer-btn"
                                    onClick={(e) => { e.stopPropagation(); setTimeLeft(t => t + 300); }}
                                >
                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>+5</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Audio Player */}
            <audio ref={audioRef} src={currentTrack && currentTrack.type === 'audio' ? currentTrack.src : ''} loop />

            {/* YouTube Player */}
            {currentTrack && currentTrack.type === 'youtube' && isPlaying && (
                <iframe
                    width="1" height="1"
                    src={`https://www.youtube.com/embed/${currentTrack.src}?autoplay=1&loop=1&playlist=${currentTrack.src}&controls=0&showinfo=0`}
                    title="YouTube Audio" frameBorder="0" allow="autoplay"
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />
            )}
        </div>
    );
}
