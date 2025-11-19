// cleanup-duplicate-fields.js
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanupDuplicateFields() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const students = await Student.find({});
    console.log(`📊 Encontrados ${students.length} alunos para limpeza`);

    let updated = 0;

    for (let student of students) {
      let needsUpdate = false;

      // Verificar se campos novos estão preenchidos
      const hasNewFields = student.nome && student.cpf && student.dataNascimento;
      
      if (hasNewFields) {
        // Se campos novos estão ok, remover campos antigos
        const updateOps = {};
        
        if (student['Nome do Aluno']) {
          updateOps['$unset'] = { 'Nome do Aluno': '' };
          needsUpdate = true;
        }
        if (student['Data de Nasc.']) {
          updateOps['$unset'] = { ...updateOps['$unset'], 'Data de Nasc.': '' };
          needsUpdate = true;
        }
        if (student['CPF']) {
          updateOps['$unset'] = { ...updateOps['$unset'], 'CPF': '' };
          needsUpdate = true;
        }

        if (needsUpdate) {
          await Student.updateOne({ _id: student._id }, updateOps);
          updated++;
          console.log(`🔄 Limpando campos antigos do aluno ${updated}/${students.length}`);
        }
      }
    }

    console.log(`\n🎉 Limpeza concluída! ${updated} alunos atualizados`);

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Erro na limpeza:', err);
    mongoose.disconnect();
  }
}

cleanupDuplicateFields();