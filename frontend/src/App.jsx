import React, { useEffect, useState, useCallback } from 'react';
import { fetchStudents, getStudent, updateStudent, deleteStudent, createStudent } from './api';
import DeclaracaoModal from './DeclaracaoModal';

// 🔥 COMPONENTES MOVIDOS PARA FORA DO COMPONENTE App

// Componente do Dashboard de Estatísticas
const StatsDashboard = ({ seriesStats, allStudents, dashboardLoading }) => {
  if (dashboardLoading) {
    return (
      <section className="stats-dashboard">
        <h3>📊 Distribuição por Série/Turma</h3>
        <div className="stats-loading">Carregando estatísticas...</div>
      </section>
    );
  }

  if (Object.keys(seriesStats).length === 0 || !seriesStats.totalGeral) return null;
  
  // Remover totalGeral das séries para ordenação
  const { totalGeral, ...seriesData } = seriesStats;

  // Ordenar séries numericamente
  const sortedSeries = Object.keys(seriesData).sort((a, b) => {
    if (a === 'Não informada') return 1;
    if (b === 'Não informada') return -1;
    const numA = parseInt(a) || 0;
    const numB = parseInt(b) || 0;
    return numA - numB;
  });

  return (
    <section className="stats-dashboard">
      <h3>📊 Distribuição por Série/Turma - Total: {totalGeral || allStudents.length} alunos</h3>
      <div className="stats-grid">
        {sortedSeries.map(serie => (
          <div key={serie} className="stat-card">
            <div className="stat-header">
              <span className="stat-title">
                {serie === 'Não informada' ? '❓' : '📚'} {serie}ª Série
              </span>
              <span className="stat-total">{seriesData[serie].count} alunos</span>
            </div>
            
            <div className="stat-turmas">
              {Object.entries(seriesData[serie].turmas)
                .sort(([turmaA], [turmaB]) => turmaA.localeCompare(turmaB))
                .map(([turma, count]) => (
                <div key={turma} className="turma-item">
                  <span className="turma-name">
                    {turma === 'Sem turma' ? '🏫 Geral' : `Turma ${turma}`}
                  </span>
                  <span className="turma-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Card de total geral */}
        <div className="stat-card total-card">
          <div className="stat-header">
            <span className="stat-title">👥 Total Geral</span>
            <span className="stat-total">{totalGeral || allStudents.length} alunos</span>
          </div>
          <div className="stat-turmas">
            <div className="turma-item">
              <span className="turma-name">Todas as séries</span>
              <span className="turma-count">{totalGeral || allStudents.length}</span>
            </div>
            <div className="turma-item">
              <span className="turma-name">Séries com dados</span>
              <span className="turma-count">{sortedSeries.length}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Função para obter ícones baseados na localidade
const getLocalidadeIcon = (localidade) => {
  const lowerLocalidade = localidade.toLowerCase();
  
  if (lowerLocalidade.includes('goiabeira')) return '🌳';
  if (lowerLocalidade.includes('oiticica')) return '🌿';
  if (lowerLocalidade.includes('centro')) return '🏢';
  if (lowerLocalidade.includes('vila')) return '🏘️';
  if (lowerLocalidade.includes('bairro')) return '🏡';
  if (lowerLocalidade.includes('rural')) return '🚜';
  if (lowerLocalidade.includes('multirão')) return '👥';
  if (lowerLocalidade.includes('não informada')) return '❓';
  
  return '📍';
};

// Componente do Dashboard de Localidades
const LocalidadeDashboard = ({ localidadeStats, seriesStats, allStudents, dashboardLoading }) => {
  if (dashboardLoading) {
    return (
      <section className="stats-dashboard localidade-dashboard">
        <h3>🏘️ Distribuição por Localidade</h3>
        <div className="stats-loading">Carregando estatísticas por localidade...</div>
      </section>
    );
  }

  if (Object.keys(localidadeStats).length === 0) return null;
    
  // Ordenar localidades por quantidade (maior primeiro)
  const sortedLocalidades = Object.keys(localidadeStats).sort((a, b) => {
    return localidadeStats[b].count - localidadeStats[a].count;
  });

  // Pegar as top localidades (máximo 8 para não ficar muito grande)
  const topLocalidades = sortedLocalidades.slice(0, 8);

  return (
    <section className="stats-dashboard localidade-dashboard">
      <h3>🏘️ Distribuição por Localidade</h3>
      <div className="stats-grid">
        {topLocalidades.map(localidade => (
          <div key={localidade} className="stat-card localidade-card">
            <div className="stat-header">
              <span className="stat-title">
                {getLocalidadeIcon(localidade)} {localidade}
              </span>
              <span className="stat-total">{localidadeStats[localidade].count} alunos</span>
            </div>
            
            <div className="stat-turmas">
              {Object.entries(localidadeStats[localidade].series)
                .sort(([serieA], [serieB]) => {
                  if (serieA === 'Não informada') return 1;
                  if (serieB === 'Não informada') return -1;
                  const numA = parseInt(serieA) || 0;
                  const numB = parseInt(serieB) || 0;
                  return numA - numB;
                })
                .map(([serie, count]) => (
                <div key={serie} className="turma-item">
                  <span className="turma-name">
                    {serie === 'Não informada' ? '📚 Geral' : `${serie}ª Série`}
                  </span>
                  <span className="turma-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Card de resumo das localidades */}
        <div className="stat-card total-card localidade-total">
          <div className="stat-header">
            <span className="stat-title">🗺️ Resumo Localidades</span>
            <span className="stat-total">{sortedLocalidades.length} locais</span>
          </div>
          <div className="stat-turmas">
            <div className="turma-item">
              <span className="turma-name">Total de alunos</span>
              <span className="turma-count">{seriesStats.totalGeral || allStudents.length}</span>
            </div>
            <div className="turma-item">
              <span className="turma-name">Localidades com dados</span>
              <span className="turma-count">{sortedLocalidades.length}</span>
            </div>
            <div className="turma-item">
              <span className="turma-name">Maior localidade</span>
              <span className="turma-count">
                {sortedLocalidades[0] ? `${localidadeStats[sortedLocalidades[0]].count} alunos` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 🔥 COMPONENTE App PRINCIPAL CORRIGIDO
export default function App() {
  // ✅ CORRETO: Todos os hooks DENTRO do componente
  const [showDeclaracaoModal, setShowDeclaracaoModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [seriesStats, setSeriesStats] = useState({});
  const [localidadeStats, setLocalidadeStats] = useState({});
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [documentType, setDocumentType] = useState('');
  
  // Estados para controlar visibilidade dos dashboards
  const [showSeriesDashboard, setShowSeriesDashboard] = useState(false);
  const [showLocalidadeDashboard, setShowLocalidadeDashboard] = useState(false);

  // Aluno vazio para criação
  const emptyStudent = {
    nome: '',
    dataNascimento: '',
    cpf: '',
    cartaoSUS: '',
    serieAno: '',
    turma: '',
    turno: '',
    status: '',
    transporte: '',
    localidade: ''
  };

  // Carregar TODOS os alunos para o dashboard
  const loadAllStudents = async () => {
    setDashboardLoading(true);
    try {
      const resp = await fetchStudents({ page: 1, limit: 1000, q: '' });
      setAllStudents(resp.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Carregar alunos com busca inteligente
  async function load(searchTerm = q) {
    setLoading(true);
    try {
      const resp = await fetchStudents({ page, limit, q: searchTerm });
      setStudents(resp.data || []);
      setTotal(resp.total || 0);
      setTotalPages(resp.totalPages || 0);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  // Calcular estatísticas com TODOS os alunos
  useEffect(() => {
    if (allStudents.length > 0) {
      const statsSeries = {};
      const statsLocalidades = {};
      let totalGeral = 0;
      
      allStudents.forEach(student => {
        const serie = student.serieAno?.toString().trim() || 'Não informada';
        const turma = student.turma?.toString().trim() || 'Sem turma';
        const localidade = student.localidade?.toString().trim() || 'Não informada';
        
        totalGeral++;
        
        // Estatística por série
        if (!statsSeries[serie]) {
          statsSeries[serie] = {
            count: 0,
            turmas: {}
          };
        }
        statsSeries[serie].count++;
        
        if (!statsSeries[serie].turmas[turma]) {
          statsSeries[serie].turmas[turma] = 0;
        }
        statsSeries[serie].turmas[turma]++;
        
        // Estatística por localidade
        if (!statsLocalidades[localidade]) {
          statsLocalidades[localidade] = {
            count: 0,
            series: {}
          };
        }
        statsLocalidades[localidade].count++;
        
        // Estatística por série dentro da localidade
        if (!statsLocalidades[localidade].series[serie]) {
          statsLocalidades[localidade].series[serie] = 0;
        }
        statsLocalidades[localidade].series[serie]++;
      });
      
      statsSeries.totalGeral = totalGeral;
      setSeriesStats(statsSeries);
      setLocalidadeStats(statsLocalidades);
    } else {
      setSeriesStats({});
      setLocalidadeStats({});
    }
  }, [allStudents]);

  // Carregar dados do dashboard na inicialização
  useEffect(() => {
    loadAllStudents();
    load();
  }, []);

  // Debounce para pesquisa
  const debouncedSearch = useCallback((searchTerm) => {
    const timer = setTimeout(() => {
      setPage(1);
      load(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (q !== '') {
      debouncedSearch(q);
    } else {
      setPage(1);
      load();
    }
  }, [q, debouncedSearch]);

  // Recarregar quando mudar página
  useEffect(() => { 
    if (q === '') {
      load();
    }
  }, [page]);

  // Recarregar dashboard após criar/editar/excluir
  const handleStudentChange = () => {
    loadAllStudents();
    load();
  };

  // Busca manual
  function handleSearch() {
    setPage(1);
    load();
  }

  // Abrir detalhes do aluno
  async function openDetail(id) {
    try {
      console.log('🔍 Buscando aluno ID:', id);
      const s = await getStudent(id);
      console.log('✅ Aluno carregado:', s);
      setSelected(s);
      setEditing(false);
      setCreating(false);
      setDocumentType(''); // Resetar tipo de documento
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes:', error);
      alert('Erro ao carregar detalhes do aluno: ' + error.message);
    }
  }

  // Salvar edição
  async function save() {
    if (!selected || !selected._id) {
      alert('Nenhum aluno selecionado para salvar');
      return;
    }
    try {
      console.log('💾 Salvando aluno:', selected);
      const res = await updateStudent(selected._id, selected);
      setSelected(res);
      setEditing(false);
      handleStudentChange();
      alert('Aluno atualizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert('Erro ao salvar alterações: ' + error.message);
    }
  }

  // Excluir aluno
  async function remove(id) {
    if (!id) {
      alert('ID do aluno não encontrado');
      return;
    }
    
    if (!window.confirm('Tem certeza que deseja excluir este aluno?')) return;
    
    try {
      console.log('🗑️ Excluindo aluno ID:', id);
      await deleteStudent(id);
      setSelected(null);
      handleStudentChange();
      alert('Aluno excluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao excluir:', error);
      alert('Erro ao excluir aluno: ' + error.message);
    }
  }

  // Criar novo aluno
  async function createNewStudent() {
    if (!selected) {
      alert('Preencha os dados do aluno');
      return;
    }

    // Validação básica no frontend
    if (!selected.nome || !selected.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      console.log('➕ Criando novo aluno:', selected);
      
      // Garantir que os dados estejam no formato correto
      const studentData = {
        ...selected,
        nome: selected.nome.trim(),
        dataNascimento: selected.dataNascimento || null,
        cpf: selected.cpf || '',
        serieAno: selected.serieAno || '',
        turma: selected.turma || '',
        localidade: selected.localidade || ''
      };

      const createdStudent = await createStudent(studentData);
      
      alert('Aluno criado com sucesso!');
      setCreating(false);
      setSelected(null);
      handleStudentChange();
      
    } catch (error) {
      console.error('❌ Erro ao criar aluno:', error);
      
      // Mensagem de erro mais amigável
      let errorMessage = 'Erro ao criar aluno';
      
      if (error.message.includes('400')) {
        errorMessage = 'Dados inválidos. Verifique os campos obrigatórios.';
      } else if (error.message.includes('CPF já cadastrado')) {
        errorMessage = 'CPF já está cadastrado no sistema.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
      } else {
        errorMessage = error.message || 'Erro desconhecido ao criar aluno';
      }
      
      alert(errorMessage);
    }
  }

  // Iniciar criação
  function startCreate() {
    setSelected({...emptyStudent});
    setCreating(true);
    setEditing(false);
    setDocumentType('');
  }

  // Cancelar criação
  function cancelCreate() {
    setCreating(false);
    setSelected(null);
    setDocumentType('');
  }

  // Gerar documentos
  function generateDocument(type) {
    if (!selected) {
      alert('Selecione um aluno primeiro');
      return;
    }

    setDocumentType(type);
    
    // Simular geração de documento
    const docContent = {
      declaração: `Declaração para ${selected.nome}`,
      boletim: `Boletim de ${selected.nome} - ${selected.serieAno}ª Série ${selected.turma}`,
      historico: `Histórico Escolar de ${selected.nome}`
    };

    const content = docContent[type];
    
    // Criar e baixar documento
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${type}_${selected.nome}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} gerado com sucesso!`);
  }

  // Pesquisas rápidas por série/turma
  function quickSearch(term) {
    setQ(term);
    setPage(1);
  }

  return (
    <div className="container">
      <header>
        <div>
          <h1>GEA (Gerencimanento Educacional e Administrativo)</h1>
          <h2>E. E. F. NAIR CUNHA DE AGUIAR</h2>
        </div>
        <div className="controls">
          <input 
            placeholder="Buscar por: nome, CPF, série, turma, localidade..." 
            value={q} 
            onChange={e => setQ(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Buscar</button>
          
          <button 
            onClick={startCreate}
            style={{ background: '#38a169', marginLeft: '8px' }}
          >
            + Novo Aluno
          </button>
          
          {/* Botões para mostrar/ocultar dashboards */}
          <button 
            onClick={() => setShowSeriesDashboard(!showSeriesDashboard)}
            style={{ 
              background: showSeriesDashboard ? '#ed8936' : '#4299e1', 
              marginLeft: '8px' 
            }}
          >
            {showSeriesDashboard ? '📊 Ocultar Séries' : '📊 Ver Séries'}
          </button>
          
          <button 
            onClick={() => setShowLocalidadeDashboard(!showLocalidadeDashboard)}
            style={{ 
              background: showLocalidadeDashboard ? '#ed8936' : '#48bb78', 
              marginLeft: '8px' 
            }}
          >
            {showLocalidadeDashboard ? '🏘️ Ocultar Localidades' : '🏘️ Ver Localidades'}
          </button>
          
          {q && (
            <button 
              onClick={() => {
                setQ('');
                setPage(1);
              }}
              style={{ marginLeft: '8px', background: '#718096' }}
            >
              Limpar
            </button>
          )}
        </div>
        
        {/* Pesquisas rápidas */}
        <div className="quick-search">
          <small>
            🔍 <strong>Pesquisas rápidas:</strong>
            <button onClick={() => quickSearch('8 A')} className="quick-btn">8° A</button>
            <button onClick={() => quickSearch('8 B')} className="quick-btn">8° B</button>
            <button onClick={() => quickSearch('8')} className="quick-btn">8° Ano</button>
            <button onClick={() => quickSearch('9 U')} className="quick-btn">9° U</button>
            <button onClick={() => quickSearch('2 U')} className="quick-btn">2° U</button>
          </small>
        </div>

        {!q && (
          <div className="search-tips">
            <small>
              💡 <strong>Dicas:</strong> 
              "2" (série) • "A" (turma) • "09565384366" (CPF) • "Goiabeira" (localidade) • "Ana" (nome) • "8 A" (série e turma)
            </small>
          </div>
        )}
      </header>

      {/* DASHBOARDS CONDICIONAIS - SÓ MOSTRAR SE O BOTÃO FOR CLICADO */}
      {showSeriesDashboard && (
        <StatsDashboard 
          seriesStats={seriesStats}
          allStudents={allStudents}
          dashboardLoading={dashboardLoading}
        />
      )}

      {showLocalidadeDashboard && (
        <LocalidadeDashboard 
          localidadeStats={localidadeStats}
          seriesStats={seriesStats}
          allStudents={allStudents}
          dashboardLoading={dashboardLoading}
        />
      )}

      {/* PAINEL DE DETALHES COMPLETO E CORRIGIDO */}
      <section className="detail-panel">
        {selected ? (
          <div className="detail-content">
            <h2>
              {creating ? 'Novo Aluno' : editing ? 'Editando Aluno' : 'Detalhes do Aluno'}
            </h2>
            
            {editing || creating ? (
              <div className="form">
                <label>
                  Nome:
                  <input 
                    value={selected.nome || ''} 
                    onChange={e => setSelected({...selected, nome: e.target.value})}
                  />
                </label>
                <label>
                  Data Nascimento:
                  <input 
                    type="date"
                    value={selected.dataNascimento ? new Date(selected.dataNascimento).toISOString().split('T')[0] : ''} 
                    onChange={e => setSelected({...selected, dataNascimento: e.target.value})}
                  />
                </label>
                <label>
                  CPF:
                  <input 
                    value={selected.cpf || ''} 
                    onChange={e => setSelected({...selected, cpf: e.target.value})}
                  />
                </label>
                <label>
                  Série/Ano:
                  <input 
                    value={selected.serieAno || ''} 
                    onChange={e => setSelected({...selected, serieAno: e.target.value})}
                  />
                </label>
                <label>
                  Turma:
                  <input 
                    value={selected.turma || ''} 
                    onChange={e => setSelected({...selected, turma: e.target.value})}
                  />
                </label>
                <label>
                  Localidade:
                  <input 
                    value={selected.localidade || ''} 
                    onChange={e => setSelected({...selected, localidade: e.target.value})}
                  />
                </label>
                
                <div className="actions">
                  {creating ? (
                    <>
                      <button onClick={createNewStudent}>Criar Aluno</button>
                      <button onClick={cancelCreate}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={save}>Salvar</button>
                      <button onClick={() => setEditing(false)}>Cancelar</button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="read">
                <div><strong>Nome:</strong> {selected.nome}</div>
                <div><strong>Data Nasc.:</strong> {selected.dataNascimento ? new Date(selected.dataNascimento).toLocaleDateString('pt-BR') : ''}</div>
                <div><strong>CPF:</strong> {selected.cpf}</div>
                <div><strong>Série/Ano:</strong> {selected.serieAno}</div>
                <div><strong>Turma:</strong> {selected.turma}</div>
                <div><strong>Localidade:</strong> {selected.localidade}</div>
                
                {/* Botões de documentos */}
                <div className="document-actions" style={{ margin: '15px 0', padding: '10px', background: '#f7fafc', borderRadius: '6px' }}>
                  <h4>📄 Gerar Documentos:</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setShowDeclaracaoModal(true)}
                      style={{ background: '#4299e1' }}
                    >
                      📝 Declaração
                    </button>

                    <button 
                      onClick={() => generateDocument('boletim')}
                      style={{ background: '#48bb78' }}
                    >
                      📊 Boletim
                    </button>
                    <button 
                      onClick={() => generateDocument('historico')}
                      style={{ background: '#ed8936' }}
                    >
                      📚 Histórico
                    </button>
                  </div>
                </div>
                
                <div className="actions">
                  <button onClick={() => setEditing(true)}>✏️ Editar</button>
                  <button onClick={() => remove(selected._id)} style={{background: '#e53e3e'}}>
                    🗑️ Excluir
                  </button>
                  <button onClick={() => setSelected(null)}>❌ Fechar</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-detail">
            {creating ? 'Preencha os dados do novo aluno' : 'Selecione um aluno para ver os detalhes'}
          </div>
        )}
      </section>

      <main>
        <section className="list">
          <div className="meta">
            <div>Total na busca: {total}</div>
            {q && <div>Filtro: "{q}"</div>}
            <div>
              Página {page} de {totalPages} — 
              <button 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >◀</button>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >▶</button>
            </div>
          </div>

          {loading ? (
            <div>Carregando...</div>
          ) : students.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>
              {q ? `Nenhum aluno encontrado para "${q}"` : 'Nenhum aluno cadastrado'}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Data Nasc.</th>
                  <th>CPF</th>
                  <th>Série</th>
                  <th>Turma</th>
                  <th>Localidade</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id || s.cpf}>
                    <td>{s.nome}</td>
                    <td>{s.dataNascimento ? new Date(s.dataNascimento).toLocaleDateString('pt-BR') : ''}</td>
                    <td>{s.cpf}</td>
                    <td>{s.serieAno}</td>
                    <td>{s.turma}</td>
                    <td>{s.localidade}</td>
                    <td>
                      <button onClick={() => openDetail(s._id)}>Abrir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* ✅ CORRETO: Modal FORA da tabela, no final do componente */}
      {showDeclaracaoModal && (
        <DeclaracaoModal 
          aluno={selected}
          onClose={() => setShowDeclaracaoModal(false)}
        />
      )}

      <footer>
        <small>API: http://localhost:4000/api/students</small>
      </footer>
    </div>
  );
}