const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing',
    port: 3306
  });
  
  console.log('Connected to database');
  
  try {
    const sqlFile = fs.readFileSync(path.join(__dirname, 'sql', 'create_custom_orders_tables.sql'), 'utf8');
    
    // Split by semicolon but be more careful about it
    const statements = sqlFile
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}`);
          await connection.execute(statement);
          console.log('✅ Success');
        } catch (error) {
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('CREATE OR REPLACE VIEW')) {
            console.log('⚠️ Statement already exists (skipping):', error.message.substring(0, 80));
          } else {
            console.log('❌ Error:', error.message.substring(0, 100));
          }
        }
      }
    }
    
    console.log('🎉 Migration completed!');
    
    // Verify tables were created
    const [tables] = await connection.execute("SHOW TABLES LIKE 'custom%'");
    console.log('\nTables created:');
    tables.forEach(table => console.log('  ✅', Object.values(table)[0]));
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

runMigration();
