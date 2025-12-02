import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const addIsDeletedColumn = async () => {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT || "3306", 10),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    console.log("Adding is_deleted column to dogs table...");

    // is_deleted 컬럼이 이미 존재하는지 확인
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'dogs' AND COLUMN_NAME = 'is_deleted'`,
      [DB_NAME]
    );

    if (Array.isArray(columns) && columns.length > 0) {
      console.log("is_deleted column already exists in dogs table.");
    } else {
      // is_deleted 컬럼 추가
      await connection.query(
        `ALTER TABLE dogs ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0`
      );
      console.log("Successfully added is_deleted column to dogs table.");
    }

    await connection.end();
  } catch (error) {
    console.error("Error adding is_deleted column:", error);
    process.exit(1);
  }
};

addIsDeletedColumn();
