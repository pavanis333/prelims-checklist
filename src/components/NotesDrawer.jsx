import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Edit3, Save, MessageSquare } from 'lucide-react';

const NotesDrawer = ({ isOpen, onClose, notes, onUpdateNote, onDeleteNote, subjectName }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="drawer-backdrop"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 998
                        }}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '100%',
                            maxWidth: '500px',
                            background: '#1e293b',
                            boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
                            zIndex: 999,
                            display: 'flex',
                            flexDirection: 'column',
                            borderLeft: '1px solid var(--card-border)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.5)' }}>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MessageSquare size={20} className="text-orange" />
                                    {subjectName} Notes
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                    {notes.length} {notes.length === 1 ? 'note' : 'notes'} collected
                                </p>
                            </div>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }} className="hover:bg-white/5">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {notes.length === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '50%' }}>
                                        <Edit3 size={48} opacity={0.5} />
                                    </div>
                                    <p>No notes yet.</p>
                                    <p style={{ fontSize: '0.9rem', maxWidth: '250px' }}>Tap the pen icon next to any topic to start writing your thoughts.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Group by category logic is handled by parent or we just map flat list? Let's map flat list but grouped visually if we want. 
                                        Actually flat reversed (newest first) or grouped by category is nice. 
                                        Let's stick to grouped by Category for structure.
                                    */}
                                    {Object.entries(notes.reduce((acc, note) => {
                                        if (!acc[note.category]) acc[note.category] = [];
                                        acc[note.category].push(note);
                                        return acc;
                                    }, {})).map(([category, categoryNotes]) => (
                                        <div key={category}>
                                            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9 }}>
                                                <span style={{ height: '1px', flex: 1, background: 'var(--primary)', opacity: 0.3 }}></span>
                                                {category}
                                                <span style={{ height: '1px', flex: 1, background: 'var(--primary)', opacity: 0.3 }}></span>
                                            </h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {categoryNotes.map(note => (
                                                    <NoteCard
                                                        key={note.id}
                                                        note={note}
                                                        onUpdate={onUpdateNote}
                                                        onDelete={onDeleteNote}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const NoteCard = ({ note, onUpdate, onDelete }) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: isFocused ? 'rgba(30, 41, 59, 1)' : 'rgba(30, 41, 59, 0.6)',
                border: isFocused ? '1px solid var(--primary)' : '1px solid var(--card-border)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
            }}
        >
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{note.topic}</span>
                <button
                    onClick={() => {
                        if (window.confirm('Delete note?')) onDelete(note.id, '');
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    className="hover:text-red-400"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            <textarea
                value={note.note}
                onChange={(e) => onUpdate(note.id, e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Write something..."
                style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '1rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    resize: 'none',
                    outline: 'none'
                }}
            />
        </motion.div>
    );
};

export default NotesDrawer;
