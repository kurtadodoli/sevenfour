const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (orderData, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a new PDF document
            const doc = new PDFDocument({ margin: 50 });
            
            // Pipe the PDF to a file
            doc.pipe(fs.createWriteStream(outputPath));
            
            // Company header
            doc.fillColor('#000000')
               .fontSize(24)
               .text('Seven Four Clothing', 50, 50)
               .fontSize(10)
               .text('Custom Design Invoice', 50, 80);
            
            // Draw a line
            doc.moveTo(50, 100)
               .lineTo(550, 100)
               .stroke();
            
            // Invoice details
            doc.fontSize(12)
               .text(`Invoice Number: ${orderData.order_number}`, 50, 120)
               .text(`Design ID: ${orderData.design_id}`, 50, 140)
               .text(`Date: ${new Date(orderData.order_date).toLocaleDateString()}`, 50, 160)
               .text(`Payment Method: Cash on Delivery (COD)`, 50, 180);
            
            // Customer details
            doc.fontSize(14)
               .text('Customer Details:', 50, 220)
               .fontSize(12)
               .text(`Name: ${orderData.first_name} ${orderData.last_name}`, 50, 240)
               .text(`Email: ${orderData.email}`, 50, 260)
               .text(`Phone: ${orderData.contact_phone || 'Not provided'}`, 50, 280);
            
            // Shipping address
            doc.fontSize(14)
               .text('Shipping Address:', 50, 320)
               .fontSize(12)
               .text(orderData.shipping_address, 50, 340, { width: 400 });
            
            // Product details
            doc.fontSize(14)
               .text('Product Details:', 50, 400)
               .fontSize(12)
               .text(`Product: ${orderData.product_name}`, 50, 420)
               .text(`Type: ${orderData.product_type}`, 50, 440)
               .text(`Size: ${orderData.size || 'Not specified'}`, 50, 460)
               .text(`Color: ${orderData.color || 'Not specified'}`, 50, 480)
               .text(`Quantity: ${orderData.quantity}`, 50, 500);
            
            // Design concept
            if (orderData.design_concept) {
                doc.fontSize(14)
                   .text('Design Concept:', 50, 540)
                   .fontSize(12)
                   .text(orderData.design_concept, 50, 560, { width: 400 });
            }
            
            // Order notes
            if (orderData.order_notes) {
                doc.fontSize(14)
                   .text('Order Notes:', 50, 620)
                   .fontSize(12)
                   .text(orderData.order_notes, 50, 640, { width: 400 });
            }
            
            // Total amount
            doc.fontSize(16)
               .fillColor('#ff0000')
               .text(`Total Amount: ₱${orderData.total_amount}`, 50, 700);
            
            // Footer
            doc.fontSize(10)
               .fillColor('#666666')
               .text('Note: Payment will be collected upon delivery. Please have the exact amount ready.', 50, 750)
               .text('Thank you for choosing Seven Four Clothing!', 50, 770);
            
            // Finalize the PDF
            doc.end();
            
            doc.on('end', () => {
                resolve(outputPath);
            });
            
        } catch (error) {
            reject(error);
        }
    });
};

const generateHTMLInvoice = (orderData) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seven Four Clothing - Invoice ${orderData.order_number}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #000;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-name {
                font-size: 2.5em;
                font-weight: bold;
                color: #000;
                margin: 0;
            }
            .invoice-title {
                font-size: 1.2em;
                color: #666;
                margin: 10px 0 0 0;
            }
            .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            .section {
                margin-bottom: 25px;
            }
            .section-title {
                font-size: 1.2em;
                font-weight: bold;
                color: #000;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
                margin-bottom: 15px;
            }
            .field {
                margin-bottom: 8px;
            }
            .field-label {
                font-weight: bold;
                color: #333;
            }
            .total-section {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 5px;
                text-align: center;
                margin: 30px 0;
            }
            .total-amount {
                font-size: 2em;
                font-weight: bold;
                color: #e74c3c;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 0.9em;
            }
            .highlight {
                background-color: #fff3cd;
                padding: 15px;
                border-radius: 5px;
                border: 1px solid #ffeaa7;
                margin: 20px 0;
            }
            @media print {
                body { background-color: white; }
                .invoice-container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="header">
                <h1 class="company-name">Seven Four Clothing</h1>
                <p class="invoice-title">Custom Design Invoice</p>
            </div>
            
            <div class="invoice-details">
                <div class="section">
                    <h3 class="section-title">Invoice Information</h3>
                    <div class="field">
                        <span class="field-label">Invoice Number:</span> ${orderData.order_number}
                    </div>
                    <div class="field">
                        <span class="field-label">Design ID:</span> ${orderData.design_id}
                    </div>
                    <div class="field">
                        <span class="field-label">Date:</span> ${new Date(orderData.order_date).toLocaleDateString()}
                    </div>
                    <div class="field">
                        <span class="field-label">Payment Method:</span> Cash on Delivery (COD)
                    </div>
                </div>
                
                <div class="section">
                    <h3 class="section-title">Customer Details</h3>
                    <div class="field">
                        <span class="field-label">Name:</span> ${orderData.first_name} ${orderData.last_name}
                    </div>
                    <div class="field">
                        <span class="field-label">Email:</span> ${orderData.email}
                    </div>
                    <div class="field">
                        <span class="field-label">Phone:</span> ${orderData.contact_phone || 'Not provided'}
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h3 class="section-title">Shipping Address</h3>
                <p>${orderData.shipping_address}</p>
            </div>
            
            <div class="section">
                <h3 class="section-title">Product Details</h3>
                <div class="field">
                    <span class="field-label">Product Name:</span> ${orderData.product_name}
                </div>
                <div class="field">
                    <span class="field-label">Type:</span> ${orderData.product_type}
                </div>
                <div class="field">
                    <span class="field-label">Size:</span> ${orderData.size || 'Not specified'}
                </div>
                <div class="field">
                    <span class="field-label">Color:</span> ${orderData.color || 'Not specified'}
                </div>
                <div class="field">
                    <span class="field-label">Quantity:</span> ${orderData.quantity}
                </div>
            </div>
            
            ${orderData.design_concept ? `
            <div class="section">
                <h3 class="section-title">Design Concept</h3>
                <p>${orderData.design_concept}</p>
            </div>
            ` : ''}
            
            ${orderData.order_notes ? `
            <div class="section">
                <h3 class="section-title">Order Notes</h3>
                <p>${orderData.order_notes}</p>
            </div>
            ` : ''}
            
            <div class="total-section">
                <div class="total-amount">Total Amount: ₱${orderData.total_amount}</div>
            </div>
            
            <div class="highlight">
                <strong>Important:</strong> This is a Cash on Delivery (COD) order. 
                Payment will be collected when your custom design is delivered. 
                Please have the exact amount ready.
            </div>
            
            <div class="footer">
                <p>Thank you for choosing Seven Four Clothing!</p>
                <p>For questions about your order, please contact us with your order number.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    generateInvoice,
    generateHTMLInvoice
};
