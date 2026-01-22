import React from 'react';
import { Plus, Trash2, Upload, Download, FileJson } from 'lucide-react';

export const Editor = ({ data, onChange, onUploadJSON, onDownloadPDF }) => {

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        // Auto calculate amount if needed
        if (field === 'quantity' || field === 'rate') {
            // simple parsing logic, might need to be more robust
            const qty = parseFloat(newItems[index].quantity) || 0; // heuristic for "13 comforters" -> might fail.
            // The user example has "13 comforters". Parsing that is hard. 
            // I'll keep it manual or try to parse leading number.
            // Let's rely on manual input or basic parsing if they type just numbers.
            const qVal = parseFloat(newItems[index].quantity) || 0;
            const rVal = parseFloat(newItems[index].rate) || 0;
            if (!isNaN(qVal) && !isNaN(rVal)) {
                newItems[index].amount = qVal * rVal;
            }
        }
        onChange({ ...data, items: newItems });
    };

    const calculateTotal = () => {
        const total = data.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        // Only update if different to avoid loop?
        // Actually, better to calculate total on the fly in the parent or render, 
        // but here we are editing the data object directly.
        // Let's update total in the effect or onChange in parent.
        // For now, I won't auto-update total here to avoid complexity, user can key it or I'll do it in parent.
    };

    const addItem = () => {
        onChange({
            ...data,
            items: [...data.items, { description: "", quantity: 1, rate: 0, amount: 0 }]
        });
    };

    const removeItem = (index) => {
        onChange({
            ...data,
            items: data.items.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="editor-panel">
            <div className="editor-header">
                <h1>Invoice Generator</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <label className="btn btn-secondary" title="Upload JSON">
                        <Upload size={16} />
                        <input type="file" accept=".json" onChange={onUploadJSON} hidden />
                    </label>
                    <button className="btn btn-primary" onClick={onDownloadPDF}>
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="editor-content">

                {/* Invoice Meta */}
                <div className="form-section">
                    <h3>Invoice Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Invoice Number</label>
                            <input
                                value={data.invoiceNo}
                                onChange={e => onChange({ ...data, invoiceNo: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={data.date}
                                onChange={e => onChange({ ...data, date: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Billed To */}
                <div className="form-section">
                    <h3>Billed To (Client)</h3>
                    <div className="form-group">
                        <label>Client Name</label>
                        <input
                            value={data.billedTo.name}
                            onChange={e => onChange({ ...data, billedTo: { ...data.billedTo, name: e.target.value } })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Address Line 1</label>
                        <input
                            value={data.billedTo.addressLine1}
                            onChange={e => onChange({ ...data, billedTo: { ...data.billedTo, addressLine1: e.target.value } })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Address Line 2</label>
                        <input
                            value={data.billedTo.addressLine2}
                            onChange={e => onChange({ ...data, billedTo: { ...data.billedTo, addressLine2: e.target.value } })}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>State/Zip</label>
                            <input
                                value={data.billedTo.addressLine3}
                                onChange={e => onChange({ ...data, billedTo: { ...data.billedTo, addressLine3: e.target.value } })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <input
                                value={data.billedTo.country}
                                onChange={e => onChange({ ...data, billedTo: { ...data.billedTo, country: e.target.value } })}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>GSTIN</label>
                            <input
                                value={data.billedTo.gstin}
                                onChange={e => onChange({ ...data, billedTo: { ...data.billedTo, gstin: e.target.value } })}
                            />
                        </div>
                        <div className="form-group">
                            <label>PAN</label>
                            <input
                                value={data.billedTo.pan}
                                onChange={e => onChange({ ...data, billedTo: { ...data.billedTo, pan: e.target.value } })}
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="form-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Items</h3>
                        <button type="button" onClick={addItem} style={{ color: 'var(--primary)' }}>
                            <Plus size={16} />
                        </button>
                    </div>
                    {data.items.map((item, idx) => (
                        <div key={idx} style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div className="form-group">
                                <input
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={e => handleItemChange(idx, 'description', e.target.value)}
                                />
                            </div>
                            <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
                                <input
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                />
                                <input
                                    placeholder="Rate"
                                    type="number"
                                    value={item.rate}
                                    onChange={e => handleItemChange(idx, 'rate', e.target.value)}
                                />
                                <input
                                    placeholder="Amount"
                                    type="number"
                                    value={item.amount}
                                    onChange={e => handleItemChange(idx, 'amount', e.target.value)}
                                />
                                <button onClick={() => removeItem(idx)} style={{ color: 'var(--secondary)' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="form-section">
                    <h3>Totals</h3>
                    <div className="form-group">
                        <label>Total Amount (₹)</label>
                        <input
                            type="number"
                            value={data.totalAmount}
                            onChange={e => onChange({ ...data, totalAmount: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Amount in Words</label>
                        <textarea
                            rows={2}
                            value={data.amountInWords}
                            onChange={e => onChange({ ...data, amountInWords: e.target.value })}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="form-section">
                    <h3>Notes</h3>
                    <div className="form-group">
                        <textarea
                            rows={4}
                            value={data.notes.join('\n')}
                            onChange={e => onChange({ ...data, notes: e.target.value.split('\n') })}
                        />
                        <small style={{ color: 'var(--text-dim)' }}>Separate notes by new line</small>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Editor;
