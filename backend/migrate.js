import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createTable = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'simolyai',
  });

  try {
    // Create questionnaire_config table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS questionnaire_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        surveyJSON JSON NOT NULL,
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ questionnaire_config table created successfully');

    // Note: MySQL doesn't support IF NOT EXISTS for indexes
    // Index will be created manually if needed for performance
    console.log('✅ Migration completed successfully');

  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    await connection.end();
  }
};

createTable(); 