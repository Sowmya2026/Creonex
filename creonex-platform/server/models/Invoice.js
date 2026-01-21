const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    billedTo: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        gstin: String,
        pan: String
    },
    items: [{
        description: { type: String, required: true },
        quantity: { type: String, required: true },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['generated', 'sent', 'paid'], default: 'generated' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
