const express = require('express');
const mongoose = require('mongoose'); // 🔥 ADICIONAR ESTA LINHA
const router = express.Router();
const Student = require('../models/Student');

// GET /students — listagem com filtros INTELIGENTES
router.get('/', async (req, res) => {
  try {
    let { page = 1, limit = 50, q } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    if (q && q.trim() !== '') {
      const searchTerm = q.trim();
      const onlyNumbers = searchTerm.replace(/\D/g, '');
      
      console.log('🔍 Pesquisa inteligente por:', searchTerm);

      query.$or = [];

      // Se for apenas números (CPF, Cartão SUS, Série)
      if (/^\d+$/.test(searchTerm)) {
        // Busca em CPF (exata)
        if (onlyNumbers.length === 11) {
          query.$or.push({ cpf: onlyNumbers });
        }
        
        // Busca em Cartão SUS (exata)
        if (onlyNumbers.length > 5) {
          query.$or.push({ cartaoSUS: { $regex: onlyNumbers, $options: 'i' } });
        }
        
        // Busca em Série/Ano (exata)
        query.$or.push({ serieAno: { $regex: `^${searchTerm}$`, $options: 'i' } });
      }
      
      // Se for uma letra única (Turma: A, B, U)
      if (/^[A-Za-z]{1}$/.test(searchTerm)) {
        query.$or.push({ turma: { $regex: `^${searchTerm}$`, $options: 'i' } });
      }
      
      // Busca por nome (parcial) - SEMPRE inclui
      query.$or.push({ nome: { $regex: searchTerm, $options: 'i' } });
      
      // Busca por localidade (parcial)
      query.$or.push({ localidade: { $regex: searchTerm, $options: 'i' } });

      // Se não houver condições, busca genérica
      if (query.$or.length === 0) {
        query.$or = [
          { nome: { $regex: searchTerm, $options: 'i' } },
          { cpf: { $regex: searchTerm, $options: 'i' } },
          { localidade: { $regex: searchTerm, $options: 'i' } }
        ];
      }

      console.log('🎯 Query inteligente:', JSON.stringify(query));
    }

    const [students, total] = await Promise.all([
      Student.find(query)
        .select('nome dataNascimento cpf serieAno turma localidade cartaoSUS turno status transporte')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ nome: 1 }),
      Student.countDocuments(query)
    ]);

    // Filtrar apenas campos necessários para o frontend
    const cleanStudents = students.map(s => ({
      _id: s._id,
      nome: s.nome || '',
      dataNascimento: s.dataNascimento || null,
      cpf: s.cpf || '',
      serieAno: s.serieAno || '',
      turma: s.turma || '',
      localidade: s.localidade || '',
      cartaoSUS: s.cartaoSUS || '',
      turno: s.turno || '',
      status: s.status || '',
      transporte: s.transporte || ''
    }));

    console.log(`📊 Resultado: ${students.length} de ${total} alunos`);

    res.json({
      data: cleanStudents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error('Erro ao buscar alunos:', err);
    res.status(500).json({ error: err.message });
  }
});

