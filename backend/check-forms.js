import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const checkForms = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'simolyai',
  });

  try {
    const [rows] = await connection.query('SELECT id, title, status, created_at FROM questionnaire_config ORDER BY created_at DESC');
    
    console.log('📋 Available Forms:');
    console.log('==================');
    
    if (rows.length === 0) {
      console.log('❌ No forms found in database');
      console.log('💡 Create a form first via the admin panel');
    } else {
      rows.forEach((form, index) => {
        console.log(`${index + 1}. ID: ${form.id}`);
        console.log(`   Title: ${form.title}`);
        console.log(`   Status: ${form.status}`);
        console.log(`   Created: ${form.created_at}`);
        console.log(`   URL: http://localhost:8081/questionnaire-surveyjs/${form.id}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error checking forms:', error);
  } finally {
    await connection.end();
  }
};

checkForms(); 