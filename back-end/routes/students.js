const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /students - lista com paginação e filtros simples
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, q } = req.query;
    const query = {};
    if (q) {
      query.nome = { $regex: q, $options: 'i' };
    }
    const students = await Student.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Student.countDocuments(query);
    res.json({ data: students, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /students/:id
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Aluno não encontrado' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /students
router.post('/', async (req, res) => {
  try {
    const s = new Student(req.body);
    await s.save();
    res.status(201).json(s);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /students/:id
router.put('/:id', async (req, res) => {
  try {
    const s = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(s);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /students/:id
router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
