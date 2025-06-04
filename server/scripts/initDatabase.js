const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

// Function to read SQL files
const readSqlFile = (filename) => {
  return fs.readFileSync(path.join(__dirname, filename), 'utf8');
};

// Function to initialize the database
const initDatabase = async () => {
  let connection;
  
  try {
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    
    // Read SQL files
    const schemaSQL = readSqlFile('../sql/schema.sql');
    const sampleDataSQL = readSqlFile('../sql/sample_data.sql');
    
    console.log('Creating database and tables...');
    await connection.query(schemaSQL);
    console.log('Database schema created successfully.');
    
    console.log('Inserting sample data...');
    await connection.query(sampleDataSQL);
    console.log('Sample data inserted successfully.');
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run the initialization
initDatabase();