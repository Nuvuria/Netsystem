import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import './Clientes.css';
import '../GlobalLayout.css';

  function Clientes() {
    // const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
  const [planosDisponiveis, setPlanosDisponiveis] = useState([]);
  const [novoCliente, setNovoCliente] = useState({
    id: '',
    nome: '',
    numeroTelefone: '',
    endereco: '',
    plano: '',
    vencimento: '',
    cpf: '',
    status: ''
  });
  
  // States para Planos
  const [showPlanoForm, setShowPlanoForm] = useState(false);
  const [novoPlano, setNovoPlano] = useState({ nome: '', valor: '', descricao: '' });

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/clientes`;
  const PLANOS_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/planos`;

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchClientes();
    fetchPlanos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPlanos = async () => {
    try {
        const res = await fetch(PLANOS_URL, { headers: getHeaders() });
        if (res.ok) {
            const data = await res.json();
            console.log('Planos carregados:', data);
            setPlanosDisponiveis(data);
        } else {
            console.error('Erro ao buscar planos:', res.statusText);
        }
    } catch (error) {
        console.error("Erro ao buscar planos:", error);
    }
  };

  const handleSalvarPlano = async (e) => {
      e.preventDefault();
      if (!novoPlano.nome || !novoPlano.valor) return alert('Nome e Valor são obrigatórios');

      try {
          const res = await fetch(PLANOS_URL, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(novoPlano)
          });

          if (res.ok) {
              setShowPlanoForm(false);
              setNovoPlano({ nome: '', valor: '', descricao: '' });
              fetchPlanos();
              alert('Plano salvo com sucesso!');
          } else {
              alert('Erro ao salvar plano');
          }
      } catch (error) {
          console.error(error);
          alert('Erro ao conectar com o servidor');
      }
  };

  const handleExcluirPlano = async (id) => {
      if (!window.confirm('Tem certeza que deseja excluir este plano?')) return;

      try {
          const res = await fetch(`${PLANOS_URL}/${id}`, {
              method: 'DELETE',
              headers: getHeaders()
          });

          if (res.ok) {
              fetchPlanos();
          } else {
              alert('Erro ao excluir plano');
          }
      } catch (error) {
          console.error(error);
      }
  };

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, { headers: getHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) {
        setClientes(data);
      } else {
        setClientes([]);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoCliente({ ...novoCliente, [name]: value });
  };

  const handleSalvarCliente = async (e) => {
    e.preventDefault();
    // Validacao basica
    if (!novoCliente.numeroTelefone) {
      alert('Número de telefone é obrigatório!');
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(novoCliente)
      });

      if (res.ok) {
        alert('Cliente salvo com sucesso!');
        closeModal();
        fetchClientes();
      } else {
        const data = await res.json();
        alert(`Erro ao salvar: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro de conexão ao salvar cliente.');
    }
  };

  const handleExcluirCliente = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchClientes();
      } else {
        alert('Erro ao excluir cliente.');
      }
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      
      const getValue = (key) => {
        const regex = new RegExp(`${key}:\\s*(.*)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
      };

      const nome = getValue('Nome completo');
      const cpf = getValue('CPF');
      const telefone = getValue('Telefone');
      const endereco = getValue('Endereço');
      const plano = getValue('Plano');
      const vencimento = getValue('Dia do vencimento');
      const status = getValue('Status');

      if (!nome && !telefone) {
        alert('Formato inválido ou área de transferência vazia.');
        return;
      }

      setNovoCliente({
        id: '',
        nome: nome || '',
        numeroTelefone: telefone || '',
        endereco: endereco || '',
        plano: plano || '',
        vencimento: vencimento || '',
        cpf: cpf || '',
        status: status || 'Pendente'
      });
      
      setIsModalOpen(true);
      
    } catch (err) {
      console.error('Erro ao ler área de transferência:', err);
      alert('Não foi possível acessar a área de transferência. Verifique as permissões.');
    }
  };

  const handleEditar = (cliente) => {
    setNovoCliente({
        id: cliente.id,
        nome: cliente.nome || '',
        numeroTelefone: cliente.numeroTelefone || '',
        endereco: cliente.endereco || '',
        plano: cliente.plano || '',
        vencimento: cliente.vencimento ? String(cliente.vencimento) : '',
        cpf: cliente.cpf || '',
        status: cliente.status || ''
    });
    setIsModalOpen(true);
  };

  const openModal = () => {
      setNovoCliente({
        id: '',
        nome: '',
        numeroTelefone: '',
        endereco: '',
        plano: '',
        vencimento: '',
        cpf: '',
        status: ''
      });
      setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
  };

  return (
      <div className="clientes-container">
        
        {/* Modal de Formulário */}
        {isModalOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>{novoCliente.id ? 'Editar Cliente' : 'Cadastrar Cliente'}</h3>
                        <button onClick={closeModal} className="close-modal-btn">&times;</button>
                    </div>
                    <form onSubmit={handleSalvarCliente} className="cliente-form">
                        <div className="form-group">
                            <label>Nome:</label>
                            <input
                                type="text"
                                name="nome"
                                value={novoCliente.nome}
                                onChange={handleChange}
                                placeholder="Nome completo"
                            />
                        </div>
                        <div className="form-group">
                            <label>Telefone:</label>
                            <input
                                type="text"
                                name="numeroTelefone"
                                value={novoCliente.numeroTelefone}
                                onChange={handleChange}
                                placeholder="Apenas números"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>CPF:</label>
                            <input
                                type="text"
                                name="cpf"
                                value={novoCliente.cpf}
                                onChange={handleChange}
                                placeholder="000.000.000-00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Endereço:</label>
                            <input
                                type="text"
                                name="endereco"
                                value={novoCliente.endereco}
                                onChange={handleChange}
                                placeholder="Endereço completo"
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Plano:</label>
                                <select
                                    name="plano"
                                    value={novoCliente.plano}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '5px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--surface-color)',
                                        color: 'var(--text-color)',
                                        marginBottom: '10px'
                                    }}
                                >
                                    <option value="">Selecione um plano</option>
                                    {planosDisponiveis.map(plano => (
                                        <option key={plano.id} value={`${plano.nome} - R$ ${plano.valor.toFixed(2)}`}>
                                            {plano.nome} - R$ {plano.valor.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Vencimento (Dia):</label>
                                <select
                                    name="vencimento"
                                    value={novoCliente.vencimento}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecione...</option>
                                    {[...Array(31)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status:</label>
                                <select name="status" value={novoCliente.status} onChange={handleChange}>
                                    <option value="">Selecione...</option>
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                    <option value="Pendente">Pendente</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn-save">Salvar Cliente</button>
                    </form>
                </div>
            </div>
        )}

        <div className="list-section">
          <div className="header-actions">
              <h3>Lista de Clientes ({clientes.length})</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handlePasteFromClipboard} className="btn-novo" style={{ backgroundColor: 'var(--secondary-color)', color: '#000' }}>
                    COLAR
                </button>
                <button onClick={openModal} className="btn-novo">
                    Novo Cliente
                </button>
              </div>
          </div>

          {loading ? <p>Carregando...</p> : (
            <>
                {/* Tabela para Desktop */}
                <div className="table-responsive desktop-view">
                    <table className="clientes-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>CPF</th>
                                <th>Plano</th>
                                <th>Status</th>
                                <th>Adicionado em</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td>{cliente.nome}</td>
                                    <td>{cliente.numeroTelefone}</td>
                                    <td>{cliente.cpf}</td>
                                    <td>{cliente.plano}</td>
                                    <td>
                                        <span className={`status-badge ${cliente.status?.toLowerCase()}`}>
                                            {cliente.status}
                                        </span>
                                    </td>
                                    <td>
                                        {cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button onClick={() => handleEditar(cliente)} className="btn-edit">Editar</button>
                                            <button onClick={() => handleExcluirCliente(cliente.id)} className="btn-delete">Excluir</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {clientes.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{textAlign: 'center'}}>Nenhum cliente encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Cards para Mobile */}
                <div className="mobile-cards-container">
                    {clientes.map((cliente) => (
                        <div key={cliente.id} className="cliente-card">
                            <div className="cliente-card-header">
                                <h4>{cliente.nome}</h4>
                                <span className={`status-badge ${cliente.status?.toLowerCase()}`}>
                                    {cliente.status}
                                </span>
                            </div>
                            <div className="cliente-card-body">
                                <p><strong>Tel:</strong> {cliente.numeroTelefone}</p>
                                <p><strong>CPF:</strong> {cliente.cpf}</p>
                                <p><strong>Plano:</strong> {cliente.plano}</p>
                                <p><strong>End:</strong> {cliente.endereco}</p>
                                <p><strong>Venc:</strong> Dia {cliente.vencimento}</p>
                                <p><strong>Criado em:</strong> {cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString('pt-BR') : '-'}</p>
                            </div>
                            <div className="cliente-card-actions">
                                <button onClick={() => handleEditar(cliente)} className="btn-edit">Editar</button>
                                <button onClick={() => handleExcluirCliente(cliente.id)} className="btn-delete">Excluir</button>
                            </div>
                        </div>
                    ))}
                    {clientes.length === 0 && (
                        <p style={{textAlign: 'center'}}>Nenhum cliente encontrado.</p>
                    )}
                </div>
            </>
          )}
        </div>

        {/* Seção de Planos (Abaixo de Clientes) */}
        <div className="list-section" style={{ marginTop: '30px' }}>
            <div className="header-actions">
                <h3>Gerenciar Planos</h3>
                <button 
                    onClick={() => setShowPlanoForm(!showPlanoForm)}
                    className="btn-novo"
                    style={{ backgroundColor: 'var(--primary-color)', color: '#fff', boxShadow: '0 0 10px rgba(157, 0, 255, 0.3)' }}
                >
                    Novo Plano
                </button>
            </div>

            {/* Formulário de Planos */}
            {showPlanoForm && (
                <div style={{
                    backgroundColor: 'var(--card-bg)',
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    border: '1px solid var(--border-color)'
                }}>
                    <form onSubmit={handleSalvarPlano} style={{ display: 'grid', gap: '15px' }}>
                        <div>
                            <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Nome do Plano</label>
                            <input 
                                type="text" 
                                value={novoPlano.nome} 
                                onChange={(e) => setNovoPlano({...novoPlano, nome: e.target.value})}
                                placeholder="Ex: Internet 500MB"
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', color: 'var(--text-color)' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Valor (R$)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={novoPlano.valor} 
                                onChange={(e) => setNovoPlano({...novoPlano, valor: e.target.value})}
                                placeholder="99.90"
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', color: 'var(--text-color)' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Descrição (Opcional)</label>
                            <input 
                                type="text" 
                                value={novoPlano.descricao} 
                                onChange={(e) => setNovoPlano({...novoPlano, descricao: e.target.value})}
                                placeholder="Detalhes do plano..."
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', color: 'var(--text-color)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                                type="button" 
                                onClick={() => setShowPlanoForm(false)}
                                style={{ padding: '10px 20px', borderRadius: '5px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: 'var(--primary-color)', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(157, 0, 255, 0.3)' }}
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de Planos em Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '20px' 
            }}>
                {planosDisponiveis.map(plano => (
                    <div key={plano.id} style={{
                        backgroundColor: 'var(--card-bg)',
                        padding: '20px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <h3 style={{ margin: 0, color: 'var(--secondary-color)', fontSize: '1.2rem' }}>{plano.nome}</h3>
                            <button 
                                onClick={() => handleExcluirPlano(plano.id)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontWeight: 'bold' }}
                                title="Excluir"
                            >
                                Excluir
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            R$ {plano.valor.toFixed(2)}
                        </div>

                        {plano.descricao && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {plano.descricao}
                            </div>
                        )}
                    </div>
                ))}
                {planosDisponiveis.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>Nenhum plano cadastrado.</p>
                )}
            </div>
        </div>
      </div>
  );
}

export default Clientes;
