// Sale utility functions for product pricing

export const isProductOnSale = (product) => {
    if (!product.is_on_sale) return false;
    
    const now = new Date();
    const startDate = product.sale_start_date ? new Date(product.sale_start_date) : null;
    const endDate = product.sale_end_date ? new Date(product.sale_end_date) : null;
    
    // If no dates are set, sale is active
    if (!startDate && !endDate) return true;
    
    // Check if current date is within sale period
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
};

export const calculateSalePrice = (originalPrice, discountPercentage) => {
    if (!originalPrice || !discountPercentage) return originalPrice;
    const discount = parseFloat(discountPercentage) / 100;
    const salePrice = parseFloat(originalPrice) * (1 - discount);
    return salePrice.toFixed(2);
};

export const getSaleInfo = (product) => {
    if (!product.is_on_sale || !isProductOnSale(product)) {
        return { 
            isOnSale: false,
            originalPrice: parseFloat(product.productprice || product.price || 0),
            displayPrice: parseFloat(product.productprice || product.price || 0)
        };
    }
    
    const originalPrice = parseFloat(product.productprice || product.price || 0);
    const salePrice = parseFloat(calculateSalePrice(originalPrice, product.sale_discount_percentage));
    
    return {
        isOnSale: true,
        originalPrice: originalPrice,
        salePrice: salePrice,
        displayPrice: salePrice,
        discountPercentage: product.sale_discount_percentage,
        savings: (originalPrice - salePrice).toFixed(2)
    };
};

export const formatPrice = (price) => {
    return `₱${parseFloat(price).toFixed(2)}`;
};

export const PriceDisplay = ({ product, className = '', showSavings = false }) => {
    const saleInfo = getSaleInfo(product);
    
    if (saleInfo.isOnSale) {
        return (
            <div className={`sale-price-container ${className}`}>
                <span className="original-price">{formatPrice(saleInfo.originalPrice)}</span>
                <span className="sale-price">{formatPrice(saleInfo.salePrice)}</span>
                <span className="sale-badge">-{saleInfo.discountPercentage}% OFF</span>
                {showSavings && (
                    <span className="savings">Save {formatPrice(saleInfo.savings)}</span>
                )}
            </div>
        );
    }
    
    return (
        <span className={`regular-price ${className}`}>
            {formatPrice(saleInfo.displayPrice)}
        </span>
    );
};
