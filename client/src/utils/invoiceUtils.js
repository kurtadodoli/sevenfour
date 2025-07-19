// Enhanced sale utility functions for invoices and transactions
import { getSaleInfo, formatPrice } from './saleUtils';

export const getInvoiceLineItem = (product, quantity = 1) => {
    const saleInfo = getSaleInfo(product);
    const unitPrice = saleInfo.displayPrice;
    const lineTotal = unitPrice * quantity;
    const originalTotal = saleInfo.originalPrice * quantity;
    
    return {
        productName: product.productname || product.product_name || 'Unknown Product',
        unitPrice: unitPrice,
        originalUnitPrice: saleInfo.originalPrice,
        quantity: quantity,
        lineTotal: lineTotal,
        originalLineTotal: originalTotal,
        isOnSale: saleInfo.isOnSale,
        discountPercentage: saleInfo.discountPercentage,
        lineSavings: saleInfo.isOnSale ? originalTotal - lineTotal : 0,
        formattedUnitPrice: formatPrice(unitPrice),
        formattedLineTotal: formatPrice(lineTotal),
        formattedLineSavings: saleInfo.isOnSale ? formatPrice(originalTotal - lineTotal) : null
    };
};

export const calculateInvoiceTotal = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const originalSubtotal = items.reduce((sum, item) => sum + item.originalLineTotal, 0);
    const totalSavings = originalSubtotal - subtotal;
    
    return {
        subtotal: subtotal,
        originalSubtotal: originalSubtotal,
        totalSavings: totalSavings,
        hasSaleItems: items.some(item => item.isOnSale),
        formattedSubtotal: formatPrice(subtotal),
        formattedOriginalSubtotal: formatPrice(originalSubtotal),
        formattedTotalSavings: formatPrice(totalSavings)
    };
};

export const InvoicePriceDisplay = ({ item, showOriginal = true }) => {
    if (item.isOnSale && showOriginal) {
        return (
            <div className="invoice-sale-price">
                <span className="original-price">₱{item.originalUnitPrice.toFixed(2)}</span>
                <span className="sale-price">₱{item.unitPrice.toFixed(2)}</span>
                <span className="invoice-sale-badge">-{item.discountPercentage}% OFF</span>
            </div>
        );
    }
    
    return <span>₱{item.unitPrice.toFixed(2)}</span>;
};
