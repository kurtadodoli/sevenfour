const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function getAdmins() {
  const connection = await mysql.createConnection(dbConfig);
  const [admins] = await connection.execute("SELECT email, first_name, last_name FROM users WHERE role = 'admin' LIMIT 3");
  console.log('Available admin accounts:');
  admins.forEach(admin => console.log(`  ${admin.email} (${admin.first_name} ${admin.last_name})`));
  await connection.end();
}

getAdmins();
