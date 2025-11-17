require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI;

async function completeMigration() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // BUSCAR TODOS os alunos
    const allStudents = await Student.find({});
    console.log(`📊 Total de alunos no banco: ${allStudents.length}`);

    let updated = 0;

    for (let student of allStudents) {
      let needsUpdate = false;

      // 🎯 FORÇAR migração dos campos principais
      if (student['Home do Aluno']) {
        student.nome = student['Home do Aluno'];
        needsUpdate = true;
        console.log(`📝 Nome: ${student.nome}`);
      }

      if (student['Data de Masc.']) {
        student.dataNascimento = student['Data de Masc.'];
        needsUpdate = true;
      }

      if (student['Cartão do SUS']) {
        student.cartaoSUS = student['Cartão do SUS'];
        needsUpdate = true;
      }

      if (student['Série/Ano']) {
        student.serieAno = student['Série/Ano'];
        needsUpdate = true;
      }

      if (student['Turma']) {
        student.turma = student['Turma'];
        needsUpdate = true;
      }

      if (student['Turno']) {
        student.turno = student['Turno'];
        needsUpdate = true;
      }

      if (student['Status']) {
        student.status = student['Status'];
        needsUpdate = true;
      }

      if (student['Transporte']) {
        student.transporte = student['Transporte'];
        needsUpdate = true;
      }

      if (student['Localidade']) {
        student.localidade = student['Localidade'];
        needsUpdate = true;
      }

      if (student['CPF']) {
        student.cpf = student['CPF'].toString().replace(/\D/g, '').padStart(11, '0');
        needsUpdate = true;
      }

      if (needsUpdate) {
        await student.save();
        updated++;
        if (updated % 50 === 0) {
          console.log(`✅ ${updated} alunos migrados...`);
        }
      }
    }

    console.log(`\n🎉 MIGRAÇÃO COMPLETA!`);
    console.log(`✅ Total atualizado: ${updated}`);

    // VERIFICAÇÃO DETALHADA
    const verification = await Student.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          withNome: { $sum: { $cond: [{ $ne: ['$nome', ''] }, 1, 0] } },
          withData: { $sum: { $cond: [{ $ne: ['$dataNascimento', null] }, 1, 0] } },
          withCPF: { $sum: { $cond: [{ $ne: ['$cpf', ''] }, 1, 0] } },
          withLocalidade: { $sum: { $cond: [{ $ne: ['$localidade', ''] }, 1, 0] } }
        }
      }
    ]);

    console.log('\n📊 RELATÓRIO FINAL:');
    console.log(`   Total: ${verification[0].total}`);
    console.log(`   Com nome: ${verification[0].withNome}`);
    console.log(`   Com data nasc.: ${verification[0].withData}`);
    console.log(`   Com CPF: ${verification[0].withCPF}`);
    console.log(`   Com localidade: ${verification[0].withLocalidade}`);

    mongoose.disconnect();

  } catch (err) {
    console.error('❌ Erro:', err);
    mongoose.disconnect();
    process.exit(1);
  }
}

completeMigration();