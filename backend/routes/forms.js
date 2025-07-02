import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Create or update form (no auth)
router.post('/', async (req, res) => {
  const { id, title, description, instructions, questions, version, status } = req.body;
  try {
    if (id) {
      // Update
      await pool.query(
        'UPDATE questionnaire_config SET title=?, description=?, instructions=?, questions=?, version=?, status=? WHERE id=?',
        [title, description, instructions, JSON.stringify(questions), version || 1, status || 'draft', id]
      );
      res.json({ message: 'Form updated' });
    } else {
      // Create
      await pool.query(
        'INSERT INTO questionnaire_config (title, description, instructions, questions, version, status) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, instructions, JSON.stringify(questions), version || 1, status || 'draft']
      );
      res.status(201).json({ message: 'Form created' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all forms (no auth)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM questionnaire_config');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single form (no auth)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM questionnaire_config WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Form not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
