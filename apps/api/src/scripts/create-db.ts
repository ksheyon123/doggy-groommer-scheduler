import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createDB = async () => {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT || '3306', 10),
      user: DB_USERNAME,
      password: DB_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    console.log(`Database ${DB_NAME} created or already exists.`);
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
};

createDB();
