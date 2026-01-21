
import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Download, FileText, Code, X, Check, Copy } from 'lucide-react';
import api from '../services/api';
import '../styles/invoice.css';

const InvoiceGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [showJsonModal, setShowJsonModal] = useState(false);
    const [showSampleModal, setShowSampleModal] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

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
            const res = await api.post('/invoices', sanitizedData);
            alert(`Invoice Created! Number: ${res.data.invoiceNumber}`);
            await handleDownloadPDF(res.data._id, res.data.invoiceNumber);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Failed to create invoice';
            const detail = error.response?.data?.error || '';
            alert(`${msg}\n${detail}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (id, number) => {
        try {
            const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('PDF Download failed', error);
            alert('Could not download PDF');
        }
    };

    // --- Preview Component ---
    const Preview = () => (
        <div className="preview-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: 'white' }}>
            {/* 1. Header Section */}
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 tracking-tight">INVOICE</h1>

                    <div className="mt-8 text-sm">
                        <div className="flex mb-1">
                            <span className="font-bold text-gray-500 w-24">Invoice No:</span>
                            <span className="font-semibold text-gray-900">{invoiceData.invoiceNumber}</span>
                        </div>
                        <div className="flex">
                            <span className="font-bold text-gray-500 w-24">Date:</span>
                            <span className="text-gray-900">
                                {new Date(invoiceData.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Logo Placeholder */}
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                    LOGO
                </div>
            </div>

            {/* 2. Addresses Section */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                {/* FROM */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">From:</h3>
                    <div className="text-gray-900">
                        <p className="text-lg font-bold text-gray-800">{fromDetails.name}</p>
                        <p className="text-sm text-gray-500 mb-2">{fromDetails.subtitle}</p>
                        <p className="text-sm">Email: {fromDetails.email}</p>
                        <p className="text-sm">Phone: {fromDetails.phone}</p>
                    </div>
                </div>

                {/* BILLED TO */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Billed To:</h3>
                    <div className="text-gray-900">
                        <p className="text-lg font-bold text-gray-800 mb-1">{invoiceData.billedTo.name || 'Client Name'}</p>
                        <p className="text-sm text-gray-500 whitespace-pre-line mb-3">{invoiceData.billedTo.address || 'Address'}</p>

                        {invoiceData.billedTo.gstin && (
                            <p className="text-sm"><span className="font-bold">GSTIN:</span> {invoiceData.billedTo.gstin}</p>
                        )}
                        {invoiceData.billedTo.pan && (
                            <p className="text-sm"><span className="font-bold">PAN:</span> {invoiceData.billedTo.pan}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Table */}
            <div className="mb-8">
                {/* Header */}
                <div className="flex border-t border-b border-gray-200 py-2 mb-4">
                    <div className="w-[50%] text-xs font-bold text-gray-500 uppercase">Description</div>
                    <div className="w-[15%] text-xs font-bold text-gray-500 uppercase text-left">Quantity</div>
                    <div className="w-[15%] text-xs font-bold text-gray-500 uppercase text-right">Rate (₹)</div>
                    <div className="w-[20%] text-xs font-bold text-gray-500 uppercase text-right">Amount (₹)</div>
                </div>

                {/* Rows */}
                <div className="space-y-4 border-b border-gray-200 pb-8">
                    {invoiceData.items.map((item, i) => (
                        <div key={i} className="flex text-sm text-gray-900">
                            <div className="w-[50%] pr-4">{item.description}</div>
                            <div className="w-[15%] text-left">{item.quantity}</div>
                            <div className="w-[15%] text-right">{parseFloat(item.rate).toLocaleString('en-IN')}</div>
                            <div className="w-[20%] text-right font-bold">{parseFloat(item.amount).toLocaleString('en-IN')}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Totals */}
            <div className="flex justify-end mb-12">
                <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Total Amount:</p>
                    <p className="text-3xl font-bold text-gray-800">
                        ₹{invoiceData.totalAmount.toLocaleString('en-IN')} /-
                    </p>
                    {/* Placeholder for words - simplified for preview */}
                    <p className="text-xs text-gray-500 italic mt-1">(Amount in words will be on PDF)</p>
                </div>
            </div>

            {/* 5. Footer (Payment & Notes) */}
            <div className="grid grid-cols-2 gap-12 pt-8 border-t border-gray-200">
                {/* Payment */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Payment Details</h3>
                    <div className="text-sm text-gray-800 space-y-1">
                        <p><span className="font-bold">Account Name:</span> {paymentDetails.accountName}</p>
                        <p><span className="font-bold">Bank Name:</span> {paymentDetails.bankName}</p>
                        <p><span className="font-bold">Account Number:</span> {paymentDetails.accountNumber}</p>
                        <p><span className="font-bold">IFSC Code:</span> {paymentDetails.ifsc}</p>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Notes</h3>
                    <ul className="text-sm text-gray-500 space-y-2 list-disc list-inside">
                        <li>Services include AI-generated images and video visuals for digital presentation only.</li>
                        <li>No physical products or printing involved.</li>
                        <li>This invoice is generated for creative and digital services rendered.</li>
                    </ul>
                </div>
            </div>

            <div className="mt-12 text-center text-xs text-gray-300">
                Generated by Creonex Platform
            </div>
        </div>
    );

    return (
        <div className="invoice-page">
            <div className="invoice-header">
                <div className="header-title">
                    <h1>Invoice Generator</h1>
                    <p>Create professional invoices instantly</p>
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
                            {loading ? 'Generating...' : 'Save & Download'}
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
                <div className="animate-fade-in">
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
        </div>
    );
};

export default InvoiceGenerator;
