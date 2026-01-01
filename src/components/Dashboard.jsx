import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ stats, subjects }) => {
    const navigate = useNavigate();

    return (
        <>
            <header className="top-bar">
                <div className="header-text">
                    <h1 id="page-title">Dashboard</h1>
                    <p id="quote-text">"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
                </div>
            </header>

            <div className="content-area">
                <div className="dashboard-grid">
                    {/* Overall Progress */}
                    <div className="card stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div className="progress-circle">
                                <svg className="progress-svg">
                                    <circle className="progress-circle-bg" cx="75" cy="75" r="70"></circle>
                                    <circle
                                        className="progress-circle-fill"
                                        cx="75" cy="75" r="70"
                                        style={{ strokeDashoffset: 440 - (440 * stats.totalPercent) / 100 }}
                                    ></circle>
                                </svg>
                                <div className="progress-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div>{Math.round(stats.totalPercent)}%</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        {stats.completedItems} / {stats.totalItems}
                                    </div>
                                </div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>Overall Progress</div>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div className="stat-pill" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.8rem', borderRadius: '8px' }}>
                                        <i className="fa-solid fa-book-open" style={{ color: 'var(--secondary)' }}></i>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Read</span>
                                            <span style={{ fontWeight: '600' }}>{stats.totalRead}/{stats.totalSyllabusTopics}</span>
                                        </div>
                                    </div>
                                    <div className="stat-pill" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.8rem', borderRadius: '8px' }}>
                                        <i className="fa-solid fa-rotate-right" style={{ color: 'var(--primary)' }}></i>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Revised</span>
                                            <span style={{ fontWeight: '600' }}>{stats.totalRevised}/{stats.totalSyllabusTopics}</span>
                                        </div>
                                    </div>
                                    <div className="stat-pill" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.8rem', borderRadius: '8px' }}>
                                        <i className="fa-solid fa-clipboard-check" style={{ color: 'var(--success)' }}></i>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tested</span>
                                            <span style={{ fontWeight: '600' }}>{stats.totalPracticed}/{stats.totalSyllabusTopics}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subject Cards */}
                    {Object.keys(subjects).map(sub => {
                        const subStat = stats.subjects[sub];
                        return (
                            <div
                                key={sub}
                                className="card stat-card"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/subject/${sub}`)}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
                                    <i className={getIconForSubject(sub)}></i>
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>{sub}</h3>
                                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '1rem' }}>
                                    <div style={{ width: `${subStat.percent}%`, background: 'var(--secondary)', height: '100%' }}></div>
                                </div>
                                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    {Math.round(subStat.percent)}% Completed ({subStat.completed}/{subStat.total})
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
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

export default Dashboard;
