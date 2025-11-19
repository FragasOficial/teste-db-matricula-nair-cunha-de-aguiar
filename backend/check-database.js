// check-database.js - PARA DIAGNOSTICAR O PROBLEMA
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI;

async function diagnoseDatabase() {
  try {
    console.log('🔍 Iniciando diagnóstico do banco...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // 1. Verificar se a coleção existe
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Coleções no banco:', collections.map(c => c.name));

    // 2. Contar documentos
    const count = await Student.countDocuments();
    console.log(`📈 Total de alunos: ${count}`);

    // 3. Verificar estrutura de um documento
    if (count > 0) {
      const sample = await Student.findOne();
      console.log('📄 Exemplo de documento:', JSON.stringify(sample, null, 2));
    }

    // 4. Testar criação de um documento
    console.log('🧪 Testando criação de aluno...');
    const testStudent = new Student({
      nome: 'ALUNO TESTE DIAGNOSTICO',
      dataNascimento: new Date('2000-01-01'),
      cpf: '12345678900',
      serieAno: '1º Ano',
      turma: 'A',
      turno: 'Matutino',
      status: 'Matriculado'
    });

    const saved = await testStudent.save();
    console.log('✅ Aluno teste criado:', saved._id);

    // 5. Limpar aluno teste
    await Student.findByIdAndDelete(saved._id);
    console.log('🧹 Aluno teste removido');

    mongoose.disconnect();
    console.log('🎉 Diagnóstico concluído!');

  } catch (err) {
    console.error('❌ Erro no diagnóstico:', err);
    mongoose.disconnect();
  }
}

diagnoseDatabase();