require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI;

async function fixMigration() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar TODOS os alunos
    const students = await Student.find({});
    console.log(`📊 Total de alunos: ${students.length}`);

    let updated = 0;
    let errors = 0;

    for (let student of students) {
      try {
        console.log('\n--- Processando aluno ---');
        console.log('ID:', student._id);
        console.log('Campos originais:', {
          'Home do Aluno': student['Home do Aluno'],
          'Data de Mace.': student['Data de Mace.'],
          'Cartão do SUS': student['Cartão do SUS'],
          'Série/Ano': student['Série/Ano'],
          'Turma': student['Turma'],
          'Turno': student['Turno'],
          'Status': student['Status'],
          'Transporte': student['Transporte'],
          'Localidade': student['Localidade']
        });

        // 🔥 CORREÇÃO: Copiar campos originais para novos campos
        if (student['Home do Aluno'] && !student.nome) {
          student.nome = student['Home do Aluno'];
          console.log('✅ Nome migrado:', student.nome);
        }

        if (student['Data de Mace.'] && !student.dataNascimento) {
          student.dataNascimento = student['Data de Mace.'];
          console.log('✅ Data nasc. migrada:', student.dataNascimento);
        }

        if (student['Cartão do SUS'] && !student.cartaoSUS) {
          student.cartaoSUS = student['Cartão do SUS'];
          console.log('✅ Cartão SUS migrado:', student.cartaoSUS);
        }

        if (student['Série/Ano'] && !student.serieAno) {
          student.serieAno = student['Série/Ano'];
          console.log('✅ Série/Ano migrado:', student.serieAno);
        }

        if (student['Turma'] && !student.turma) {
          student.turma = student['Turma'];
          console.log('✅ Turma migrada:', student.turma);
        }

        if (student['Turno'] && !student.turno) {
          student.turno = student['Turno'];
          console.log('✅ Turno migrado:', student.turno);
        }

        if (student['Status'] && !student.status) {
          student.status = student['Status'];
          console.log('✅ Status migrado:', student.status);
        }

        if (student['Transporte'] && !student.transporte) {
          student.transporte = student['Transporte'];
          console.log('✅ Transporte migrado:', student.transporte);
        }

        if (student['Localidade'] && !student.localidade) {
          student.localidade = student['Localidade'];
          console.log('✅ Localidade migrada:', student.localidade);
        }

        // CPF - limpar e formatar
        if (student['CPF'] && !student.cpf) {
          student.cpf = student['CPF'].toString().replace(/\D/g, '').padStart(11, '0');
          console.log('✅ CPF migrado:', student.cpf);
        }

        await student.save();
        updated++;
        console.log(`✅ Aluno ${updated}/${students.length} migrado`);

      } catch (error) {
        errors++;
        console.error('❌ Erro no aluno', student._id, error.message);
      }
    }

    console.log(`\n🎉 MIGRAÇÃO CONCLUÍDA!`);
    console.log(`✅ Atualizados: ${updated}`);
    console.log(`❌ Erros: ${errors}`);

    // Verificar resultado
    const withNome = await Student.countDocuments({ nome: { $ne: "" } });
    const withCPF = await Student.countDocuments({ cpf: { $ne: "" } });
    const withLocalidade = await Student.countDocuments({ localidade: { $ne: "" } });

    console.log('\n📊 RESULTADO FINAL:');
    console.log(`   Com nome: ${withNome}`);
    console.log(`   Com CPF: ${withCPF}`);
    console.log(`   Com localidade: ${withLocalidade}`);

    mongoose.disconnect();

  } catch (err) {
    console.error('❌ Erro geral:', err);
    mongoose.disconnect();
    process.exit(1);
  }
}

fixMigration();