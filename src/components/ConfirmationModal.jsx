import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDangerous = false }) => {
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
                        className="modal-backdrop"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(2, 6, 23, 0.7)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#1e293b',
                                border: '1px solid var(--card-border)',
                                width: '90%',
                                maxWidth: '400px',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={onClose}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: isDangerous ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isDangerous ? 'var(--danger)' : 'var(--primary)'
                                }}>
                                    {isDangerous ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
                                </div>

                                <div>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>{message}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
                                    <button
                                        onClick={onClose}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid var(--card-border)',
                                            background: 'transparent',
                                            color: 'var(--text-main)',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                        className="hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => { onConfirm(); onClose(); }}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: isDangerous ? 'var(--danger)' : 'var(--primary)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            boxShadow: isDangerous ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(139, 92, 246, 0.3)'
                                        }}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
