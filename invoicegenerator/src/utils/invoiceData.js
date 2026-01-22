export const initialInvoice = {
    invoiceNo: "CRX-INV-001",
    date: new Date().toISOString().split('T')[0],
    from: {
        name: "Creonex.viz",
        subtitle: "AI Visuals & Creative Content Studio",
        email: "creonex.viz@gmail.com",
        phone: "8555074387"
    },
    billedTo: {
        name: "PANCHAJANYA TEXTILES",
        addressLine1: "33, Sindhi Colony, Prenderghast Road",
        addressLine2: "Secunderabad, Hyderabad",
        addressLine3: "Telangana – 500003",
        country: "India",
        gstin: "36AACFP2688K1ZT",
        pan: "AACFP2688K"
    },
    items: [
        {
            description: "AI-generated comforter visuals (4 images + 1 video per comforter)",
            quantity: "13 comforters",
            rate: 320,
            amount: 4160
        }
    ],
    totalAmount: 4160,
    amountInWords: "Rupees Four Thousand One Hundred Sixty Only",
    paymentDetails: {
        accountName: "Ms. Beemer Sowmya",
        bankName: "State Bank of India",
        accountNumber: "62148655051",
        ifscCode: "SBIN0020295"
    },
    notes: [
        "Services include AI-generated images and video visuals for digital presentation only.",
        "No physical products or printing involved.",
        "This invoice is generated for creative and digital services rendered."
    ]
};
