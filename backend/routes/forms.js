import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Create or update SurveyJS form
router.post('/', async (req, res) => {
  const { id, title, description, surveyJSON, status, createdBy } = req.body;
  
  try {
    // Validate required fields
    if (!title || !surveyJSON) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and survey JSON are required' 
      });
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    if (id) {
      // Update existing form
      await pool.query(
        `UPDATE questionnaire_config 
         SET title = ?, description = ?, questions = ?, status = ?, updated_at = ?
         WHERE id = ?`,
        [title, description || '', JSON.stringify(surveyJSON), status || 'draft', now, id]
      );
      
      res.json({ 
        success: true, 
        message: 'Form updated successfully',
        id: id
      });
    } else {
      // Create new form
      const [result] = await pool.query(
        `INSERT INTO questionnaire_config 
         (title, description, questions, status, created_by, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title, 
          description || '', 
          JSON.stringify(surveyJSON), 
          status || 'draft',
          createdBy || null,
          now,
          now
        ]
      );
      
      res.status(201).json({ 
        success: true, 
        message: 'Form created successfully',
        id: result.insertId
      });
    }
  } catch (err) {
    console.error('Error saving form:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving form: ' + err.message 
    });
  }
});

// Get all forms with optional status filter
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM questionnaire_config';
    let params = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    console.log('Executing query:', query, 'with params:', params);
    const [rows] = await pool.query(query, params);
    console.log('Query result rows:', rows.length);
    
    // Parse the JSON questions for each form
    const forms = rows.map(row => {
      try {
        let questions = null;
        if (row.questions) {
          // If it's already an object, use it directly
          if (typeof row.questions === 'object') {
            questions = row.questions;
          } else {
            // If it's a string, try to parse it
            questions = JSON.parse(row.questions);
          }
        }
        
        return {
          ...row,
          questions: questions
        };
      } catch (parseError) {
        console.error('Error parsing questions JSON for form', row.id, ':', parseError);
        return {
          ...row,
          questions: null
        };
      }
    });
    
    res.json({ 
      success: true, 
      data: forms 
    });
  } catch (err) {
    console.error('Error fetching forms:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching forms: ' + err.message 
    });
  }
});

// Get single form by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM questionnaire_config WHERE id = ?', 
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Form not found' 
      });
    }
    
    const form = rows[0];
    
    // Handle questions parsing more safely
    try {
      if (form.questions) {
        // If it's already an object, use it directly
        if (typeof form.questions === 'object') {
          form.questions = form.questions;
        } else {
          // If it's a string, try to parse it
          form.questions = JSON.parse(form.questions);
        }
      } else {
        form.questions = null;
      }
    } catch (parseError) {
      console.error('Error parsing questions JSON for form', form.id, ':', parseError);
      form.questions = null;
    }
    
    res.json({ 
      success: true, 
      data: form 
    });
  } catch (err) {
    console.error('Error fetching form:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching form: ' + err.message 
    });
  }
});

export default router;
