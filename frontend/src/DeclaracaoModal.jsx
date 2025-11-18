import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import './DeclaracaoModal.css';

// Importe a imagem de background - ajuste o caminho conforme necessário
import backgroundImage from '../img/background.png';

const DeclaracaoModal = ({ aluno, onClose }) => {
  const [tipoDeclaracao, setTipoDeclaracao] = useState('vaga');
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const previewRef = useRef(null);

  const tiposDeclaracao = {
    vaga: {
      nome: 'Declaração de Vaga Disponível',
      template: (aluno) => {
        const dataNasc = aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '______/______/______';
        const serie = aluno.serieAno || '____';
        const turma = aluno.turma || '';
        
        return `Declaramos, para os devidos fins de prova e efeitos legais, que temos vaga no ${serie}º ano ${turma}, turnos manhã e tarde, para o(a) aluno(a) ${aluno.nome.toUpperCase()}, nascido(a) em ${dataNasc}.`;
      },
      adicional: `O referido é verdade e dou fé.`
    },
    matricula: {
      nome: 'Declaração de Matrícula',
      template: (aluno) => {
        const dataNasc = aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '______/______/______';
        const serie = aluno.serieAno || '____';
        const turma = aluno.turma || '';
        
        return `Declaramos, para os devidos fins, que ${aluno.nome}, nascido(a) em ${dataNasc}, encontra-se regularmente matriculado(a) no ${serie}º ano ${turma} do Ensino Fundamental ${parseInt(serie) <= 5 ? 'I' : 'II'} desta instituição de ensino.`;
      },
      adicional: `Documento válido para comprovação de matrícula junto aos órgãos competentes.`
    },
    transferencia: {
      nome: 'Declaração de Transferência',
      template: (aluno) => {
        const dataNasc = aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '______/______/______';
        const serie = aluno.serieAno || '____';
        const turma = aluno.turma || '';
        
        return `Declaramos que ${aluno.nome}, nascido(a) em ${dataNasc}, está regularmente matriculado(a) no ${serie}º ano ${turma} e solicita transferência para outra instituição de ensino.`;
      },
      adicional: `Atestamos a regularidade de sua situação escolar para fins de transferência.`
    },
    frequencia: {
      nome: 'Declaração de Frequência',
      template: (aluno) => {
        const serie = aluno.serieAno || '____';
        const turma = aluno.turma || '';
        const turno = aluno.turno || '_______';
        
        return `Certificamos que ${aluno.nome} frequenta regularmente as aulas no ${serie}º ano ${turma}, turno ${turno}, desta instituição de ensino, estando em dia com suas obrigações escolares.`;
      },
      adicional: `Documento válido para comprovação de frequência escolar.`
    }
  };

  // Função para adicionar background ao PDF
  const addBackgroundToPDF = (doc) => {
    // Carrega a imagem de background e a adiciona ao PDF
    doc.addImage(backgroundImage, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
  };

  const gerarPDF = (download = false) => {
    const doc = new jsPDF("portrait", "pt", "a4");
    const largura = doc.internal.pageSize.getWidth();
    const altura = doc.internal.pageSize.getHeight();

    // 🔥 ADICIONA O BACKGROUND PERSONALIZADO
    addBackgroundToPDF(doc);

    // Configurações de fonte e cor para texto sobre o background
    doc.setFont("Times", "Normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0); // Preto para melhor contraste

    // Texto principal da declaração (posicionado abaixo do cabeçalho do background)
    const template = tiposDeclaracao[tipoDeclaracao].template(aluno);
    const linhas = doc.splitTextToSize(template, largura - 100); // Margens laterais
    
    // Posição Y ajustada para ficar abaixo do cabeçalho do background
    let posicaoY = 280;
    
    // Adiciona o texto principal
    linhas.forEach(linha => {
      doc.text(linha, 50, posicaoY);
      posicaoY += 20;
    });

    // Texto adicional específico do tipo de declaração
    posicaoY += 20;
    const adicional = tiposDeclaracao[tipoDeclaracao].adicional;
    const linhasAdicional = doc.splitTextToSize(adicional, largura - 100);
    
    linhasAdicional.forEach(linha => {
      doc.text(linha, 50, posicaoY);
      posicaoY += 20;
    });

    // Data e local (posicionado acima da assinatura do background)
    const hoje = new Date().toLocaleDateString('pt-BR');
    doc.text(`Oiticica, Frecheirinha/CE, ${hoje}.`, 50, 650);

    if (download) {
      doc.save(`Declaracao_${tipoDeclaracao}_${aluno.nome.replace(/\s+/g, '_')}.pdf`);
      alert('Declaração baixada com sucesso!');
    } else {
      // Criar URL para preview
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setMostrarPreview(true);
    }
  };

  // Função para visualizar o PDF com background antes de gerar
  const visualizarComBackground = () => {
    const doc = new jsPDF("portrait", "pt", "a4");
    
    // Adiciona o background
    addBackgroundToPDF(doc);
    
    // Adiciona texto de preview
    doc.setFont("Times", "Normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Pré-visualização: ${tiposDeclaracao[tipoDeclaracao].nome}`, 50, 50);
    doc.text(`Aluno: ${aluno.nome}`, 50, 70);
    doc.text(`Série: ${aluno.serieAno}º ano ${aluno.turma}`, 50, 90);
    
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    setMostrarPreview(true);
  };

  const compartilharWhatsApp = () => {
    const texto = `Declaração de ${tiposDeclaracao[tipoDeclaracao].nome} - ${aluno.nome}`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const compartilharEmail = () => {
    const assunto = `Declaração - ${aluno.nome}`;
    const corpo = `Segue em anexo a declaração de ${tiposDeclaracao[tipoDeclaracao].nome} para ${aluno.nome}.`;
    const mailto = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = mailto;
  };

  if (!aluno) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {!mostrarPreview ? (
          <>
            <h2>📄 Gerar Declaração com Background Oficial</h2>
            
            <div className="aluno-info">
              <h3>Aluno: {aluno.nome}</h3>
              <p>Série/Turma: {aluno.serieAno}º ano {aluno.turma}</p>
              {aluno.dataNascimento && (
                <p>Nascimento: {new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')}</p>
              )}
            </div>

            <div className="tipo-selecao">
              <label>Tipo de Declaração:</label>
              <select 
                value={tipoDeclaracao} 
                onChange={(e) => setTipoDeclaracao(e.target.value)}
              >
                <option value="vaga">✅ Vaga Disponível</option>
                <option value="matricula">📝 Matrícula</option>
                <option value="transferencia">🔄 Transferência</option>
                <option value="frequencia">📊 Frequência</option>
              </select>
            </div>

            <div className="preview-texto">
              <h4>📋 Texto da Declaração:</h4>
              <div className="texto-preview">
                <div className="background-notice">
                  <strong>⚠️ Background Oficial Incluído:</strong> 
                  Cabeçalho completo, rodapé com assinatura da diretora "Voltília Maria Costa" e informações institucionais.
                </div>
                {tiposDeclaracao[tipoDeclaracao].template(aluno).split('\n').map((linha, i) => (
                  <p key={i}>{linha}</p>
                ))}
                <p className="texto-adicional">{tiposDeclaracao[tipoDeclaracao].adicional}</p>
              </div>
            </div>

            <div className="background-preview">
              <h4>🎨 Visualização do Background:</h4>
              <div className="background-image">
                <img 
                  src={backgroundImage} 
                  alt="Background Oficial da Declaração" 
                  style={{maxWidth: '100%', border: '1px solid #ddd', borderRadius: '4px'}}
                />
                <div className="background-info">
                  <small>Modelo oficial com cabeçalho institucional e assinatura da diretora</small>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-preview"
                onClick={() => gerarPDF(false)}
              >
                👁️ Ver Preview Completo
              </button>
              <button 
                className="btn-download"
                onClick={() => gerarPDF(true)}
              >
                ⬇️ Baixar PDF com Background
              </button>
              <button className="btn-cancel" onClick={onClose}>
                ❌ Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>👁️ Preview da Declaração - Background Oficial</h2>
            
            <div className="pdf-preview">
              <iframe 
                src={pdfUrl} 
                width="100%" 
                height="500"
                title="Preview da Declaração com Background"
                ref={previewRef}
              />
            </div>

            <div className="preview-info">
              <p><strong>✅ Background Incluído:</strong> Cabeçalho institucional, informações da escola e assinatura da diretora "Voltília Maria Costa"</p>
            </div>

            <div className="preview-actions">
              <button 
                className="btn-download"
                onClick={() => gerarPDF(true)}
              >
                ⬇️ Baixar PDF
              </button>
              <button 
                className="btn-print"
                onClick={() => {
                  const iframe = previewRef.current;
                  iframe.contentWindow.print();
                }}
              >
                🖨️ Imprimir
              </button>
              <button 
                className="btn-whatsapp"
                onClick={compartilharWhatsApp}
              >
                📱 WhatsApp
              </button>
              <button 
                className="btn-email"
                onClick={compartilharEmail}
              >
                📧 Email
              </button>
              <button 
                className="btn-back"
                onClick={() => setMostrarPreview(false)}
              >
                ↩️ Voltar para Edição
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeclaracaoModal;