import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Editor from './components/Editor';
import Invoice from './components/Invoice';
import { initialInvoice } from './utils/invoiceData';

function App() {
  const [data, setData] = useState(initialInvoice);
  const invoiceRef = useRef(null);

  useEffect(() => {
    // Auto Count Logic
    const lastNo = localStorage.getItem('creonex_last_invoice_no');
    if (lastNo) {
      // Parsing logic: CRX-INV-001 -> 001
      try {
        const parts = lastNo.split('-');
        if (parts.length > 0) {
          const numPart = parts[parts.length - 1];
          const num = parseInt(numPart, 10);
          if (!isNaN(num)) {
            const nextNum = num + 1;
            // Reconstruct ID
            // Assuming format prefix-number
            const prefix = parts.slice(0, parts.length - 1).join('-');
            const nextNo = (prefix ? prefix + '-' : '') + String(nextNum).padStart(3, '0');
            setData(prev => ({ ...prev, invoiceNo: nextNo }));
          }
        }
      } catch (e) {
        console.error("Failed to parse invoice number", e);
      }
    }
  }, []);

  // Auto-calculate Total Amount whenever items change
  useEffect(() => {
    const total = data.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    if (total !== data.totalAmount) {
      setData(prev => ({ ...prev, totalAmount: total }));
    }
  }, [data.items]);

  const handleUploadJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          // Check if valid structure or just merge
          setData(prev => ({ ...prev, ...json }));
        } catch (error) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    // Save invoice no to local storage for auto-increment next time
    localStorage.setItem('creonex_last_invoice_no', data.invoiceNo);

    try {
      // We use html2canvas to render the element to an image
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution for better quality
        useCORS: true, // Allow loading cross-origin images (like external logos if any)
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth, // Ensure full width is captured
        windowHeight: element.scrollHeight // Ensure full height is captured
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // A4 Paper dimensions in mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate image height to fit width
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`Invoice_${data.invoiceNo}.pdf`);

    } catch (err) {
      console.error("PDF Generation Error: ", err);
      alert("Failed to generate PDF");
    }
  };

  return (
    <div className="layout">
      <Editor
        data={data}
        onChange={setData}
        onUploadJSON={handleUploadJSON}
        onDownloadPDF={handleDownloadPDF}
      />
      <div className="preview-panel">
        {/* Wrapper can be used for scroll or centering */}
        <div style={{ margin: '0 auto' }}>
          <Invoice data={data} ref={invoiceRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
