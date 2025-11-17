require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI;

async function fixNamesAndDates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Encontrar alunos com campos originais mas sem campos novos
    const studentsToFix = await Student.find({
      $or: [
        { 'Home do Aluno': { $exists: true, $ne: '' }, nome: '' },
        { 'Home do Aluno': { $exists: true, $ne: '' }, nome: { $exists: false } },
        { 'Data de Masc.': { $exists: true, $ne: null }, dataNascimento: null }
      ]
    });

    console.log(`📊 Alunos para corrigir: ${studentsToFix.length}`);

    let fixedNames = 0;
    let fixedDates = 0;

    for (let student of studentsToFix) {
      console.log('\n--- Corrigindo aluno ---');
      console.log('ID:', student._id);
      
      // CORRIGIR NOME
      if (student['Home do Aluno'] && (!student.nome || student.nome === '')) {
        const oldName = student.nome || '(vazio)';
        student.nome = student['Home do Aluno'];
        console.log(`✅ NOME: "${oldName}" → "${student.nome}"`);
        fixedNames++;
      }

      // CORRIGIR DATA DE NASCIMENTO
      if (student['Data de Masc.'] && !student.dataNascimento) {
        const oldDate = student.dataNascimento || '(vazio)';
        student.dataNascimento = student['Data de Masc.'];
        console.log(`✅ DATA: "${oldDate}" → "${student.dataNascimento}"`);
        fixedDates++;
      }

      await student.save();
    }

    console.log(`\n🎉 CORREÇÃO CONCLUÍDA!`);
    console.log(`✅ Nomes corrigidos: ${fixedNames}`);
    console.log(`✅ Datas corrigidas: ${fixedDates}`);

    // VERIFICAÇÃO FINAL
    const withNome = await Student.countDocuments({ nome: { $ne: "" } });
    const withDate = await Student.countDocuments({ dataNascimento: { $ne: null } });
    const total = await Student.countDocuments();

    console.log('\n📊 VERIFICAÇÃO FINAL:');
    console.log(`   Total de alunos: ${total}`);
    console.log(`   Com nome preenchido: ${withNome}`);
    console.log(`   Com data nascimento: ${withDate}`);

    mongoose.disconnect();

  } catch (err) {
    console.error('❌ Erro:', err);
    mongoose.disconnect();
    process.exit(1);
  }
}

fixNamesAndDates();