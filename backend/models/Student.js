// const mongoose = require('mongoose');

// const StudentSchema = new mongoose.Schema({
//   // Novos campos padronizados
//   nome: { type: String, trim: true },
//   dataNascimento: { type: Date },
//   cpf: { type: String, trim: true },
//   cartaoSUS: { type: String, trim: true },
//   nomeMae: { type: String, trim: true },
//   nomePai: { type: String, trim: true },
//   serieAno: { type: String, trim: true },
//   turma: { type: String, trim: true },
//   turno: { type: String, trim: true },
//   status: { type: String, trim: true },
//   transporte: { type: String, trim: true },
//   localidade: { type: String, trim: true },
  
//   // 🔥 CAMPOS ORIGINAIS CORRETOS do MongoDB
//   "Nome do Aluno": { type: String, trim: true },
//   "Data de Nasc.": { type: Date },
//   "Cartão do SUS": { type: String, trim: true },
//   "Série/Ano": { type: String, trim: true },
//   "Turma": { type: String, trim: true },
//   "Turno": { type: String, trim: true },
//   "Status": { type: String, trim: true },
//   "Transporte": { type: String, trim: true },
//   "Localidade": { type: String, trim: true }

// }, { 
//   timestamps: true,
//   strict: false // Permite campos extras
// });

// module.exports = mongoose.model('Student', StudentSchema);

const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  // Campos principais
  nome: { type: String, trim: true },
  dataNascimento: { type: Date },
  cpf: { type: String, trim: true },
  cartaoSUS: { type: String, trim: true },
  nomeMae: { type: String, trim: true },
  nomePai: { type: String, trim: true },
  serieAno: { type: String, trim: true },
  turma: { type: String, trim: true },
  turno: { type: String, trim: true },
  status: { 
    type: String, 
    trim: true,
    enum: ['Matriculado', 'Transferido', 'Concluído'],
    default: 'Matriculado'
  },
  transporte: { type: String, trim: true },
  localidade: { type: String, trim: true },
  
  // Notas e disciplinas por série
  notas: [{
    disciplina: { type: String, trim: true },
    serie: { type: String, trim: true },
    bimestre1: { type: Number, min: 0, max: 10 },
    bimestre2: { type: Number, min: 0, max: 10 },
    bimestre3: { type: Number, min: 0, max: 10 },
    bimestre4: { type: Number, min: 0, max: 10 },
    mediaFinal: { type: Number, min: 0, max: 10 },
    situacao: { 
      type: String, 
      enum: ['Aprovado', 'Reprovado', 'Em Recuperação'],
      default: 'Em Recuperação'
    }
  }],
  
  // Campos originais para compatibilidade
  "Nome do Aluno": { type: String, trim: true },
  "Data de Nasc.": { type: Date },
  "Cartão do SUS": { type: String, trim: true },
  "Série/Ano": { type: String, trim: true },
  "Turma": { type: String, trim: true },
  "Turno": { type: String, trim: true },
  "Status": { type: String, trim: true },
  "Transporte": { type: String, trim: true },
  "Localidade": { type: String, trim: true }

}, { 
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Student', StudentSchema);