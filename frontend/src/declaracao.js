import jsPDF from "jspdf";

export function gerarDeclaracaoRapida(aluno) {
  // Função original para compatibilidade
  const doc = new jsPDF("portrait", "pt", "a4");
  // ... código existente ...
  doc.save(`Declaracao_${aluno.nome}.pdf`);
}