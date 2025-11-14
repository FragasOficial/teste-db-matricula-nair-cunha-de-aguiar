const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  dataNascimento: { type: Date },
  cpf: { type: String },
  cartaoSUS: { type: String },
  nomeMae: { type: String },
  nomePai: { type: String },
  serieAno: { type: String },
  turma: { type: String },
  turno: { type: String },
  status: { type: String },
  transporte: { type: String },
  localidade: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
