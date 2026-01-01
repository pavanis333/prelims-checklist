import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import NotesDrawer from './NotesDrawer';
import { generateId } from '../utils';

const SubjectChecklist = ({ data, appState, updateTopic, updateNote, triggerConfetti, stats, resetProgress }) => {
    const { subjectName } = useParams();
    const subjectData = data[subjectName];
    const subStats = stats.subjects[subjectName] || { percent: 0, completedChecks: 0, totalChecks: 0, read: 0, revised: 0, practiced: 0, totalTopics: 0 };
    const subPercent = Math.round(subStats.percent);

    // Trigger confetti if 100%
    useEffect(() => {
        if (subPercent === 100 && subStats.totalChecks > 0) {
            triggerConfetti();
        }
    }, [subPercent, subStats.totalChecks, triggerConfetti]);

    const [showNotesModal, setShowNotesModal] = React.useState(false);

    // Collect all notes for this subject
    const subjectNotes = useMemo(() => {
        const notes = [];
        if (!subjectData) return notes;

        Object.keys(subjectData).forEach(category => {
            subjectData[category].forEach(topicObj => {
                const processNote = (id, topicLabel) => {
                    const entry = appState[id];
                    if (entry && !Array.isArray(entry) && entry.note && entry.note.trim()) {
                        notes.push({
                            id,
                            category,
                            topic: topicLabel,
                            note: entry.note
                        });
                    }
                };

                if (topicObj.subtopics && topicObj.subtopics.length > 0) {
                    topicObj.subtopics.forEach(sub => {
                        processNote(generateId(subjectName, category, topicObj.topic, sub), `${topicObj.topic}: ${sub}`);
                    });
                } else {
                    processNote(generateId(subjectName, category, topicObj.topic), topicObj.topic);
                }
            });
        });
        return notes;
    }, [appState, subjectData, subjectName]);

    if (!subjectData) return <div className="content-area">Subject Not Found</div>;

    return (
        <>
            <header className="top-bar">
                <div className="header-text">
                    <h1 id="page-title">{subjectName}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{subPercent}%</div>

                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <div className="stat-pill" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <i className="fa-solid fa-book-open" style={{ color: 'var(--secondary)' }}></i>
                                <span>{subStats.read}/{subStats.totalTopics}</span>
                            </div>
                            <div className="stat-pill" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <i className="fa-solid fa-rotate-right" style={{ color: 'var(--primary)' }}></i>
                                <span>{subStats.revised}/{subStats.totalTopics}</span>
                            </div>
                            <div className="stat-pill" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <i className="fa-solid fa-clipboard-check" style={{ color: 'var(--success)' }}></i>
                                <span>{subStats.practiced}/{subStats.totalTopics}</span>
                            </div>
                        </div>

                        {/* Review Notes Button */}
                        <button
                            onClick={() => setShowNotesModal(true)}
                            style={{
                                marginLeft: '1rem',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid var(--card-border)',
                                color: 'var(--text-main)',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                                transition: 'background 0.2s'
                            }}
                            className="hover:bg-white/10"
                        >
                            <i className="fa-solid fa-note-sticky text-orange"></i>
                            Notes ({subjectNotes.length})
                        </button>

                        {/* Reset Subject Button */}
                        <button
                            onClick={() => resetProgress(subjectName)}
                            style={{
                                marginLeft: '0.5rem',
                                background: 'transparent',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: 'var(--danger)',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s'
                            }}
                            className="hover:bg-red-500/10"
                            title="Reset Subject Progress"
                        >
                            <i className="fa-solid fa-rotate-left"></i>
                        </button>
                    </div>
                </div>

                {/* Circular Progress in Header */}
                <div className="progress-circle" style={{ width: '80px', height: '80px' }}>
                    <svg className="progress-svg" style={{ width: '80px', height: '80px' }} viewBox="0 0 150 150">
                        <circle className="progress-circle-bg" cx="75" cy="75" r="70" style={{ strokeWidth: 12 }}></circle>
                        <circle
                            className="progress-circle-fill"
                            cx="75" cy="75" r="70"
                            style={{
                                strokeDashoffset: 440 - (440 * subPercent) / 100,
                                strokeWidth: 12
                            }}
                        ></circle>
                    </svg>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '1.5rem',
                        color: 'var(--secondary)'
                    }}>
                        <i className={getIconForSubject(subjectName)}></i>
                    </div>
                </div>
            </header>

            <div className="content-area">
                <div className="topic-container">
                    <div style={{ marginTop: '2rem' }}></div>

                    {Object.keys(subjectData).map(category => (
                        <div key={category} className="category-group">
                            <div className="category-title">{category}</div>
                            {subjectData[category].map((topicObj, idx) => (
                                <div key={idx} className="topic-group-wrapper">
                                    {topicObj.subtopics && topicObj.subtopics.length > 0 ? (
                                        <div className="subtopic-group" style={{ marginBottom: '1.5rem' }}>
                                            <div style={{
                                                padding: '0.5rem 1rem',
                                                color: 'var(--secondary)',
                                                fontWeight: '600',
                                                borderLeft: '3px solid var(--secondary)',
                                                marginLeft: '0.5rem',
                                                marginBottom: '0.5rem',
                                                background: 'rgba(255,255,255,0.03)'
                                            }}>
                                                {topicObj.topic}
                                            </div>
                                            {topicObj.subtopics.map(sub => (
                                                <TopicItem
                                                    key={generateId(subjectName, category, topicObj.topic, sub)}
                                                    id={generateId(subjectName, category, topicObj.topic, sub)}
                                                    topic={sub}
                                                    appState={appState}
                                                    updateTopic={updateTopic}
                                                    updateNote={updateNote}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <TopicItem
                                            key={generateId(subjectName, category, topicObj.topic)}
                                            id={generateId(subjectName, category, topicObj.topic)}
                                            topic={topicObj.topic}
                                            appState={appState}
                                            updateTopic={updateTopic}
                                            updateNote={updateNote}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sliding Notes Drawer */}
            <NotesDrawer
                isOpen={showNotesModal}
                onClose={() => setShowNotesModal(false)}
                notes={subjectNotes}
                subjectName={subjectName}
                onUpdateNote={updateNote}
                onDeleteNote={(id) => updateNote(id, '')}
            />
        </>
    );
};

const TopicItem = ({ id, topic, appState, updateTopic, updateNote }) => {
    const rawEntry = appState[id];
    let note = '';
    let rawStatus = [false, false, false];

    if (rawEntry) {
        if (Array.isArray(rawEntry)) {
            rawStatus = rawEntry;
        } else {
            rawStatus = rawEntry.items;
            note = rawEntry.note || '';
        }
    }

    const status = rawStatus.map(item => {
        if (typeof item === 'boolean') return { val: item, time: null };
        if (item && typeof item === 'object') return item;
        return { val: false, time: null };
    });

    const [isNoteOpen, setIsNoteOpen] = React.useState(Boolean(note));

    return (
        <div className="topic-item" style={{ flexDirection: 'column', alignItems: 'stretch', padding: 0 }}>
            <div
                onClick={() => setIsNoteOpen(!isNoteOpen)}
                className="hover:bg-white/5"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', cursor: 'pointer', userSelect: 'none' }}>
                <div className="topic-name">{topic}</div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="checkbox-group" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            label="Read"
                            cssClass="cb-read"
                            checked={status[0].val}
                            timestamp={status[0].time}
                            onChange={(val) => updateTopic(id, 0, val)}
                        />
                        <Checkbox
                            label="Revise"
                            cssClass="cb-revised"
                            checked={status[1].val}
                            timestamp={status[1].time}
                            onChange={(val) => updateTopic(id, 1, val)}
                        />
                        <Checkbox
                            label="Test"
                            cssClass="cb-practiced"
                            checked={status[2].val}
                            timestamp={status[2].time}
                            onChange={(val) => updateTopic(id, 2, val)}
                        />
                    </div>

                    {/* Note Toggle Indicator */}
                    <div
                        style={{
                            color: isNoteOpen || note ? 'var(--accent)' : 'var(--text-muted)',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '30px',
                            height: '30px',
                            transition: 'all 0.2s',
                            opacity: isNoteOpen || note ? 1 : 0.5
                        }}
                    >
                        <i className={`fa-solid ${isNoteOpen || note ? 'fa-pen-to-square' : 'fa-pen'}`}></i>
                    </div>
                </div>
            </div>

            {/* Note Pane */}
            {isNoteOpen && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem', animation: 'fadeIn 0.2s ease' }}>
                    <textarea
                        autoFocus
                        value={note}
                        onChange={(e) => updateNote(id, e.target.value)}
                        placeholder="Add your notes here..."
                        style={{
                            width: '100%',
                            minHeight: '80px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '8px',
                            padding: '0.8rem',
                            color: 'var(--text-main)',
                            fontFamily: 'var(--font-body)',
                            resize: 'vertical',
                            fontSize: '1rem',
                            lineHeight: '1.5'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

const Checkbox = ({ label, cssClass, checked, onChange, timestamp }) => (
    <label className={`custom-checkbox ${cssClass}`} style={{ minWidth: '90px' }}>
        <input
            type="checkbox"
            checked={Boolean(checked)}
            onChange={(e) => onChange(e.target.checked)}
        />
        <div className="checkbox-box"></div>
        <div className="checkbox-label">{label}</div>
        <div style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            marginTop: '4px',
            textAlign: 'center',
            lineHeight: '1.2',
            whiteSpace: 'nowrap',
            minHeight: '0.8rem'
        }}>{timestamp || '\u00A0'}</div>
    </label>
);

function getIconForSubject(sub) {
    if (sub.includes('Culture')) return 'fa-solid fa-gopuram';
    if (sub.includes('Geography')) return 'fa-solid fa-earth-asia';
    if (sub.includes('Polity')) return 'fa-solid fa-scale-balanced';
    if (sub.includes('Economy')) return 'fa-solid fa-indian-rupee-sign';
    if (sub.includes('Environment')) return 'fa-solid fa-tree';
    if (sub.includes('Science')) return 'fa-solid fa-flask';
    return 'fa-solid fa-book';
}

export default SubjectChecklist;
