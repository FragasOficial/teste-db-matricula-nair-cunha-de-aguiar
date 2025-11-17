require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✔ Conectado ao MongoDB');

    // Encontrar todos os alunos
    const students = await Student.find({});
    console.log(`📊 Encontrados ${students.length} alunos para migrar`);

    let updated = 0;
    for (let student of students) {
      // Migrar campos antigos para novos
      if (student["Home do Aluno"] && !student.nome) {
        student.nome = student["Home do Aluno"];
      }
      if (student["Data de Mace."] && !student.dataNascimento) {
        student.dataNascimento = student["Data de Mace."];
      }
      if (student["Cartão do SUS"] && !student.cartaoSUS) {
        student.cartaoSUS = student["Cartão do SUS"];
      }
      if (student["Série/Ano"] && !student.serieAno) {
        student.serieAno = student["Série/Ano"];
      }
      
      await student.save();
      updated++;
    }

    console.log(`🎉 Migração concluída! ${updated} registros atualizados`);
    
    // Verificar resultado
    const totalWithNome = await Student.countDocuments({ nome: { $exists: true, $ne: "" } });
    console.log(`📊 Alunos com campo 'nome': ${totalWithNome}`);
    
    mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ Erro na migração:', err);
    mongoose.disconnect();
    process.exit(1);
  }
}

migrate();