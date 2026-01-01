import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ subjects, streak, stats, resetProgress }) => {
    return (
        <nav className="sidebar">
            <div className="logo">
                <i className="fa-solid fa-feather-pointed"></i>
                <span>Aspirant<span className="highlight">Pro</span></span>
            </div>

            <div className="nav-links">
                <NavLink
                    to="/"
                    className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                >
                    <i className="fa-solid fa-chart-pie"></i> Dashboard
                </NavLink>
                {Object.keys(subjects).map(sub => (
                    <NavLink
                        key={sub}
                        to={`/subject/${sub}`}
                        className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                    >
                        <i className={getIconForSubject(sub)}></i> {sub}
                    </NavLink>
                ))}
            </div>

            <div style={{ marginTop: 'auto', marginBottom: '1rem', padding: '0 0.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Overall Progress</span>
                    <span style={{ color: 'var(--primary)' }}>{Math.round(stats.totalPercent)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                    <div style={{ width: `${stats.totalPercent}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s ease' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.8rem' }}>
                    <div title="Read" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-book-open" style={{ color: 'var(--secondary)', fontSize: '0.7rem' }}></i>
                        <span>{stats.totalRead}</span>
                    </div>
                    <div title="Revised" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-rotate-right" style={{ color: 'var(--primary)', fontSize: '0.7rem' }}></i>
                        <span>{stats.totalRevised}</span>
                    </div>
                    <div title="Tested" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-clipboard-check" style={{ color: 'var(--success)', fontSize: '0.7rem' }}></i>
                        <span>{stats.totalPracticed}</span>
                    </div>
                    <div title="Total Topics" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-main)', opacity: 0.6 }}>
                        <i className="fa-solid fa-layer-group" style={{ fontSize: '0.7rem' }}></i>
                        <span>{stats.totalSyllabusTopics}</span>
                    </div>
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', opacity: 0.8 }}>
                    {stats.completedItems} / {stats.totalItems} Actions Done
                </div>
            </div>

            <div className="bottom-settings" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                <div className="streak-container" style={{ width: '100%', justifyContent: 'center' }}>
                    <i className="fa-solid fa-fire text-orange"></i>
                    <span id="streak-count">{streak}</span> Day Streak
                </div>
                <button
                    onClick={resetProgress}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: 'var(--danger)',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        width: '100%',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                    className="hover:bg-red-500/20"
                >
                    <i className="fa-solid fa-trash-can"></i> Reset All Progress
                </button>
            </div>
        </nav>
    );
};

function getIconForSubject(sub) {
    if (sub.includes('Culture')) return 'fa-solid fa-gopuram';
    if (sub.includes('Geography')) return 'fa-solid fa-earth-asia';
    if (sub.includes('Polity')) return 'fa-solid fa-scale-balanced';
    if (sub.includes('Economy')) return 'fa-solid fa-indian-rupee-sign';
    if (sub.includes('Environment')) return 'fa-solid fa-tree';
    if (sub.includes('Science')) return 'fa-solid fa-flask';
    return 'fa-solid fa-book';
}

export default Sidebar;
