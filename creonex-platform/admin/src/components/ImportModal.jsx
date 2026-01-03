import React, { useState } from 'react';
import { X, Upload, FileJson, Check, AlertCircle, Info, Copy, ChevronDown, ChevronUp } from 'lucide-react';

const ImportModal = ({ isOpen, onClose, onImport, type }) => {
    const [jsonText, setJsonText] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [error, setError] = useState(null);
    const [importing, setImporting] = useState(false);
    const [showExample, setShowExample] = useState(false);

    if (!isOpen) return null;

    // Example JSON templates based on type
    const exampleTemplates = {
        Services: `[
  {
    "title": "Wedding Customization",
    "description": "Custom wedding outfits with personalized designs, embroidery, and fabric selection to make your special day perfect.",
    "category": "wedding",
    "image": "https://example.com/wedding-dress.jpg",
    "features": ["Custom embroidery", "Premium fabrics", "Perfect fit guarantee"]
  },
  {
    "title": "Birthday Styled Concepts",
    "description": "Unique birthday outfit designs and styling concepts for all ages.",
    "category": "birthday",
    "image": "https://example.com/birthday-outfit.jpg",
    "features": ["Age-appropriate designs", "Theme-based styling", "Accessories included"]
  }
]`,
        Portfolio: `[
  {
    "title": "Elegant Bridal Lehenga",
    "description": "Traditional red bridal lehenga with gold embroidery work.",
    "category": "wedding",
    "image": "https://example.com/bridal-lehenga.jpg",
    "tags": ["bridal", "lehenga", "traditional"]
  },
  {
    "title": "Designer Saree Collection",
    "description": "Contemporary saree design with modern patterns.",
    "category": "catalog",
    "image": "https://example.com/designer-saree.jpg",
    "tags": ["saree", "designer", "contemporary"]
  }
]`
    };

    const currentExample = exampleTemplates[type] || exampleTemplates.Services;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setJsonText(e.target.result);
            setPreviewData(null);
            setError(null);
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const handlePreview = () => {
        if (!jsonText.trim()) {
            setError('Please enter JSON text or upload a file');
            return;
        }
        try {
            const data = JSON.parse(jsonText);
            if (!Array.isArray(data)) throw new Error('Root element must be a JSON Array [ ... ]');
            if (data.length === 0) throw new Error('Array is empty');
            setPreviewData(data);
            setError(null);
        } catch (err) {
            setError('Invalid JSON: ' + err.message);
            setPreviewData(null);
        }
    };

    const handleSave = async () => {
        if (!previewData) return;
        setImporting(true);
        try {
            await onImport(previewData);
            setJsonText('');
            setPreviewData(null);
            onClose();
        } catch (err) {
            setError('Import execution failed: ' + err.message);
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        setJsonText('');
        setPreviewData(null);
        setError(null);
        setShowExample(false);
        onClose();
    };

    const handleCopyExample = () => {
        navigator.clipboard.writeText(currentExample);
    };

    const handleUseExample = () => {
        setJsonText(currentExample);
        setShowExample(false);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                background: 'white',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Bulk Import: {type}</h2>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#666" />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>

                    {!previewData ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                            
                            {/* Upload & Example Buttons Row */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: '#f0f0f0',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}>
                                    <Upload size={18} />
                                    Upload JSON File
                                    <input type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
                                </label>
                                <span style={{ color: '#888', fontSize: '0.9rem' }}>or paste JSON below</span>
                                
                                {/* Show Example Button */}
                                <button
                                    onClick={() => setShowExample(!showExample)}
                                    style={{
                                        marginLeft: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        padding: '0.5rem 0.75rem',
                                        background: '#e8f4ea',
                                        color: '#2e7d32',
                                        border: '1px solid #c8e6c9',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <Info size={16} />
                                    {showExample ? 'Hide' : 'Show'} Example Format
                                    {showExample ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            </div>

                            {/* Example Format Section */}
                            {showExample && (
                                <div style={{
                                    background: '#f8fdf8',
                                    border: '1px solid #c8e6c9',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <span style={{ fontWeight: '600', color: '#2e7d32', fontSize: '0.9rem' }}>
                                            📋 Example JSON Format for {type}
                                        </span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={handleCopyExample}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: '0.375rem 0.625rem',
                                                    background: 'white',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                <Copy size={14} />
                                                Copy
                                            </button>
                                            <button
                                                onClick={handleUseExample}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: '0.375rem 0.625rem',
                                                    background: '#2e7d32',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                Use This Example
                                            </button>
                                        </div>
                                    </div>
                                    <pre style={{
                                        background: '#1e1e1e',
                                        color: '#d4d4d4',
                                        padding: '1rem',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        overflow: 'auto',
                                        maxHeight: '200px',
                                        margin: 0,
                                        fontFamily: 'Monaco, Consolas, monospace'
                                    }}>
                                        {currentExample}
                                    </pre>
                                    <p style={{ 
                                        marginTop: '0.75rem', 
                                        color: '#666', 
                                        fontSize: '0.8rem',
                                        margin: '0.75rem 0 0 0'
                                    }}>
                                        💡 <strong>Tip:</strong> Copy this example, modify the values, and paste it in the text area below.
                                    </p>
                                </div>
                            )}

                            <textarea
                                value={jsonText}
                                onChange={(e) => setJsonText(e.target.value)}
                                placeholder={`Paste your JSON array here...

Example format:
[
  {
    "title": "Your Item Title",
    "description": "Item description...",
    "category": "category-name",
    "image": "https://..."
  }
]

Click "Show Example Format" above for a complete template.`}
                                style={{
                                    width: '100%',
                                    height: showExample ? '150px' : '280px',
                                    padding: '1rem',
                                    fontFamily: 'Monaco, Consolas, monospace',
                                    fontSize: '0.85rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    resize: 'none',
                                    transition: 'height 0.2s ease'
                                }}
                            />

                            {error && (
                                <div style={{
                                    padding: '0.75rem',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handlePreview}
                                style={{
                                    alignSelf: 'flex-start',
                                    padding: '0.75rem 1.5rem',
                                    background: '#8B6F47',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Preview Data
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.5rem'
                            }}>
                                <h3 style={{ fontWeight: '600' }}>Previewing {previewData.length} items</h3>
                                <button
                                    onClick={() => setPreviewData(null)}
                                    style={{
                                        color: '#666',
                                        background: 'none',
                                        border: 'none',
                                        textDecoration: 'underline',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel & Edit JSON
                                </button>
                            </div>

                            <div style={{
                                border: '1px solid #eee',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                maxHeight: '400px',
                                overflowY: 'auto'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ background: '#f9f9f9', position: 'sticky', top: 0 }}>
                                        <tr>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #eee' }}>#</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #eee' }}>Title</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #eee' }}>Category</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #eee' }}>Fields</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '0.75rem', color: '#888' }}>{idx + 1}</td>
                                                <td style={{ padding: '0.75rem', fontWeight: '500' }}>{item.title || 'Untitled'}</td>
                                                <td style={{ padding: '0.75rem', color: '#666' }}>{item.category || '-'}</td>
                                                <td style={{ padding: '0.75rem', color: '#888', fontSize: '0.8rem' }}>
                                                    {Object.keys(item).filter(k => k !== 'title' && k !== 'category').length} more fields
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {error && (
                                <div style={{
                                    padding: '0.75rem',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    borderRadius: '6px'
                                }}>
                                    {error}
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                }}>
                    <button
                        onClick={handleClose}
                        disabled={importing}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: importing ? 'not-allowed' : 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Cancel
                    </button>
                    {previewData && (
                        <button
                            onClick={handleSave}
                            disabled={importing}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#2e7d32',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: importing ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {importing ? 'Importing...' : 'Import Data'}
                            {!importing && <Check size={18} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
