// cleanDatabase.js
const mongoose = require('mongoose');
const Student = require('./models/Student'); // ajuste o caminho conforme sua estrutura

async function cleanDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/alunos_nca', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os alunos
    const alunos = await Student.find({});
    console.log(`📊 Encontrados ${alunos.length} alunos`);

    let updatedCount = 0;
    
    for (const aluno of alunos) {
      const update = {};
      let needsUpdate = false;

      // Remover campos problemáticos
      const camposProblematicos = [
        'Data de Nasc.',
        'Data de Nasc',
        'Data de Masc.',
        'Data de Masc',
        'Data de ',
        ''
      ];

      camposProblematicos.forEach(campo => {
        if (aluno[campo] !== undefined) {
          console.log(`🗑️ Removendo campo problemático: "${campo}" do aluno ${aluno.nome}`);
          update[`$unset`] = { [campo]: "" };
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        await Student.findByIdAndUpdate(aluno._id, update);
        updatedCount++;
      }
    }

    console.log(`✅ Limpeza concluída: ${updatedCount} alunos atualizados`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

cleanDatabase();