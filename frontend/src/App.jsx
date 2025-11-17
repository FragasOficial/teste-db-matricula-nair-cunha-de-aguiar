import React, { useEffect, useState, useCallback } from 'react';
import { fetchStudents, getStudent, updateStudent, deleteStudent, createStudent } from './api';

export default function App() {
  const [students, setStudents] = useState([]);
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

  // Carregar alunos
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

  // Calcular estatísticas quando os alunos mudarem
  useEffect(() => {
    if (students.length > 0) {
      const stats = {};
      
      students.forEach(student => {
        const serie = student.serieAno || 'Não informada';
        const turma = student.turma || 'Sem turma';
        
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
      
      setSeriesStats(stats);
    } else {
      setSeriesStats({});
    }
  }, [students]);

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

  // Salvar edição
  async function save() {
    if (!selected || !selected._id) return;
    try {
      const res = await updateStudent(selected._id, selected);
      setSelected(res);
      setEditing(false);
      load();
      alert('Aluno atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações');
    }
  }

  // Excluir aluno
  async function remove(id) {
    if (!window.confirm('Tem certeza que deseja excluir este aluno?')) return;
    try {
      await deleteStudent(id);
      setSelected(null);
      load();
      alert('Aluno excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir aluno');
    }
  }

  // Criar novo aluno
  async function createNewStudent() {
    try {
      await createStudent(selected);
      alert('Aluno criado com sucesso!');
      setCreating(false);
      setSelected(null);
      load();
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
    if (Object.keys(seriesStats).length === 0) return null;
    
    // Ordenar séries numericamente
    const sortedSeries = Object.keys(seriesStats).sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numA - numB;
    });

    return (
      <section className="stats-dashboard">
        <h3>📊 Distribuição por Série/Turma</h3>
        <div className="stats-grid">
          {sortedSeries.map(serie => (
            <div key={serie} className="stat-card">
              <div className="stat-header">
                <span className="stat-title">
                  {serie === 'Não informada' ? '❓' : '📚'} {serie}
                </span>
                <span className="stat-total">{seriesStats[serie].count} alunos</span>
              </div>
              
              <div className="stat-turmas">
                {Object.entries(seriesStats[serie].turmas).map(([turma, count]) => (
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
              <span className="stat-total">{total} alunos</span>
            </div>
            <div className="stat-turmas">
              <div className="turma-item">
                <span className="turma-name">Todas as séries</span>
                <span className="turma-count">{total}</span>
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

      {/* 🔥 NOVO: Dashboard de estatísticas */}
      <StatsDashboard />

      {/* 🔥 PAINEL DE DETALHES */}
      <section className="detail-panel">
        {selected ? (
          <div className="detail-content">
            <h2>{creating ? 'Novo Aluno' : 'Detalhes do Aluno'}</h2>
            
            {creating ? (
              // Formulário de criação
              <div className="form">
                <label>
                  Nome *
                  <input 
                    value={selected.nome || ''} 
                    onChange={e => setSelected({...selected, nome: e.target.value})}
                    placeholder="Digite o nome completo"
                  />
                </label>
                
                <label>
                  Data Nasc.
                  <input 
                    type="date"
                    value={selected.dataNascimento || ''}
                    onChange={e => setSelected({...selected, dataNascimento: e.target.value})}
                  />
                </label>
                
                <label>
                  CPF
                  <input 
                    value={selected.cpf || ''} 
                    onChange={e => setSelected({...selected, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </label>
                
                <label>
                  Cartão SUS
                  <input 
                    value={selected.cartaoSUS || ''} 
                    onChange={e => setSelected({...selected, cartaoSUS: e.target.value})}
                    placeholder="Número do cartão SUS"
                  />
                </label>
                
                <label>
                  Série/Ano
                  <input 
                    value={selected.serieAno || ''} 
                    onChange={e => setSelected({...selected, serieAno: e.target.value})}
                    placeholder="Ex: 8, 1, 4"
                  />
                </label>
                
                <label>
                  Turma
                  <input 
                    value={selected.turma || ''} 
                    onChange={e => setSelected({...selected, turma: e.target.value})}
                    placeholder="Ex: A, B, U"
                  />
                </label>
                
                <label>
                  Localidade
                  <input 
                    value={selected.localidade || ''} 
                    onChange={e => setSelected({...selected, localidade: e.target.value})}
                    placeholder="Ex: Goiabeira, Oiticica"
                  />
                </label>
                
                <div className="actions">
                  <button 
                    onClick={createNewStudent}
                    disabled={!selected.nome.trim()}
                    style={{ background: '#38a169' }}
                  >
                    Criar Aluno
                  </button>
                  <button onClick={cancelCreate}>Cancelar</button>
                </div>
              </div>
            ) : !editing ? (
              // Modo leitura
              <div className="read">
                <div><strong>Nome:</strong> {selected.nome}</div>
                <div><strong>CPF:</strong> {selected.cpf}</div>
                <div><strong>Cartão SUS:</strong> {selected.cartaoSUS}</div>
                <div><strong>Data Nasc.:</strong> {selected.dataNascimento ? new Date(selected.dataNascimento).toLocaleDateString('pt-BR') : ''}</div>
                <div><strong>Série/Ano:</strong> {selected.serieAno}</div>
                <div><strong>Turma:</strong> {selected.turma}</div>
                <div><strong>Localidade:</strong> {selected.localidade}</div>
                <div className="actions">
                  <button onClick={() => setEditing(true)}>Editar</button>
                  <button onClick={() => remove(selected._id)}>Excluir</button>
                  <button onClick={() => setSelected(null)}>Fechar</button>
                </div>
              </div>
            ) : (
              // Modo edição
              <div className="form">
                <label>Nome<input value={selected.nome || ''} onChange={e => setSelected({...selected, nome: e.target.value})} /></label>
                <label>CPF<input value={selected.cpf || ''} onChange={e => setSelected({...selected, cpf: e.target.value})} /></label>
                <label>Localidade<input value={selected.localidade || ''} onChange={e => setSelected({...selected, localidade: e.target.value})} /></label>
                <div className="actions">
                  <button onClick={save}>Salvar</button>
                  <button onClick={() => setEditing(false)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-detail">
            <p>Selecione um aluno para ver detalhes</p>
          </div>
        )}
      </section>

      {/* LISTA DE ALUNOS */}
      <main>
        <section className="list">
          <div className="meta">
            <div>Total: {total}</div>
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