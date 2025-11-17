const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  // Novos campos padronizados
  nome: { type: String, trim: true },
  dataNascimento: { type: Date },
  cpf: { type: String, trim: true },
  cartaoSUS: { type: String, trim: true },
  nomeMae: { type: String, trim: true },
  nomePai: { type: String, trim: true },
  serieAno: { type: String, trim: true },
  turma: { type: String, trim: true },
  turno: { type: String, trim: true },
  status: { type: String, trim: true },
  transporte: { type: String, trim: true },
  localidade: { type: String, trim: true },
  
  // 🔥 CAMPOS ORIGINAIS CORRETOS do MongoDB
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
  strict: false // Permite campos extras
});

module.exports = mongoose.model('Student', StudentSchema);