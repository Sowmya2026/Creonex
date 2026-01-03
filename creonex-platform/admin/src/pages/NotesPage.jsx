import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
    Plus,
    Search,
    CheckCircle,
    Clock,
    Trash2,
    Edit2,
    Save,
    X,
    StickyNote,
    Calendar,
    Send
} from 'lucide-react';

const NotesPage = () => {
    const { showError } = useToast();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [editContent, setEditContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchNotes = async () => {
        try {
            const res = await api.get('/notes');
            setNotes(res.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch notes", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setSubmitting(true);
        try {
            await api.post('/notes', {
                title: newNote.trim().substring(0, 50), // Auto-generate title from first 50 chars
                content: newNote.trim(),
                priority: 'normal'
            });
            setNewNote('');
            await fetchNotes();
        } catch (error) {
            console.error('Failed to add note:', error);
            showError('Failed to add note');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (note) => {
        setEditingId(note.id);
        setEditContent(note.content || note.title);
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;

        try {
            await api.put(`/notes/${editingId}`, {
                title: editContent.trim().substring(0, 50),
                content: editContent.trim()
            });
            setEditingId(null);
            setEditContent('');
            await fetchNotes();
        } catch (error) {
            console.error('Failed to update note:', error);
            showError('Failed to update note');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/notes/${id}`, { status: newStatus });
            await fetchNotes();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDeleteClick = (id) => {
        setShowDeleteConfirm(id);
    };

    const handleDeleteConfirm = async () => {
        if (!showDeleteConfirm) return;
        try {
            await api.delete(`/notes/${showDeleteConfirm}`);
            setShowDeleteConfirm(null);
            await fetchNotes();
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch =
            (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'pending' && note.status !== 'completed') ||
            (statusFilter === 'completed' && note.status === 'completed');

        return matchesSearch && matchesStatus;
    });

    const formatDate = (timestamp) => {
        try {
            if (!timestamp) return '';
            let date;
            if (timestamp._seconds || timestamp.seconds) {
                const seconds = timestamp._seconds || timestamp.seconds;
                date = new Date(seconds * 1000);
            } else {
                date = new Date(timestamp);
            }
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    const pendingCount = notes.filter(n => n.status !== 'completed').length;
    const completedCount = notes.filter(n => n.status === 'completed').length;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">My Notes</h1>
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Quick Add Note */}
            <form onSubmit={handleAddNote} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
            }}>
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write a quick note... (Press Enter to add)"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddNote(e);
                        }
                    }}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        resize: 'none',
                        minHeight: '50px',
                        maxHeight: '120px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8B6F47'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                    type="submit"
                    disabled={!newNote.trim() || submitting}
                    style={{
                        padding: '0.75rem 1.25rem',
                        background: newNote.trim() ? '#8B6F47' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: newNote.trim() ? 'pointer' : 'not-allowed',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'background 0.2s'
                    }}
                >
                    <Send size={18} />
                    Add
                </button>
            </form>

            {/* Status Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                background: 'white',
                padding: '0.5rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <button
                    onClick={() => setStatusFilter('all')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: statusFilter === 'all' ? '#8B6F47' : 'transparent',
                        color: statusFilter === 'all' ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                    }}
                >
                    All ({notes.length})
                </button>
                <button
                    onClick={() => setStatusFilter('pending')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: statusFilter === 'pending' ? '#f59e0b' : 'transparent',
                        color: statusFilter === 'pending' ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}
                >
                    <Clock size={14} /> Pending ({pendingCount})
                </button>
                <button
                    onClick={() => setStatusFilter('completed')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: statusFilter === 'completed' ? '#059669' : 'transparent',
                        color: statusFilter === 'completed' ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}
                >
                    <CheckCircle size={14} /> Done ({completedCount})
                </button>
            </div>

            {/* Notes List */}
            {loading ? (
                <div className="loading-state">Loading notes...</div>
            ) : filteredNotes.length === 0 ? (
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    color: '#666'
                }}>
                    <StickyNote size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No notes yet. Add your first note above!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredNotes.map(note => (
                        <div
                            key={note.id}
                            style={{
                                background: note.status === 'completed' ? '#f9fafb' : 'white',
                                borderRadius: '10px',
                                padding: '1rem 1.25rem',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                borderLeft: `4px solid ${note.status === 'completed' ? '#059669' : '#8B6F47'}`,
                                opacity: note.status === 'completed' ? 0.75 : 1
                            }}
                        >
                            {editingId === note.id ? (
                                // Edit mode
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        autoFocus
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: '2px solid #8B6F47',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            resize: 'vertical',
                                            minHeight: '60px'
                                        }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <button
                                            onClick={handleSaveEdit}
                                            style={{
                                                padding: '0.5rem',
                                                background: '#059669',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Save size={16} />
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            style={{
                                                padding: '0.5rem',
                                                background: '#f5f5f5',
                                                color: '#666',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View mode
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            fontSize: '0.95rem',
                                            lineHeight: '1.5',
                                            color: note.status === 'completed' ? '#666' : '#333',
                                            textDecoration: note.status === 'completed' ? 'line-through' : 'none',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word'
                                        }}>
                                            {note.content || note.title}
                                        </p>
                                        {formatDate(note.createdAt) && (
                                            <span style={{
                                                fontSize: '0.7rem',
                                                color: '#999',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                marginTop: '0.5rem'
                                            }}>
                                                <Calendar size={10} />
                                                {formatDate(note.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                                        <button
                                            onClick={() => handleStatusChange(note.id, note.status === 'completed' ? 'pending' : 'completed')}
                                            style={{
                                                padding: '0.4rem',
                                                background: note.status === 'completed' ? '#dcfce7' : '#fef3c7',
                                                color: note.status === 'completed' ? '#059669' : '#d97706',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                            title={note.status === 'completed' ? 'Mark as pending' : 'Mark as done'}
                                        >
                                            {note.status === 'completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(note)}
                                            style={{
                                                padding: '0.4rem',
                                                background: '#f5f5f5',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                color: '#8B6F47'
                                            }}
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(note.id)}
                                            style={{
                                                padding: '0.4rem',
                                                background: '#fee2e2',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                color: '#dc2626'
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        maxWidth: '350px',
                        width: '90%',
                        textAlign: 'center'
                    }}>
                        <Trash2 size={40} style={{ color: '#dc2626', marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Delete this note?</h3>
                        <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
                            This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    background: '#f5f5f5',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    background: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesPage;
