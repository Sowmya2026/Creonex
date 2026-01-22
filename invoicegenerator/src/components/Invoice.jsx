import React, { forwardRef } from 'react';

export const Invoice = forwardRef(({ data }, ref) => {
    return (
        <div className="invoice-paper" ref={ref} id="invoice-element">
            <div className="invoice-header">
                <div className="invoice-brand">
                    <div className="invoice-title">INVOICE</div>
                    <div className="invoice-meta">
                        <div style={{ display: 'flex', gap: '8px' }}>Invoice No: <strong>{data.invoiceNo}</strong></div>
                        <div style={{ display: 'flex', gap: '8px' }}>Date: <strong>{data.date}</strong></div>
                    </div>
                </div>

                {/* Placeholder for Logo - Client said "later I will upload the logo" */}
                {data.logo ? (
                    <img src={data.logo} alt="Logo" style={{ height: '80px', objectFit: 'contain' }} />
                ) : (
                    <div style={{
                        width: '80px', height: '80px', background: '#f8fafc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#94a3b8', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold'
                    }}>
                        LOGO
                    </div>
                )}
            </div>

            <div className="bill-grid">
                <div className="from-details">
                    <h3 className="section-label">From:</h3>
                    <div className="company-details">
                        <div className="company-name">{data.from.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '4px' }}>{data.from.subtitle}</div>
                        <div style={{ fontSize: '0.9rem' }}>Email: {data.from.email}</div>
                        <div style={{ fontSize: '0.9rem' }}>Phone: {data.from.phone}</div>
                    </div>
                </div>
                <div className="bill-to">
                    <h3 className="section-label">Billed To:</h3>
                    <div className="company-name">{data.billedTo.name}</div>
                    <p style={{ fontSize: '0.9rem' }}>
                        {data.billedTo.addressLine1}<br />
                        {data.billedTo.addressLine2}<br />
                        {data.billedTo.addressLine3}<br />
                        {data.billedTo.country}
                    </p>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                        <strong>GSTIN:</strong> {data.billedTo.gstin}<br />
                        <strong>PAN:</strong> {data.billedTo.pan}
                    </div>
                </div>
            </div>

            <div style={{ minHeight: '200px' }}>
                <table className="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style={{ width: '120px' }}>Quantity</th>
                            <th style={{ width: '100px', textAlign: 'right' }}>Rate (₹)</th>
                            <th style={{ width: '120px', textAlign: 'right' }}>Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.description}</td>
                                <td>{item.quantity}</td>
                                <td>{item.rate}</td>
                                <td>{Number(item.amount).toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="total-section">
                <div className="total-box">
                    <div className="total-row">
                        <span className="total-label">Total Amount:</span>
                    </div>
                    <div className="total-amount">₹{Number(data.totalAmount).toLocaleString('en-IN')} /-</div>
                    <div className="amount-words">({data.amountInWords})</div>
                </div>
            </div>

            <div className="footer-grid">
                <div className="bank-details">
                    <h4>Payment Details</h4>
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <div>Account Name: <strong>{data.paymentDetails.accountName}</strong></div>
                        <div>Bank Name: {data.paymentDetails.bankName}</div>
                        <div>Account Number: {data.paymentDetails.accountNumber}</div>
                        <div>IFSC Code: {data.paymentDetails.ifscCode}</div>
                    </div>
                </div>
                <div className="notes">
                    <h4>Notes</h4>
                    <ul>
                        {data.notes.filter(n => n).map((note, idx) => (
                            <li key={idx}>{note}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
});

export default Invoice;
