const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /students — listagem com filtros e paginação
router.get('/', async (req, res) => {
  try {
    let { page = 1, limit = 50, q } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    if (q) {
      query.nome = { $regex: q, $options: 'i' };
    }

    const [students, total] = await Promise.all([
      Student.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ nome: 1 }),

      Student.countDocuments(query)
    ]);

    res.json({
      data: students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /students/:id
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    res.json(student);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'ID inválido' });
    }
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
    const s = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!s) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    res.json(s);

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'ID inválido' });
    }
    res.status(400).json({ error: err.message });
  }
});

// DELETE /students/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    res.json({ message: 'Aluno excluído com sucesso' });

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'ID inválido' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
