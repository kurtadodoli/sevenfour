// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures// Check cancellation request table structures

const mysql = require('mysql2/promise');

const mysql = require('mysql2/promise');

const dbConfig = {

    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

    user: process.env.DB_USER || 'root',

    password: process.env.DB_PASSWORD || '',const dbConfig = {

    database: process.env.DB_NAME || 'sfc_db',

    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

};

    user: process.env.DB_USER || 'root',

const checkTables = async () => {

    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

        const connection = await mysql.createConnection(dbConfig);

            database: process.env.DB_NAME || 'sfc_db',

        // Check regular cancellation_requests table

        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            console.log('✅ Regular cancellation_requests table structure:');

            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            

            // Get sample dataconst checkTables = async () => {

            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

            console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

            console.table(regularSample);

                    const connection = await mysql.createConnection(dbConfig);

        } catch (error) {

            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',const mysql = require('mysql2/promise');const mysql = require('mysql2/promise');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',const dbConfig = {const dbConfig = {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    host: process.env.DB_HOST || 'localhost',    host: process.env.DB_HOST || 'localhost',

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);    user: process.env.DB_USER || 'root',    user: process.env.DB_USER || 'root',

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    password: process.env.DB_PASSWORD || '',    password: process.env.DB_PASSWORD || '',

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            database: process.env.DB_NAME || 'sfc_db',    database: process.env.DB_NAME || 'sfc_db',

        }

                // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');    port: process.env.DB_PORT || 3306    port: process.env.DB_PORT || 3306

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');};};

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);

            console.table(customSample);

                        

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample dataconst checkTables = async () => {const checkTables = async () => {

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');    try {    try {

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);

    }

};                    const connection = await mysql.createConnection(dbConfig);        const connection = await mysql.createConnection(dbConfig);



checkTables();        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);                

        }

                // Check regular cancellation_requests table        // Check regular cancellation_requests table

        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');        console.log('🔍 Checking cancellation_requests table structure...');

        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');        try {        try {

            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');

            

            // Get sample data            console.log('✅ Regular cancellation_requests table structure:');            console.log('✅ Regular cancellation_requests table structure:');

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.table(regularStructure);            console.table(regularStructure);

            console.table(customSample);

                                    

        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            // Get sample data            // Get sample data

        }

                    const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');

        await connection.end();

                    console.log('📋 Sample regular cancellation requests:');            console.log('📋 Sample regular cancellation requests:');

    } catch (error) {

        console.error('❌ Database connection error:', error.message);            console.table(regularSample);            console.table(regularSample);

    }

};                        



checkTables();        } catch (error) {        } catch (error) {


            console.log('❌ Error with regular cancellation_requests table:', error.message);            console.log('❌ Error with regular cancellation_requests table:', error.message);

        }        }

                

        // Check custom_order_cancellation_requests table        // Check custom_order_cancellation_requests table

        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');

        try {        try {

            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');

            console.log('✅ Custom order cancellation_requests table structure:');            console.log('✅ Custom order cancellation_requests table structure:');

            console.table(customStructure);            console.table(customStructure);

                        

            // Get sample data            // Get sample data

            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');

            console.log('📋 Sample custom order cancellation requests:');            console.log('📋 Sample custom order cancellation requests:');

            console.table(customSample);            console.table(customSample);

                        

        } catch (error) {        } catch (error) {

            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);

        }        }

                

        await connection.end();        await connection.end();

                

    } catch (error) {    } catch (error) {

        console.error('❌ Database connection error:', error.message);        console.error('❌ Database connection error:', error.message);

    }    }

};};



checkTables();checkTables();

// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
// Check cancellation request table structures
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sfc_db',
    port: process.env.DB_PORT || 3306
};

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check regular cancellation_requests table
        console.log('🔍 Checking cancellation_requests table structure...');
        try {
            const [regularStructure] = await connection.execute('DESCRIBE cancellation_requests');
            console.log('✅ Regular cancellation_requests table structure:');
            console.table(regularStructure);
            
            // Get sample data
            const [regularSample] = await connection.execute('SELECT * FROM cancellation_requests LIMIT 3');
            console.log('📋 Sample regular cancellation requests:');
            console.table(regularSample);
            
        } catch (error) {
            console.log('❌ Error with regular cancellation_requests table:', error.message);
        }
        
        // Check custom_order_cancellation_requests table
        console.log('\n🔍 Checking custom_order_cancellation_requests table structure...');
        try {
            const [customStructure] = await connection.execute('DESCRIBE custom_order_cancellation_requests');
            console.log('✅ Custom order cancellation_requests table structure:');
            console.table(customStructure);
            
            // Get sample data
            const [customSample] = await connection.execute('SELECT * FROM custom_order_cancellation_requests LIMIT 3');
            console.log('📋 Sample custom order cancellation requests:');
            console.table(customSample);
            
        } catch (error) {
            console.log('❌ Error with custom_order_cancellation_requests table:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
};

checkTables();
