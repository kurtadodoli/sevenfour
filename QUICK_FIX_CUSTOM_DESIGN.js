/**
 * QUICK FIX for Custom Design Submission Error
 * 
 * Instructions:
 * 1. Stop your server
 * 2. Replace the INSERT query in server/routes/custom-designs.js (around line 167-175)
 * 3. Replace the designValues array (around line 176-192)
 * 4. Restart your server
 * 5. Try submitting a custom design again
 */

// REPLACE THIS SECTION in server/routes/custom-designs.js

// OLD INSERT QUERY (REMOVE):
/*
const insertDesignQuery = `
    INSERT INTO custom_designs (
        design_id, user_id, product_type, product_name, product_color, product_size, quantity,
        first_name, last_name, email, customer_phone,
        street_address, city, house_number, barangay, postal_code,
        additional_info, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
`;
*/

// NEW INSERT QUERY (USE THIS):
const insertDesignQuery = `
    INSERT INTO custom_designs (
        design_id, user_id, product_type, product_name, product_color, product_size, quantity,
        additional_info, customer_name, first_name, last_name, email, customer_email, customer_phone,
        street_address, city, barangay, postal_code, status, estimated_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0.00)
`;

// OLD DESIGN VALUES (REMOVE):
/*
const designValues = [
    designId, // design_id
    null, // user_id (no auth yet)
    mappedProductType, // product_type
    productName || `Custom ${mappedProductType}`, // product_name
    productColor, // product_color
    productSize, // product_size
    parsedQuantity, // quantity
    finalFirstName, // first_name
    finalLastName, // last_name
    finalEmail, // email
    customerPhone || null,
    finalStreetAddress || null, // street_address
    finalCity, // city (maps to municipality)
    null, // house_number (not provided in form)
    barangay || null,
    postalCode || null,
    additionalInfo || null
];
*/

// NEW DESIGN VALUES (USE THIS):
const designValues = [
    designId, // design_id
    null, // user_id (no auth yet)
    mappedProductType, // product_type
    productName || `Custom ${mappedProductType}`, // product_name
    productColor, // product_color
    productSize, // product_size
    parsedQuantity, // quantity
    additionalInfo || '', // additional_info
    `${finalFirstName} ${finalLastName}`.trim(), // customer_name (legacy)
    finalFirstName, // first_name
    finalLastName, // last_name
    finalEmail, // email
    finalEmail, // customer_email (legacy, same as email)
    customerPhone || '', // customer_phone
    finalStreetAddress || '', // street_address
    finalCity, // city (maps to municipality)
    barangay || '', // barangay
    postalCode || '' // postal_code
];

/**
 * After making these changes:
 * 1. Save the file
 * 2. Restart your server: cd server && node app.js
 * 3. Try submitting a custom design from the frontend
 * 
 * This should fix the 500 Internal Server Error.
 */
