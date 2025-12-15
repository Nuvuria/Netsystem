import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import ResponsiveLayout from '../Layout/ResponsiveLayout';
import './Clientes.css';
import '../GlobalLayout.css';

function Clientes() {
  // const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
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
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/clientes`;

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <ResponsiveLayout title="Gerenciar Clientes">
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
                                <input
                                    type="text"
                                    name="plano"
                                    value={novoCliente.plano}
                                    onChange={handleChange}
                                    placeholder="Ex: 100MB"
                                />
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
              <button onClick={openModal} className="btn-novo">
                  <span style={{fontSize: '1.2em'}}>+</span> Novo Cliente
              </button>
          </div>

          {loading ? <p>Carregando...</p> : (
            <>
                {/* Tabela para Desktop */}
                <div className="table-responsive">
                    <table className="clientes-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>CPF</th>
                                <th>Plano</th>
                                <th>Status</th>
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
                                        <button onClick={() => handleEditar(cliente)} className="btn-edit">Editar</button>
                                        <button onClick={() => handleExcluirCliente(cliente.id)} className="btn-delete">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                            {clientes.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{textAlign: 'center'}}>Nenhum cliente encontrado.</td>
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
      </div>
    </ResponsiveLayout>
  );
}

export default Clientes;
