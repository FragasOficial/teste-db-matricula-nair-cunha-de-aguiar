require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI;

async function correctMigration() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar TODOS os alunos
    const allStudents = await Student.find({});
    console.log(`📊 Total de alunos: ${allStudents.length}`);

    let updated = 0;

    for (let student of allStudents) {
      let needsUpdate = false;

      console.log(`\n--- Processando aluno ${updated + 1} ---`);

      // 🔥 CORREÇÃO: Usar os campos CORRETOS do MongoDB
      if (student['Nome do Aluno'] && !student.nome) {
        student.nome = student['Nome do Aluno'];
        needsUpdate = true;
        console.log(`✅ Nome migrado: "${student.nome}"`);
      }

      if (student['Data de Nasc.'] && !student.dataNascimento) {
        student.dataNascimento = new Date(student['Data de Nasc.']);
        needsUpdate = true;
        console.log(`✅ Data nasc. migrada: "${student.dataNascimento}"`);
      }

      if (student['Cartão do SUS'] && !student.cartaoSUS) {
        student.cartaoSUS = student['Cartão do SUS'];
        needsUpdate = true;
        console.log(`✅ Cartão SUS migrado: "${student.cartaoSUS}"`);
      }

      if (student['Série/Ano'] && !student.serieAno) {
        student.serieAno = student['Série/Ano'];
        needsUpdate = true;
        console.log(`✅ Série/Ano migrado: "${student.serieAno}"`);
      }

      if (student['Turma'] && !student.turma) {
        student.turma = student['Turma'];
        needsUpdate = true;
        console.log(`✅ Turma migrada: "${student.turma}"`);
      }

      if (student['Turno'] && !student.turno) {
        student.turno = student['Turno'];
        needsUpdate = true;
        console.log(`✅ Turno migrado: "${student.turno}"`);
      }

      if (student['Status'] && !student.status) {
        student.status = student['Status'];
        needsUpdate = true;
        console.log(`✅ Status migrado: "${student.status}"`);
      }

      if (student['Transporte'] && !student.transporte) {
        student.transporte = student['Transporte'];
        needsUpdate = true;
        console.log(`✅ Transporte migrado: "${student.transporte}"`);
      }

      if (student['Localidade'] && !student.localidade) {
        student.localidade = student['Localidade'];
        needsUpdate = true;
        console.log(`✅ Localidade migrada: "${student.localidade}"`);
      }

      if (student['CPF'] && !student.cpf) {
        student.cpf = student['CPF'].toString().replace(/\D/g, '').padStart(11, '0');
        needsUpdate = true;
        console.log(`✅ CPF migrado: "${student.cpf}"`);
      }

      if (needsUpdate) {
        await student.save();
        updated++;
      }
    }

    console.log(`\n🎉 MIGRAÇÃO CORRIGIDA!`);
    console.log(`✅ Total atualizado: ${updated}`);

    // VERIFICAÇÃO FINAL
    const withNome = await Student.countDocuments({ nome: { $ne: "" } });
    const withData = await Student.countDocuments({ dataNascimento: { $ne: null } });
    const withCPF = await Student.countDocuments({ cpf: { $ne: "" } });
    const withLocalidade = await Student.countDocuments({ localidade: { $ne: "" } });

    console.log('\n📊 RELATÓRIO FINAL:');
    console.log(`   Com nome: ${withNome}`);
    console.log(`   Com data nasc.: ${withData}`);
    console.log(`   Com CPF: ${withCPF}`);
    console.log(`   Com localidade: ${withLocalidade}`);

    mongoose.disconnect();

  } catch (err) {
    console.error('❌ Erro:', err);
    mongoose.disconnect();
    process.exit(1);
  }
}

correctMigration();