require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateBoletinsToHistorico() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar alunos com notas mas sem histórico
    const alunosComNotas = await Student.find({
      'notas.0': { $exists: true },
      $or: [
        { historico: { $exists: false } },
        { historico: { $size: 0 } }
      ]
    });

    console.log(`📊 Alunos com notas para migrar: ${alunosComNotas.length}`);

    let migrados = 0;

    for (let aluno of alunosComNotas) {
      if (aluno.notas && aluno.notas.length > 0) {
        // Agrupar notas por série
        const notasPorSerie = {};
        
        aluno.notas.forEach(nota => {
          const serie = nota.serie || aluno.serieAno || 'Não informada';
          if (!notasPorSerie[serie]) {
            notasPorSerie[serie] = [];
          }
          notasPorSerie[serie].push(nota);
        });

        // Criar histórico para cada série
        for (let serie in notasPorSerie) {
          const disciplinas = notasPorSerie[serie];
          
          // Calcular média geral
          const somaMedias = disciplinas.reduce((acc, disc) => acc + (disc.mediaFinal || 0), 0);
          const mediaGeral = (somaMedias / disciplinas.length).toFixed(1);
          
          const aprovacoes = disciplinas.filter(disc => disc.situacao === 'Aprovado').length;
          const situacaoGeral = aprovacoes === disciplinas.length ? 'Aprovado' : 'Em Recuperação';

          const historico = {
            anoLetivo: new Date().getFullYear().toString(),
            serie: serie,
            turma: aluno.turma || '',
            turno: aluno.turno || '',
            escola: 'E.E.F. NAIR CUNHA DE AGUIAR',
            disciplinas: disciplinas,
            mediaGeral: parseFloat(mediaGeral),
            situacaoGeral: situacaoGeral,
            frequencia: '',
            observacoes: 'Migrado automaticamente do boletim'
          };

          if (!aluno.historico) {
            aluno.historico = [];
          }
          
          aluno.historico.push(historico);
        }

        await aluno.save();
        migrados++;
        console.log(`✅ Migrado histórico para ${aluno.nome}`);
      }
    }

    console.log(`\n🎉 MIGRAÇÃO CONCLUÍDA!`);
    console.log(`✅ Históricos migrados: ${migrados}`);

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Erro:', err);
    mongoose.disconnect();
    process.exit(1);
  }
}

migrateBoletinsToHistorico();