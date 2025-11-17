const express = require('express');
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

      // 🔥 DETECÇÃO AUTOMÁTICA DO TIPO DE BUSCA
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

// ... (mantenha as outras rotas POST, PUT, DELETE)

module.exports = router;