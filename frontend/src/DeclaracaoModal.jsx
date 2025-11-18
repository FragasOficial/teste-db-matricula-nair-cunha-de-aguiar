import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import './DeclaracaoModal.css';

// 🔥 CORREÇÃO: Use caminho público
const backgroundImage = '/img/background.png';

const DeclaracaoModal = ({ aluno, onClose }) => {
  const [tipoDeclaracao, setTipoDeclaracao] = useState('vaga');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfGerado, setPdfGerado] = useState(false);
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

  // Função para carregar a imagem e adicionar ao PDF
  const addBackgroundToPDF = (doc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        doc.addImage(img, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
        resolve();
      };
      img.onerror = () => {
        console.warn('Background não carregado, gerando declaração sem background');
        resolve();
      };
      img.src = backgroundImage;
    });
  };

  const gerarPDF = async (download = false) => {
    const doc = new jsPDF("portrait", "pt", "a4");
    const largura = doc.internal.pageSize.getWidth();
    const altura = doc.internal.pageSize.getHeight();

    try {
      // 🔥 ADICIONA O BACKGROUND PERSONALIZADO
      await addBackgroundToPDF(doc);
    } catch (error) {
      console.warn('Erro ao carregar background:', error);
    }

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
      alert('✅ Declaração baixada com sucesso!');
    } else {
      // Criar URL para preview
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setPdfGerado(true);
    }
  };

  // 🔥 COMPARTILHAMENTO DIRETO - SISTEMA ANTERIOR
  const compartilharWhatsApp = () => {
    if (!pdfGerado) {
      alert('⚠️ Gere a declaração primeiro antes de compartilhar!');
      return;
    }

    const texto = `📄 *Declaração Escolar - ${tiposDeclaracao[tipoDeclaracao].nome}*\n\n` +
                 `👤 *Aluno:* ${aluno.nome}\n` +
                 `📚 *Série/Turma:* ${aluno.serieAno}º ano ${aluno.turma}\n` +
                 `🏫 *Escola:* E.E.F. Nair Cunha de Aguiar\n\n` +
                 `_Declaração gerada em ${new Date().toLocaleDateString('pt-BR')}_`;

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const compartilharEmail = () => {
    if (!pdfGerado) {
      alert('⚠️ Gere a declaração primeiro antes de compartilhar!');
      return;
    }

    const assunto = `📄 Declaração Escolar - ${aluno.nome}`;
    const corpo = `Prezado(a),\n\nSegue em anexo a declaração escolar solicitada:\n\n` +
                  `🔸 *Tipo:* ${tiposDeclaracao[tipoDeclaracao].nome}\n` +
                  `🔸 *Aluno:* ${aluno.nome}\n` +
                  `🔸 *Série/Turma:* ${aluno.serieAno}º ano ${aluno.turma}\n` +
                  `🔸 *Data de Emissão:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
                  `Atenciosamente,\nE.E.F. Nair Cunha de Aguiar\nSítio Oiticica, Frecheirinha-CE`;

    const mailto = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = mailto;
  };

  const baixarPDF = () => {
    if (!pdfGerado) {
      alert('⚠️ Gere a declaração primeiro antes de baixar!');
      return;
    }
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Declaracao_${tipoDeclaracao}_${aluno.nome.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('✅ Declaração baixada com sucesso!');
  };

  const imprimirPDF = () => {
    if (!pdfGerado) {
      alert('⚠️ Gere a declaração primeiro antes de imprimir!');
      return;
    }

    const iframe = previewRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  if (!aluno) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>📄 Gerar Declaração com Background Oficial</h2>
        
        <div className="aluno-info">
          <h3>👤 Aluno: {aluno.nome}</h3>
          <p>📚 Série/Turma: {aluno.serieAno}º ano {aluno.turma}</p>
          {aluno.dataNascimento && (
            <p>🎂 Nascimento: {new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')}</p>
          )}
        </div>

        <div className="tipo-selecao">
          <label>📋 Tipo de Declaração:</label>
          <select 
            value={tipoDeclaracao} 
            onChange={(e) => {
              setTipoDeclaracao(e.target.value);
              setPdfGerado(false); // Reseta o PDF quando mudar o tipo
            }}
          >
            <option value="vaga">✅ Vaga Disponível</option>
            <option value="matricula">📝 Matrícula</option>
            <option value="transferencia">🔄 Transferência</option>
            <option value="frequencia">📊 Frequência</option>
          </select>
        </div>

        <div className="preview-texto">
          <h4>📝 Texto da Declaração:</h4>
          <div className="texto-preview">
            <div className="background-notice">
              <strong>🎨 Background Oficial Incluído:</strong> 
              Cabeçalho completo, rodapé com assinatura da diretora "Voltília Maria Costa" e informações institucionais.
            </div>
            {tiposDeclaracao[tipoDeclaracao].template(aluno).split('\n').map((linha, i) => (
              <p key={i}>{linha}</p>
            ))}
            <p className="texto-adicional">{tiposDeclaracao[tipoDeclaracao].adicional}</p>
          </div>
        </div>

        <div className="background-preview">
          <h4>🏫 Visualização do Background:</h4>
          <div className="background-image">
            <img 
              src={backgroundImage} 
              alt="Background Oficial da Declaração" 
              style={{maxWidth: '100%', border: '1px solid #ddd', borderRadius: '4px', maxHeight: '200px'}}
              onError={(e) => {
                e.target.style.display = 'none';
                document.querySelector('.background-info').innerHTML = 
                  '<small>⚠️ Background não carregado. Certifique-se de que o arquivo background.png está na pasta public/img/</small>';
              }}
            />
            <div className="background-info">
              <small>Modelo oficial com cabeçalho institucional e assinatura da diretora "Voltília Maria Costa"</small>
            </div>
          </div>
        </div>

        {/* 🔥 AÇÕES PRINCIPAIS - GERAR DECLARAÇÃO */}
        <div className="modal-actions">
          <button 
            className="btn-preview"
            onClick={() => gerarPDF(false)}
            disabled={pdfGerado}
          >
            {pdfGerado ? '✅ Declaração Gerada' : '👁️ Gerar Declaração'}
          </button>
          
          <button className="btn-cancel" onClick={onClose}>
            ❌ Fechar
          </button>
        </div>

        {/* 🔥 AÇÕES DE COMPARTILHAMENTO - APÓS GERAR PDF */}
        {pdfGerado && (
          <div className="share-section">
            <h4>📤 Compartilhar Declaração:</h4>
            
            <div className="pdf-preview">
              <iframe 
                src={pdfUrl} 
                width="100%" 
                height="400"
                title="Preview da Declaração com Background"
                ref={previewRef}
                style={{border: '1px solid #ddd', borderRadius: '8px'}}
              />
            </div>

            <div className="preview-info">
              <p>
                <strong>✅ Declaração Gerada com Sucesso!</strong><br/>
                Agora você pode baixar, imprimir ou compartilhar a declaração.
              </p>
            </div>

            <div className="share-actions">
              <button 
                className="btn-download"
                onClick={baixarPDF}
              >
                ⬇️ Baixar PDF
              </button>
              
              <button 
                className="btn-print"
                onClick={imprimirPDF}
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
                className="btn-regenerate"
                onClick={() => {
                  setPdfGerado(false);
                  setPdfUrl('');
                }}
              >
                🔄 Gerar Outra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeclaracaoModal;