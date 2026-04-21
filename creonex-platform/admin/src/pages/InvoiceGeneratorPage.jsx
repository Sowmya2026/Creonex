
import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Eye, Download, FileText, Code, X, Check, Copy, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import api from '../services/api';
import '../styles/invoice.css';

const InvoiceGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [showJsonModal, setShowJsonModal] = useState(false);
    const [showSampleModal, setShowSampleModal] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [editingInvoiceId, setEditingInvoiceId] = useState(null);

    // History & Stats State
    const [history, setHistory] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/invoices');
            const data = res.data || [];
            if (Array.isArray(data)) {
                setHistory(data);
            }
        } catch (error) {
            console.error('Failed to fetch invoice history:', error);
        }
    };

    // Calculate Salary Period (Dec 21 - Jan 20 counts as Jan Salary)
    const getSalaryPeriod = (date) => {
        const refDate = new Date(date);

        // If day > 20, it belongs to next month's salary cycle
        let targetMonthIndex = refDate.getMonth();
        let targetYear = refDate.getFullYear();

        if (refDate.getDate() > 20) {
            targetMonthIndex++;
            if (targetMonthIndex > 11) {
                targetMonthIndex = 0;
                targetYear++;
            }
        }

        // Cycle End: 20th of target month
        const endDate = new Date(targetYear, targetMonthIndex, 20);
        endDate.setHours(23, 59, 59, 999);

        // Cycle Start: 21st of previous month
        const startDate = new Date(targetYear, targetMonthIndex - 1, 21);
        startDate.setHours(0, 0, 0, 0);

        const monthName = new Date(targetYear, targetMonthIndex, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

        return { startDate, endDate, label: monthName };
    };

    const period = getSalaryPeriod(selectedDate);

    const filteredHistory = history.filter(inv => {
        const d = new Date(inv.date || inv.createdAt);
        return d >= period.startDate && d <= period.endDate;
    });

    const totalIncome = filteredHistory.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const handlePrevMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() - 1);
        // Ensure we stay in a safe day range (e.g. 15th) to avoid edge cases when jumping months
        newDate.setDate(15);
        setSelectedDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + 1);
        newDate.setDate(15);
        setSelectedDate(newDate);
    };

    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: 'AUTO-GENERATED', // Backend handles this
        date: new Date().toISOString().split('T')[0],
        billedTo: {
            name: '',
            address: '',
            gstin: '',
            pan: ''
        },
        items: [
            { description: '', quantity: '', rate: 0, amount: 0 }
        ],
        totalAmount: 0
    });

    const [previewMode, setPreviewMode] = useState(false);

    // Default "From" and "Payment" details
    const fromDetails = {
        name: 'Creonex.viz',
        subtitle: 'AI Visuals & Creative Content Studio',
        email: 'creonex.viz@gmail.com',
        phone: '8555074387'
    };

    const paymentDetails = {
        accountName: 'Ms. Beemer Sowmya',
        bankName: 'State Bank of India',
        accountNumber: '62148655051',
        ifsc: 'SBIN0020295'
    };

    const sampleJSON = JSON.stringify({
        invoiceNumber: 'SAMPLE-001',
        date: new Date().toISOString().split('T')[0],
        billedTo: {
            name: 'PANCHAJANYA TEXTILES',
            address: '33, Sindhi Colony, Prenderghast Road\nSecunderabad, Hyderabad\nTelangana – 500003\nIndia',
            gstin: '36AACFP2688K1ZT',
            pan: 'AACFP2688K'
        },
        items: [
            { description: 'AI-generated comforter visuals (4 images + 1 video per comforter)', quantity: '13 comforters', rate: 320, amount: 4160 }
        ],
        totalAmount: 4160
    }, null, 2);

    // Calculate item amount and total
    useEffect(() => {
        // Recalculate amounts purely for display/state consistency if needed
    }, [invoiceData.items]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...invoiceData.items];
        newItems[index][field] = value;

        // Auto-calc amount if rate or quantity changes
        if (field === 'rate' || field === 'quantity') {
            const qtyStr = newItems[index].quantity.toString();
            // Try to extract first number from string, e.g. "13 comforters" -> 13
            const qtyMatch = qtyStr.match(/(\d+(\.\d+)?)/);
            const qty = qtyMatch ? parseFloat(qtyMatch[0]) : 0;
            const rate = parseFloat(newItems[index].rate) || 0;
            newItems[index].amount = qty * rate;
        }

        setInvoiceData({ ...invoiceData, items: newItems });
        calculateTotal(newItems);
    };

    const calculateTotal = (items) => {
        const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        setInvoiceData(prev => ({ ...prev, items, totalAmount: total }));
    };

    const addItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [...invoiceData.items, { description: '', quantity: '', rate: 0, amount: 0 }]
        });
    };

    const removeItem = (index) => {
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({ ...invoiceData, items: newItems });
        calculateTotal(newItems);
    };

    const handleJsonImport = () => {
        setJsonError('');
        try {
            if (!jsonInput.trim()) return;

            const json = JSON.parse(jsonInput);

            // Validate basic structure if needed, for now just merge
            // We consciously ignore the date from JSON to ensure the new invoice 
            // is generated with the current date ("auto generated on that particular date")
            setInvoiceData(prev => ({
                ...prev,
                ...json,
                date: new Date().toISOString().split('T')[0]
            }));

            setShowJsonModal(false);
            setJsonInput('');
            setPreviewMode(true); // Switch to preview immediately as requested
        } catch (err) {
            setJsonError('Invalid JSON format. Please check your syntax.');
            console.error(err);
        }
    };

    const handleCopySample = async () => {
        try {
            await navigator.clipboard.writeText(sampleJSON);
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleCreateInvoice = async () => {
        // Validation
        if (!invoiceData.billedTo.name || !invoiceData.billedTo.address) {
            alert('Please fill in client Name and Address.');
            return;
        }
        if (invoiceData.items.length === 0) {
            alert('Please add at least one item.');
            return;
        }
        // Ensure numbers
        const sanitizedData = {
            ...invoiceData,
            totalAmount: parseFloat(invoiceData.totalAmount),
            items: invoiceData.items.map(item => ({
                ...item,
                rate: parseFloat(item.rate),
                amount: parseFloat(item.amount)
            }))
        };

        setLoading(true);
        try {
            if (editingInvoiceId) {
                // Update existing
                await api.put(`/invoices/${editingInvoiceId}`, sanitizedData);
                alert(`Invoice Updated Successfully`);
                fetchHistory(); // Refresh history
                await handleDownloadPDF(editingInvoiceId, invoiceData.invoiceNumber);
                setEditingInvoiceId(null);
            } else {
                // Create new
                const res = await api.post('/invoices', sanitizedData);
                alert(`Invoice Created! Number: ${res.data.invoiceNumber}`);
                fetchHistory(); // Refresh history
                await handleDownloadPDF(res.data._id, res.data.invoiceNumber);
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Failed to process invoice';
            const detail = error.response?.data?.error || '';
            alert(`${msg}\n${detail}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditInvoice = (inv) => {
        setEditingInvoiceId(inv._id);
        setInvoiceData({
            invoiceNumber: inv.invoiceNumber,
            date: inv.date ? new Date(inv.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            billedTo: {
                name: inv.billedTo.name || '',
                address: inv.billedTo.address || '',
                gstin: inv.billedTo.gstin || '',
                pan: inv.billedTo.pan || ''
            },
            items: inv.items.map(i => ({ ...i })), // Deep copy items
            totalAmount: parseFloat(inv.totalAmount) || 0
        });
        setPreviewMode(false); // Make sure we're in edit mode
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
    };

    const handleDeleteInvoice = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await api.delete(`/invoices/${id}`);
                // Refresh history by refetching
                fetchHistory();
            } catch (error) {
                console.error('Failed to delete invoice', error);
                alert('Failed to delete invoice');
            }
        }
    };

    const handleDownloadPDF = async (id, number) => {
        try {
            const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
            
            // Create Blob with specific type
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${number}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('PDF Download failed', error);
            alert('Could not download PDF');
        }
    };

    // --- Preview Component ---
    const Preview = () => (
        <div className="invoice-preview" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: 'white', fontFamily: 'sans-serif' }}>
            {/* 1. Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0, letterSpacing: '-1px' }}>INVOICE</h1>
                    <div style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 'bold', color: '#6b7280', width: '6rem' }}>Invoice No:</span>
                            <span style={{ fontWeight: '600', color: '#111827' }}>{invoiceData.invoiceNumber}</span>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <span style={{ fontWeight: 'bold', color: '#6b7280', width: '6rem' }}>Date:</span>
                            <span style={{ color: '#111827' }}>
                                {new Date(invoiceData.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Logo Placeholder */}
                <div style={{ width: '4rem', height: '4rem', background: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
                    LOGO
                </div>
            </div>

            {/* 2. Addresses Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
                <div>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>From:</h3>
                    <div style={{ color: '#111827' }}>
                        <p style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>{fromDetails.name}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', marginTop: 0 }}>{fromDetails.subtitle}</p>
                        <p style={{ fontSize: '0.875rem', margin: 0 }}>Email: {fromDetails.email}</p>
                        <p style={{ fontSize: '0.875rem', margin: 0 }}>Phone: {fromDetails.phone}</p>
                    </div>
                </div>
                <div>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billed To:</h3>
                    <div style={{ color: '#111827' }}>
                        <p style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>{invoiceData.billedTo.name || 'Client Name'}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', whiteSpace: 'pre-line', marginBottom: '0.75rem', marginTop: 0 }}>
                            {invoiceData.billedTo.address || 'Address'}
                        </p>
                        {invoiceData.billedTo.gstin && (
                            <p style={{ fontSize: '0.875rem', margin: 0 }}><span style={{ fontWeight: 'bold' }}>GSTIN:</span> {invoiceData.billedTo.gstin}</p>
                        )}
                        {invoiceData.billedTo.pan && (
                            <p style={{ fontSize: '0.875rem', margin: 0 }}><span style={{ fontWeight: 'bold' }}>PAN:</span> {invoiceData.billedTo.pan}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Table */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '0.5rem 0', marginBottom: '1rem' }}>
                    <div style={{ width: '50%', fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>Description</div>
                    <div style={{ width: '15%', fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', textAlign: 'left' }}>Quantity</div>
                    <div style={{ width: '15%', fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Rate (₹)</div>
                    <div style={{ width: '20%', fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Amount (₹)</div>
                </div>
                <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '2rem' }}>
                    {invoiceData.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', fontSize: '0.875rem', color: '#111827', marginBottom: '1rem' }}>
                            <div style={{ width: '50%', paddingRight: '1rem' }}>{item.description}</div>
                            <div style={{ width: '15%', textAlign: 'left' }}>{item.quantity}</div>
                            <div style={{ width: '15%', textAlign: 'right' }}>{parseFloat(item.rate).toLocaleString('en-IN')}</div>
                            <div style={{ width: '20%', textAlign: 'right', fontWeight: 'bold' }}>{parseFloat(item.amount).toLocaleString('en-IN')}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem', marginTop: 0 }}>Total Amount:</p>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                        ₹{invoiceData.totalAmount.toLocaleString('en-IN')} /-
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', marginTop: '0.25rem' }}>(Amount in words will be on PDF)</p>
                </div>
            </div>

            {/* 5. Footer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                <div>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Details</h3>
                    <div style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>
                        <p style={{ margin: 0 }}><span style={{ fontWeight: 'bold' }}>Account Name:</span> {paymentDetails.accountName}</p>
                        <p style={{ margin: 0 }}><span style={{ fontWeight: 'bold' }}>Bank Name:</span> {paymentDetails.bankName}</p>
                        <p style={{ margin: 0 }}><span style={{ fontWeight: 'bold' }}>Account Number:</span> {paymentDetails.accountNumber}</p>
                        <p style={{ margin: 0 }}><span style={{ fontWeight: 'bold' }}>IFSC Code:</span> {paymentDetails.ifsc}</p>
                    </div>
                </div>
                <div>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</h3>
                    <ul style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5', paddingLeft: '1rem', margin: 0 }}>
                        <li>Services include AI-generated images and video visuals for digital presentation only.</li>
                        <li>No physical products or printing involved.</li>
                        <li>This invoice is generated for creative and digital services rendered.</li>
                    </ul>
                </div>
            </div>
            <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.75rem', color: '#d1d5db' }}>Generated by Creonex Platform</div>
        </div>
    );

    return (
        <div className="invoice-page page-padding">
            <div className="invoice-header">
                <div className="header-title">
                    <h1>Invoice Generator</h1>
                    <p>Create professional invoices instantly</p>
                    {editingInvoiceId && (
                        <span style={{ display: 'inline-block', marginTop: '0.5rem', background: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                            Editing Mode: {invoiceData.invoiceNumber}
                            <button onClick={() => {
                                setEditingInvoiceId(null);
                                setInvoiceData({  // Reset form
                                    invoiceNumber: 'AUTO-GENERATED', 
                                    date: new Date().toISOString().split('T')[0],
                                    billedTo: { name: '', address: '', gstin: '', pan: '' },
                                    items: [{ description: '', quantity: '', rate: 0, amount: 0 }],
                                    totalAmount: 0
                                });
                            }} style={{ background: 'none', border: 'none', color: '#4338ca', marginLeft: '0.5rem', cursor: 'pointer', padding: 0 }}>
                                <X size={14} style={{ display: 'inline' }} />
                            </button>
                        </span>
                    )}
                </div>
                <div className="header-actions">
                    <button onClick={() => setShowSampleModal(true)} className="btn-text">
                        Sample JSON
                    </button>
                    <button
                        onClick={() => setShowJsonModal(true)}
                        className="btn-secondary"
                    >
                        <Code size={18} />
                        <span>Paste JSON</span>
                    </button>
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`btn-secondary ${previewMode ? 'active' : ''}`}
                        title={previewMode ? "Edit Data" : "Preview PDF"}
                    >
                        {previewMode ? <><FileText size={18} /> Edit Data</> : <><Eye size={18} /> Preview PDF</>}
                    </button>
                    {previewMode && (
                        <button onClick={handleCreateInvoice} disabled={loading} className="btn-primary">
                            <Download size={18} />
                            {loading ? (editingInvoiceId ? 'Updating...' : 'Generating...') : (editingInvoiceId ? 'Update & Download' : 'Save & Download')}
                        </button>
                    )}
                </div>
            </div>

            {/* Sample JSON Modal */}
            {showSampleModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Sample JSON Format</h3>
                            <button onClick={() => setShowSampleModal(false)} className="btn-close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-instruction">Copy this structure to prepare your invoice data.</p>
                            <textarea
                                className="json-textarea"
                                value={sampleJSON}
                                readOnly
                                style={{ cursor: 'default', backgroundColor: '#f4f4f5' }}
                            />
                        </div>
                        <div className="modal-footer">
                            <span style={{ marginRight: 'auto', color: '#16a34a', fontSize: '0.875rem', fontWeight: 500 }}>
                                {copySuccess}
                            </span>
                            <button onClick={handleCopySample} className="btn-secondary">
                                {copySuccess === 'Copied!' ? <Check size={18} /> : <Copy size={18} />}
                                <span>{copySuccess === 'Copied!' ? 'Copied' : 'Copy Code'}</span>
                            </button>
                            <button onClick={() => setShowSampleModal(false)} className="btn-primary">Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* JSON Import Modal */}
            {showJsonModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Import from JSON</h3>
                            <button onClick={() => setShowJsonModal(false)} className="btn-close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-instruction">Paste your invoice JSON code below to auto-fill the details.</p>
                            <textarea
                                className="json-textarea"
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder='{ "billedTo": { ... }, "items": [ ... ] }'
                            />
                            {jsonError && <p className="error-message">{jsonError}</p>}
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowJsonModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleJsonImport} className="btn-primary">
                                <Check size={18} />
                                <span>Load Data</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewMode ? (
                <div className="animate-fade-in" style={{ overflowX: 'auto' }}>
                    <Preview />
                </div>
            ) : (
                <div className="invoice-form-container">
                    {/* Billed To Section */}
                    <div className="form-section">
                        <h2 className="section-title">Client Details (Billed To)</h2>
                        <div className="grid-2">
                            <div className="form-column">
                                <div className="form-group">
                                    <label className="form-label">Client Name</label>
                                    <input
                                        type="text"
                                        value={invoiceData.billedTo.name}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, billedTo: { ...invoiceData.billedTo, name: e.target.value } })}
                                        className="form-input"
                                        placeholder="e.g. PANCHAJANYA TEXTILES"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        value={invoiceData.billedTo.address}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, billedTo: { ...invoiceData.billedTo, address: e.target.value } })}
                                        className="form-textarea"
                                        placeholder="Street, City, State, Zip, Country"
                                    />
                                </div>
                            </div>
                            <div className="form-column">
                                <div className="form-group">
                                    <label className="form-label">GSTIN (Optional)</label>
                                    <input
                                        type="text"
                                        value={invoiceData.billedTo.gstin}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, billedTo: { ...invoiceData.billedTo, gstin: e.target.value } })}
                                        className="form-input"
                                        placeholder="e.g. 36AACFP2688K1ZT"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">PAN (Optional)</label>
                                    <input
                                        type="text"
                                        value={invoiceData.billedTo.pan}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, billedTo: { ...invoiceData.billedTo, pan: e.target.value } })}
                                        className="form-input"
                                        placeholder="e.g. AACFP2688K"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        value={invoiceData.date}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="form-section">
                        <h2 className="section-title">Items Services</h2>
                        <div className="items-list">
                            {invoiceData.items.map((item, index) => (
                                <div key={index} className="item-row">
                                    <div className="item-desc">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="item-qty">
                                        <input
                                            type="text"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="item-rate">
                                        <input
                                            type="number"
                                            placeholder="Rate"
                                            value={item.rate}
                                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                            className="form-input"
                                            style={{ textAlign: 'right' }}
                                        />
                                    </div>
                                    <div className="item-amount">
                                        <div className="amount-display">
                                            ₹{item.amount.toLocaleString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="btn-remove"
                                        title="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="items-footer">
                            <button onClick={addItem} className="btn-add">
                                <Plus size={18} />
                                <span>Add Item</span>
                            </button>
                            <div className="total-display">
                                Total: <span className="total-amount">₹{invoiceData.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Invoice History Section --- */}
            {
                !previewMode && (
                    <div className="history-section" style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={24} /> Invoice History & Income
                        </h2>

                        {/* Controls & Summary */}
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            marginTop: '1.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <button onClick={handlePrevMonth} className="btn-secondary" style={{ padding: '0.5rem' }}>
                                    <ChevronLeft size={20} />
                                </button>

                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                                        {period.label} Salary
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        {period.startDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - {period.endDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>

                                <button onClick={handleNextMonth} className="btn-secondary" style={{ padding: '0.5rem' }}>
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <div style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '0.9rem', color: '#166534', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Salary (Income)</span>
                                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#16a34a', marginTop: '0.5rem' }}>
                                    ₹{totalIncome.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>

                        {/* Filtered History List */}
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {filteredHistory.length === 0 ? (
                                <div style={{
                                    background: 'white',
                                    padding: '3rem',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <p>No invoices found for this period.</p>
                                </div>
                            ) : (
                                filteredHistory.map(inv => (
                                    <div
                                        key={inv._id}
                                        className="list-item-card"
                                        style={{
                                            borderLeft: '4px solid var(--primary-color)'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                                                        {inv.billedTo?.name || 'Unknown Client'}
                                                    </h3>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                        {inv.invoiceNumber}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                                                        ₹{parseFloat(inv.totalAmount)?.toLocaleString('en-IN')}
                                                    </span>
                                                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                        <FileText size={12} />
                                                        {new Date(inv.date || inv.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="list-item-actions">
                                            <button
                                                onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: '#e0f2fe',
                                                    color: '#0284c7',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}
                                                title="Download PDF"
                                            >
                                                <Download size={18} />
                                                <span className="mobile-only-text" style={{ fontSize: '0.85rem' }}>Download</span>
                                            </button>
                                            <button
                                                onClick={() => handleEditInvoice(inv)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: '#fef3c7',
                                                    color: '#d97706',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}
                                                title="Edit Invoice"
                                            >
                                                <Edit2 size={18} />
                                                <span className="mobile-only-text" style={{ fontSize: '0.85rem' }}>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteInvoice(inv._id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}
                                                title="Delete Invoice"
                                            >
                                                <Trash2 size={18} />
                                                <span className="mobile-only-text" style={{ fontSize: '0.85rem' }}>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default InvoiceGenerator;
