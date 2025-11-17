import React, { useEffect, useState, useCallback } from 'react';
import { fetchStudents, getStudent, updateStudent, deleteStudent, createStudent } from './api';

export default function App() {
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // 🔥 NOVO: Todos os alunos para o dashboard
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
  const [dashboardLoading, setDashboardLoading] = useState(false); // 🔥 NOVO: Loading do dashboard

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

  // 🔥 NOVO: Carregar TODOS os alunos para o dashboard
  const loadAllStudents = async () => {
    setDashboardLoading(true);
    try {
      const resp = await fetchStudents({ page: 1, limit: 1000, q: '' }); // Busca todos
      setAllStudents(resp.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Carregar alunos (filtrados)
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

  // 🔥 ATUALIZADO: Calcular estatísticas com TODOS os alunos
  useEffect(() => {
    if (allStudents.length > 0) {
      const stats = {};
      let totalGeral = 0;
      
      allStudents.forEach(student => {
        const serie = student.serieAno?.toString().trim() || 'Não informada';
        const turma = student.turma?.toString().trim() || 'Sem turma';
        
        totalGeral++;
        
        // Estatística por série
        if (!stats[serie]) {
          stats[serie] = {
            count: 0,
            turmas: {}
          };
        }
        stats[serie].count++;
        
        // Estatística por turma dentro da série
        if (!stats[serie].turmas[turma]) {
          stats[serie].turmas[turma] = 0;
        }
        stats[serie].turmas[turma]++;
      });
      
      // Adicionar total geral às estatísticas
      stats.totalGeral = totalGeral;
      setSeriesStats(stats);
    } else {
      setSeriesStats({});
    }
  }, [allStudents]);

  // 🔥 NOVO: Carregar dados do dashboard na inicialização
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

  // 🔥 ATUALIZADO: Recarregar dashboard após criar/editar/excluir
  const handleStudentChange = () => {
    loadAllStudents(); // Atualiza o dashboard
    load(); // Atualiza a lista
  };

  // Busca manual
  function handleSearch() {
    setPage(1);
    load();
  }

  // Abrir detalhes do aluno
  async function openDetail(id) {
    try {
      const s = await getStudent(id);
      setSelected(s);
      setEditing(false);
      setCreating(false);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      alert('Erro ao carregar detalhes do aluno');
    }
  }

  // 🔥 ATUALIZADO: Salvar edição
  async function save() {
    if (!selected || !selected._id) return;
    try {
      const res = await updateStudent(selected._id, selected);
      setSelected(res);
      setEditing(false);
      handleStudentChange(); // 🔥 Atualiza dashboard
      alert('Aluno atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações');
    }
  }

  // 🔥 ATUALIZADO: Excluir aluno
  async function remove(id) {
    if (!window.confirm('Tem certeza que deseja excluir este aluno?')) return;
    try {
      await deleteStudent(id);
      setSelected(null);
      handleStudentChange(); // 🔥 Atualiza dashboard
      alert('Aluno excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir aluno');
    }
  }

  // 🔥 ATUALIZADO: Criar novo aluno
  async function createNewStudent() {
    try {
      await createStudent(selected);
      alert('Aluno criado com sucesso!');
      setCreating(false);
      setSelected(null);
      handleStudentChange(); // 🔥 Atualiza dashboard
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      alert('Erro ao criar aluno');
    }
  }

  // Iniciar criação
  function startCreate() {
    setSelected({...emptyStudent});
    setCreating(true);
    setEditing(false);
  }

  // Cancelar criação
  function cancelCreate() {
    setCreating(false);
    setSelected(null);
  }

  // Componente do Dashboard de Estatísticas
  const StatsDashboard = () => {
    if (dashboardLoading) {
      return (
        <section className="stats-dashboard">
          <h3>📊 Distribuição por Série/Turma</h3>
          <div className="stats-loading">Carregando estatísticas...</div>
        </section>
      );
    }

    if (Object.keys(seriesStats).length === 0) return null;
    
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

  return (
    <div className="container">
      <header>
        <h1>Alunos NCA</h1>
        <div className="controls">
          <input 
            placeholder="Buscar por: nome, CPF, série, turma..." 
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
        
        {!q && (
          <div className="search-tips">
            <small>
              💡 <strong>Dicas:</strong> 
              "2" (série) • "A" (turma) • "09565384366" (CPF) • "Goiabeira" (localidade) • "Ana" (nome)
            </small>
          </div>
        )}
      </header>

      {/* 🔥 ATUALIZADO: Dashboard de estatísticas com dados completos */}
      <StatsDashboard />

      {/* Resto do código permanece igual */}
      <section className="detail-panel">
        {/* ... código existente do detail-panel ... */}
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

      <footer>
        <small>API: http://localhost:4000/api/students</small>
      </footer>
    </div>
  );
}