// 🔥 CORREÇÃO: Rota POST para criar aluno
router.post('/', async (req, res) => {
  try {
    console.log('📥 Recebendo dados para criar aluno:', req.body);
    
    const {
      nome,
      dataNascimento,
      cpf,
      cartaoSUS,
      serieAno,
      turma,
      turno,
      status,
      transporte,
      localidade
    } = req.body;

    // Validação básica
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Criar aluno com os dados padronizados
    const studentData = {
      nome: nome.trim(),
      dataNascimento: dataNascimento || null,
      cpf: cpf || '',
      cartaoSUS: cartaoSUS || '',
      serieAno: serieAno || '',
      turma: turma || '',
      turno: turno || '',
      status: status || '',
      transporte: transporte || '',
      localidade: localidade || '',
      
      // 🔥 MANTER CAMPOS ORIGINAIS PARA COMPATIBILIDADE
      "Nome do Aluno": nome.trim(),
      "Data de Nasc.": dataNascimento || null,
      "Cartão do SUS": cartaoSUS || '',
      "Série/Ano": serieAno || '',
      "Turma": turma || '',
      "Turno": turno || '',
      "Status": status || '',
      "Transporte": transporte || '',
      "Localidade": localidade || ''
    };

    console.log('💾 Salvando aluno no banco:', studentData);

    const student = new Student(studentData);
    const savedStudent = await student.save();

    console.log('✅ Aluno criado com sucesso:', savedStudent._id);

    // Retornar dados limpos para o frontend
    const cleanStudent = {
      _id: savedStudent._id,
      nome: savedStudent.nome,
      dataNascimento: savedStudent.dataNascimento,
      cpf: savedStudent.cpf,
      serieAno: savedStudent.serieAno,
      turma: savedStudent.turma,
      localidade: savedStudent.localidade,
      cartaoSUS: savedStudent.cartaoSUS,
      turno: savedStudent.turno,
      status: savedStudent.status,
      transporte: savedStudent.transporte
    };

    res.status(201).json(cleanStudent);

  } catch (err) {
    console.error('❌ Erro ao criar aluno:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Dados inválidos: ' + err.message });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ error: 'CPF já cadastrado' });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor: ' + err.message });
  }
});

// PUT /students/:id - Atualizar aluno
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { 
        ...req.body,
        // Atualizar também os campos originais
        "Nome do Aluno": req.body.nome,
        "Data de Nasc.": req.body.dataNascimento,
        "Cartão do SUS": req.body.cartaoSUS,
        "Série/Ano": req.body.serieAno,
        "Turma": req.body.turma,
        "Turno": req.body.turno,
        "Status": req.body.status,
        "Transporte": req.body.transporte,
        "Localidade": req.body.localidade
      },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Retornar dados limpos
    const cleanStudent = {
      _id: updatedStudent._id,
      nome: updatedStudent.nome,
      dataNascimento: updatedStudent.dataNascimento,
      cpf: updatedStudent.cpf,
      serieAno: updatedStudent.serieAno,
      turma: updatedStudent.turma,
      localidade: updatedStudent.localidade,
      cartaoSUS: updatedStudent.cartaoSUS,
      turno: updatedStudent.turno,
      status: updatedStudent.status,
      transporte: updatedStudent.transporte
    };

    res.json(cleanStudent);

  } catch (err) {
    console.error('Erro ao atualizar aluno:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Dados inválidos: ' + err.message });
    }
    
    res.status(500).json({ error: err.message });
  }
});

// DELETE /students/:id - Excluir aluno
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    res.json({ message: 'Aluno excluído com sucesso', deletedStudent });

  } catch (err) {
    console.error('Erro ao excluir aluno:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /students/:id - Buscar aluno por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Retornar dados limpos
    const cleanStudent = {
      _id: student._id,
      nome: student.nome,
      dataNascimento: student.dataNascimento,
      cpf: student.cpf,
      serieAno: student.serieAno,
      turma: student.turma,
      localidade: student.localidade,
      cartaoSUS: student.cartaoSUS,
      turno: student.turno,
      status: student.status,
      transporte: student.transporte
    };

    res.json(cleanStudent);

  } catch (err) {
    console.error('Erro ao buscar aluno:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /students/:id/historico - Buscar histórico do aluno
router.get('/:id/historico', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const student = await Student.findById(id).select('historico');
    
    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    res.json(student.historico || []);
  } catch (err) {
    console.error('Erro ao buscar histórico:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /students/:id/historico - Adicionar histórico
router.post('/:id/historico', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const novoHistorico = {
      ...req.body,
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    student.historico.push(novoHistorico);
    await student.save();

    res.status(201).json(novoHistorico);
  } catch (err) {
    console.error('Erro ao adicionar histórico:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /students/:id/historico/:historicoId - Excluir histórico
router.delete('/:id/historico/:historicoId', async (req, res) => {
  try {
    const { id, historicoId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(historicoId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    student.historico = student.historico.filter(h => h._id.toString() !== historicoId);
    await student.save();

    res.json({ message: 'Histórico excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir histórico:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;